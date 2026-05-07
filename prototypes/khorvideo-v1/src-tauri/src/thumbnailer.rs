use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
    process::{Command, Stdio},
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc,
    },
    time::UNIX_EPOCH,
};

use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Emitter};
use tokio::sync::{mpsc, Mutex, Semaphore};

const MAX_CONCURRENT: usize = 4;

// ── public state types (managed by Tauri) ────────────────────────────────────

pub struct ThumbSender(pub mpsc::Sender<ThumbnailRequest>);
pub struct CurrentGeneration(pub Arc<AtomicU64>);

// ── message types ─────────────────────────────────────────────────────────────

pub struct ThumbnailRequest {
    pub path: String,
    pub generation: u64,
}

pub struct CacheWrite {
    pub original_path: String,
    pub mtime: u64,
    pub size: u64,
    pub thumb_name: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailReadyPayload {
    pub path: String,
    pub thumb_path: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailErrorPayload {
    pub path: String,
    pub error: String,
}

// ── cache index ───────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IndexEntry {
    pub path: String,
    pub mtime: u64,
    pub size: u64,
    pub thumb: String,
}

pub type CacheIndex = HashMap<String, IndexEntry>;

pub fn load_index(path: &Path) -> CacheIndex {
    fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn save_index(path: &Path, index: &CacheIndex) {
    if let Ok(json) = serde_json::to_string_pretty(index) {
        let _ = fs::write(path, json);
    }
}

// ── helpers ───────────────────────────────────────────────────────────────────

pub fn path_hash(path: &str) -> String {
    let mut h = Sha256::new();
    h.update(path.as_bytes());
    format!("{:x}", h.finalize())
}

fn file_mtime_size(path: &Path) -> Option<(u64, u64)> {
    let meta = fs::metadata(path).ok()?;
    let mtime = meta
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_secs();
    Some((mtime, meta.len()))
}

fn is_video(path: &Path) -> bool {
    matches!(
        path.extension()
            .and_then(|e| e.to_str())
            .map(|e| e.to_ascii_lowercase())
            .as_deref(),
        Some("mp4" | "mov" | "mkv" | "avi" | "webm" | "wmv" | "m4v")
    )
}

// ── thumbnail generation (blocking) ──────────────────────────────────────────

fn generate_thumb(input: &Path, output: &Path) -> Result<(), String> {
    // VP8 WebM: 4 s clip, 8 fps, 240 px wide — -2 forces even height required by libvpx
    let vf = "fps=8,scale=240:-2:flags=lanczos";
    let out = Command::new("ffmpeg")
        .args([
            "-y",
            "-ss",
            "0",
            "-t",
            "4",
            "-i",
            &input.to_string_lossy(),
            "-vf",
            vf,
            "-c:v",
            "libvpx",
            "-b:v",
            "300k",
            "-an",
            &output.to_string_lossy(),
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::piped())
        .output()
        .map_err(|e| format!("failed to spawn ffmpeg: {e}"))?;

    if out.status.success() {
        Ok(())
    } else {
        Err(String::from_utf8_lossy(&out.stderr).trim().to_owned())
    }
}

// Returns Ok(Some(...)) on success, Ok(None) if path is not a video, Err(msg) on ffmpeg failure
fn do_generate(path: &Path, cache_dir: &Path, hash: &str) -> Result<Option<(String, u64, u64)>, String> {
    if !is_video(path) {
        return Ok(None);
    }
    let (mtime, size) = file_mtime_size(path).ok_or_else(|| "could not read file metadata".to_owned())?;
    let thumb_name = format!("{}.webm", hash);
    let thumb_path = cache_dir.join(&thumb_name);
    generate_thumb(path, &thumb_path)?;
    Ok(Some((thumb_name, mtime, size)))
}

// ── thumbnail worker ──────────────────────────────────────────────────────────

pub async fn thumbnail_worker(
    mut rx: mpsc::Receiver<ThumbnailRequest>,
    cache_tx: mpsc::Sender<CacheWrite>,
    cache_dir: PathBuf,
    index: Arc<Mutex<CacheIndex>>,
    current_gen: Arc<AtomicU64>,
    app: AppHandle,
) {
    let sem = Arc::new(Semaphore::new(MAX_CONCURRENT));

    while let Some(req) = rx.recv().await {
        if req.generation != current_gen.load(Ordering::Relaxed) {
            continue;
        }

        let path = PathBuf::from(&req.path);
        let hash = path_hash(&req.path);
        let gen = req.generation;

        // Cache hit check — hold lock only briefly
        let cached = {
            let idx = index.lock().await;
            idx.get(&hash).and_then(|entry| {
                file_mtime_size(&path).and_then(|(mtime, size)| {
                    if entry.mtime == mtime && entry.size == size {
                        Some(cache_dir.join(&entry.thumb))
                    } else {
                        None
                    }
                })
            })
        };

        if let Some(thumb_path) = cached {
            if thumb_path.exists() {
                let _ = app.emit(
                    "thumbnail:ready",
                    ThumbnailReadyPayload {
                        path: req.path,
                        thumb_path: thumb_path.to_string_lossy().into_owned(),
                    },
                );
                continue;
            }
        }

        // Spawn generation task
        let sem = sem.clone();
        let cache_tx = cache_tx.clone();
        let cache_dir = cache_dir.clone();
        let current_gen = current_gen.clone();
        let app = app.clone();
        let original_path = req.path.clone();

        tauri::async_runtime::spawn(async move {
            let _permit = sem.acquire().await.unwrap();

            // Re-check generation after acquiring the semaphore slot
            if gen != current_gen.load(Ordering::Relaxed) {
                return;
            }

            let path_c = path.clone();
            let cache_dir_c = cache_dir.clone();
            let hash_c = hash.clone();

            let result = tauri::async_runtime::spawn_blocking(move || {
                do_generate(&path_c, &cache_dir_c, &hash_c)
            })
            .await;

            match result {
                Ok(Ok(Some((thumb_name, mtime, size)))) => {
                    let thumb_path = cache_dir.join(&thumb_name);
                    let _ = app.emit(
                        "thumbnail:ready",
                        ThumbnailReadyPayload {
                            path: original_path.clone(),
                            thumb_path: thumb_path.to_string_lossy().into_owned(),
                        },
                    );
                    let _ = cache_tx
                        .send(CacheWrite {
                            original_path,
                            mtime,
                            size,
                            thumb_name,
                        })
                        .await;
                }
                Ok(Err(error)) => {
                    let _ = app.emit(
                        "thumbnail:error",
                        ThumbnailErrorPayload { path: original_path, error },
                    );
                }
                _ => {}
            }
        });
    }
}

// ── cache manager ─────────────────────────────────────────────────────────────

pub async fn cache_manager(
    mut rx: mpsc::Receiver<CacheWrite>,
    cache_dir: PathBuf,
    index: Arc<Mutex<CacheIndex>>,
) {
    let index_path = cache_dir.join("index.json");

    while let Some(write) = rx.recv().await {
        let hash = path_hash(&write.original_path);
        let mut idx = index.lock().await;
        idx.insert(
            hash,
            IndexEntry {
                path: write.original_path,
                mtime: write.mtime,
                size: write.size,
                thumb: write.thumb_name,
            },
        );
        save_index(&index_path, &idx);
    }
}

// ── orphan cleanup (fire-and-forget at startup) ───────────────────────────────

pub fn spawn_orphan_cleanup(cache_dir: PathBuf, index: Arc<Mutex<CacheIndex>>) {
    tauri::async_runtime::spawn(async move {
        // Snapshot without holding the lock
        let snapshot: Vec<(String, String, String)> = {
            let idx = index.lock().await;
            idx.iter()
                .map(|(h, e)| (h.clone(), e.path.clone(), e.thumb.clone()))
                .collect()
        };

        let cache_dir_c = cache_dir.clone();
        let orphans: Vec<(String, String)> = tauri::async_runtime::spawn_blocking(move || {
            snapshot
                .into_iter()
                .filter(|(_, path, thumb)| {
                    !Path::new(path).exists() || !cache_dir_c.join(thumb).exists()
                })
                .map(|(hash, _, thumb)| (hash, thumb))
                .collect()
        })
        .await
        .unwrap_or_default();

        if orphans.is_empty() {
            return;
        }

        for (_, thumb) in &orphans {
            let _ = fs::remove_file(cache_dir.join(thumb));
        }

        let index_path = cache_dir.join("index.json");
        let mut idx = index.lock().await;
        for (hash, _) in &orphans {
            idx.remove(hash);
        }
        save_index(&index_path, &idx);
    });
}
