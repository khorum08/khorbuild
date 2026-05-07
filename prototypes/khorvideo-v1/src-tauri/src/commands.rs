use crate::thumbnailer::{CurrentGeneration, ThumbnailRequest, ThumbSender};
use serde::{Deserialize, Serialize};
use std::{
    fs,
    io::Write,
    path::Path,
    process::{Command, Stdio},
    sync::atomic::Ordering,
};
use tauri::Emitter;
use tokio::io::{AsyncBufReadExt, BufReader as AsyncBufReader};
use tokio::process::Command as AsyncCommand;
#[cfg(windows)]
use std::os::windows::process::CommandExt;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirectoryEntry {
    name: String,
    path: String,
    extension: Option<String>,
    is_directory: bool,
    is_video: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProbeResult {
    path: String,
    has_audio: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DurationResult {
    path: String,
    duration_secs: Option<f64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcatJob {
    input_paths: Vec<String>,
    output_path: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ConcatResult {
    command: String,
    output_path: String,
    exit_code: Option<i32>,
    stdout: String,
    stderr: String,
}

const VIDEO_EXTENSIONS: &[&str] = &["avi", "m4v", "mkv", "mov", "mp4", "webm", "wmv"];

#[tauri::command]
pub fn get_home_dir() -> Result<String, String> {
    std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .map_err(|_| "Could not determine home directory".to_owned())
}

#[tauri::command]
pub fn list_directory(path: String) -> Result<Vec<DirectoryEntry>, String> {
    let directory = Path::new(&path);

    if !directory.is_dir() {
        return Err(format!("Path is not a directory: {path}"));
    }

    let mut entries = Vec::new();

    for entry in fs::read_dir(directory).map_err(|error| error.to_string())? {
        let entry = entry.map_err(|error| error.to_string())?;
        let metadata = entry.metadata().map_err(|error| error.to_string())?;
        let path = entry.path();
        let extension = path
            .extension()
            .and_then(|extension| extension.to_str())
            .map(|extension| extension.to_ascii_lowercase());
        let is_video = metadata.is_file()
            && extension
                .as_deref()
                .is_some_and(|extension| VIDEO_EXTENSIONS.contains(&extension));

        if !metadata.is_dir() && !is_video {
            continue;
        }

        entries.push(DirectoryEntry {
            name: entry.file_name().to_string_lossy().into_owned(),
            path: path.to_string_lossy().into_owned(),
            extension,
            is_directory: metadata.is_dir(),
            is_video,
        });
    }

    entries.sort_by(|left, right| {
        right
            .is_directory
            .cmp(&left.is_directory)
            .then_with(|| left.name.to_lowercase().cmp(&right.name.to_lowercase()))
    });
    Ok(entries)
}

#[tauri::command]
pub fn probe_audio(path: String) -> Result<ProbeResult, String> {
    if !Path::new(&path).is_file() {
        return Err(format!("Path is not a file: {path}"));
    }

    let output = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=index",
            "-of",
            "csv=p=0",
            &path,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .map_err(|error| format!("failed to run ffprobe: {error}"))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).trim().to_owned());
    }

    Ok(ProbeResult {
        path,
        has_audio: !String::from_utf8_lossy(&output.stdout).trim().is_empty(),
    })
}

fn probe_duration_secs(path: &str) -> Option<f64> {
    let output = Command::new("ffprobe")
        .args([
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            path,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NO_WINDOW)
        .output()
        .ok()?;
    let raw = String::from_utf8_lossy(&output.stdout);
    let secs: f64 = raw.trim().parse().ok()?;
    if secs.is_finite() && secs > 0.0 { Some(secs) } else { None }
}

#[tauri::command]
pub async fn probe_durations(paths: Vec<String>) -> Result<Vec<DurationResult>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        paths
            .into_iter()
            .map(|path| {
                let duration_secs = probe_duration_secs(&path);
                DurationResult { path, duration_secs }
            })
            .collect()
    })
    .await
    .map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn run_concat(job: ConcatJob, app: tauri::AppHandle) -> Result<ConcatResult, String> {
    if job.input_paths.len() < 2 {
        return Err("At least two input files are required for concat".to_owned());
    }

    if job.output_path.trim().is_empty() {
        return Err("Output path is required".to_owned());
    }

    for input_path in &job.input_paths {
        if !Path::new(input_path).is_file() {
            return Err(format!("Input path is not a file: {input_path}"));
        }
    }

    let concat_list_path = std::env::temp_dir().join(format!(
        "khorvideo-concat-{}.txt",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map_err(|error| error.to_string())?
            .as_millis()
    ));

    let mut concat_list = fs::File::create(&concat_list_path).map_err(|error| error.to_string())?;
    for input_path in &job.input_paths {
        writeln!(concat_list, "file '{}'", escape_concat_path(input_path))
            .map_err(|error| error.to_string())?;
    }

    let concat_list_arg = concat_list_path.to_string_lossy().into_owned();
    let command = format!(
        "ffmpeg -hide_banner -y -f concat -safe 0 -i \"{}\" -c copy \"{}\"",
        concat_list_arg, job.output_path
    );

    let mut child = AsyncCommand::new("ffmpeg")
        .args([
            "-hide_banner",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            &concat_list_arg,
            "-c",
            "copy",
            &job.output_path,
        ])
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .creation_flags(CREATE_NO_WINDOW)
        .spawn()
        .map_err(|error| format!("failed to spawn ffmpeg: {error}"))?;

    let raw_stderr = child.stderr.take().unwrap();
    let raw_stdout = child.stdout.take().unwrap();

    let app_for_stderr = app.clone();
    let stderr_task = tauri::async_runtime::spawn(async move {
        let mut lines = AsyncBufReader::new(raw_stderr).lines();
        let mut collected = String::new();
        while let Ok(Some(line)) = lines.next_line().await {
            let _ = app_for_stderr.emit("concat:log", serde_json::json!({ "stream": "stderr", "line": line }));
            if !collected.is_empty() {
                collected.push('\n');
            }
            collected.push_str(&line);
        }
        collected
    });

    let app_for_stdout = app.clone();
    let stdout_task = tauri::async_runtime::spawn(async move {
        let mut lines = AsyncBufReader::new(raw_stdout).lines();
        let mut collected = String::new();
        while let Ok(Some(line)) = lines.next_line().await {
            let _ = app_for_stdout.emit("concat:log", serde_json::json!({ "stream": "stdout", "line": line }));
            if !collected.is_empty() {
                collected.push('\n');
            }
            collected.push_str(&line);
        }
        collected
    });

    let status = child.wait().await.map_err(|error| error.to_string())?;
    let stderr = stderr_task.await.unwrap_or_default();
    let stdout = stdout_task.await.unwrap_or_default();

    let _ = fs::remove_file(&concat_list_path);

    Ok(ConcatResult {
        command,
        output_path: job.output_path,
        exit_code: status.code(),
        stdout,
        stderr,
    })
}

fn escape_concat_path(path: &str) -> String {
    path.replace('\\', "/").replace('\'', "'\\''")
}

#[tauri::command]
pub async fn request_thumbnails(
    paths: Vec<String>,
    generation: u64,
    sender: tauri::State<'_, ThumbSender>,
    current_gen: tauri::State<'_, CurrentGeneration>,
) -> Result<(), String> {
    current_gen.0.store(generation, Ordering::Relaxed);
    let tx = sender.0.clone();
    for path in paths {
        tx.send(ThumbnailRequest { path, generation })
            .await
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
