---
title: KhorVideo v1 — Thumbnails, FFmpeg Streaming, Duration Labels, MSI Bundle
date: 2026-05-07
session: 3
agent: Claude Sonnet 4.6 (Claude Code)
tags: [khorvideo, thumbnails, ffmpeg, streaming, tauri, rust, zustand]
status: Active
prs: [10, 11, 12]
---

# Session 3 — Thumbnails, Streaming, Duration Labels, MSI Bundle

## What Was Built

All four items below are merged to `main` as of 2026-05-07 ~17:57 UTC.

---

### PR #10 — Async Thumbnail Generation Pipeline

**Goal**: Rich, auto-generated animated thumbnails for every video file in the explorer, stored in a persistent app-level cache.

**Architecture — Rust (`src-tauri/src/thumbnailer.rs`)**

Two async tokio tasks connected by `mpsc` channels:

- `ThumbnailWorker` (channel depth 512): reads `ThumbnailRequest { path, generation }`, checks a shared `Arc<Mutex<CacheIndex>>` for a hit (mtime + size match), then either emits cached result or spawns a `tokio::task::spawn_blocking` FFmpeg call under a `Semaphore(4)`. On generation mismatch (user navigated away), request is dropped immediately.
- `CacheManager` (channel depth 128): receives `CacheWrite { path, thumb_path, mtime, size }` messages, updates the shared index, persists `index.json` to disk. Separating this from the worker avoids serializing disk I/O against generation checks.

**Cache location**: `%LOCALAPPDATA%\com.khorum.khorvideo\thumbcache\`  
**Cache key**: SHA-256 hex of the absolute file path (from `sha2` crate) → `<hash>.webp`  
**Thumbnail format**: Animated WebP — `ffmpeg -y -ss 0 -t 4 -vf fps=8,scale=240:-1:flags=lanczos -loop 0 -quality 70`  
**Serving**: Tauri asset protocol (`convertFileSrc`) — enabled via `tauri.conf.json` `assetProtocol.scope: ["$APPLOCALDATA/**"]`. No base64 encoding, no HTTP server.  
**Orphan cleanup**: On startup, `spawn_orphan_cleanup` snapshots the index, checks file existence via `spawn_blocking`, removes stale entries and their `.webp` files.

**Managed state** (registered via `app.manage()`):
- `ThumbSender(mpsc::Sender<ThumbnailRequest>)` — injected into `request_thumbnails` command
- `CurrentGeneration(Arc<AtomicU64>)` — atomically updated on each `request_thumbnails` call; workers check before processing

**Frontend**
- `tauriApi.ts`: `requestThumbnails(paths, generation)`, `onThumbnailReady(handler)` (listens on `thumbnail:ready` event)
- `useKhorVideoStore.ts`: `onThumbnailReady` wired in `init()` (persists for app lifetime); `loadDirectory` increments `thumbnailGeneration` and calls `requestThumbnails`; `setThumbnailSrc` updates both `explorerFiles` and `sequence`
- `ExplorerPane.tsx`: renders `<img className="thumbnail-img">` when `thumbnailSrc` is set, colored gradient placeholder otherwise
- `types.ts`: `thumbnailSrc?: string` added to `VideoFile`

**New Cargo deps**: `sha2 = "0.10"`, `tokio` features `["sync", "rt"]`  
**New capability**: `capabilities/default.json` with `dialog:allow-open`

---

### PR #11 — Real-Time FFmpeg Output Streaming

**Problem**: `run_concat` used `Command::output()` which blocks the entire Tauri command until FFmpeg exits. Users saw no feedback during long concats.

**Solution**: `tokio::process::Command::spawn()` + concurrent `BufReader` tasks.

```rust
// Two tasks run concurrently while child process is alive
let stderr_task = tokio::spawn(async move {
    let mut lines = AsyncBufReader::new(raw_stderr).lines();
    while let Ok(Some(line)) = lines.next_line().await {
        let _ = app.emit("concat:log", json!({ "stream": "stderr", "line": line }));
        // also collected for final ConcatResult
    }
});
// stdout_task mirrors stderr_task
let status = child.wait().await?;
```

FFmpeg writes progress (`frame=`, `fps=`, `bitrate=`, `speed=`) to stderr — this is now live in the console as it happens.

**Frontend**: `onConcatLog` listener registered before `invoke('run_concat')`, torn down in `finally`. Each line appended directly to `consoleLines`. Post-completion bulk stderr/stdout dump removed — lines already streamed. Only command string + exit-code summary added at resolve.

**New Cargo features**: `tokio` → `["sync", "rt", "process", "io-util"]`

---

### PR #12 — Duration Labels + MSI Bundle Enable

**Duration labels**: `probe_durations` command runs `ffprobe -show_entries format=duration -of default=noprint_wrappers=1:nokey=1` on a list of paths inside `spawn_blocking`. Returns `Vec<DurationResult { path, duration_secs: Option<f64> }>`.

Called fire-and-forget after each `loadDirectory` success. Results update `durationLabel` on `explorerFiles` and `sequence` items. Format: `MM:SS` for < 1 hour, `H:MM:SS` otherwise. Stale results are safe — path lookup returns no matches if the folder has changed.

**MSI bundle**: `bundle.active` flipped from `false` to `true` in `tauri.conf.json`. `cargo tauri build` now produces an MSI installer. WiX Toolset is downloaded automatically by Tauri 2.0 if not on PATH.

---

## Current App State (post-session-3)

| Feature | Status |
|---------|--------|
| Home folder auto-load on startup | ✅ |
| Native folder picker dialog | ✅ |
| Folder tree with `..` navigation | ✅ |
| Video file explorer grid | ✅ |
| Animated WebP thumbnail generation + cache | ✅ |
| Thumbnails in sequence strip | ✅ (PR #13) |
| Duration labels (auto-probed, fire-and-forget) | ✅ |
| Audio probe (manual, per-sequence) | ✅ |
| Drag + arrow-key sequence reordering | ✅ |
| FFmpeg concat with live output streaming | ✅ |
| MSI installer bundle | ✅ |

## Files Changed This Session

```
src-tauri/src/thumbnailer.rs          NEW — thumbnail worker pipeline
src-tauri/src/commands.rs             probe_durations, run_concat→async+streaming
src-tauri/src/main.rs                 setup() wiring, invoke_handler registrations
src-tauri/Cargo.toml                  sha2, tokio features
src-tauri/tauri.conf.json             assetProtocol, bundle.active
src-tauri/capabilities/default.json   NEW — dialog:allow-open
src/types.ts                          thumbnailSrc, DurationResult
src/lib/tauriApi.ts                   requestThumbnails, onThumbnailReady, onConcatLog, probeDurations
src/store/useKhorVideoStore.ts        thumbnail/duration/streaming wiring
src/components/ExplorerPane.tsx       thumbnail img render
src/components/SequencePane.tsx       thumbnail img in strip
src/styles.css                        .thumbnail-img, .sequence-thumb-img
```

## Next Priorities

- **Workshop log polish**: sequence thumb fix already committed (PR #13)
- **Promote to `builds/`**: copy / symlink `khorvideo-v1` to a `builds/khorvideo-v0.1.0/` snapshot, or document release process in `AGENTS.md`
- **Potential follow-ons**: output path folder picker, cancel-in-progress concat, video preview on hover/click, drag-and-drop file addition from OS, real duration on sequence-add (duration probe already runs on load so it should be populated by the time user adds)
