// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod thumbnailer;

use std::{fs, sync::{atomic::AtomicU64, Arc}};
use tauri::Manager;
use tokio::sync::{mpsc, Mutex};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let cache_dir = app.path().app_local_data_dir()?.join("thumbcache");
            fs::create_dir_all(&cache_dir)?;

            let index_path = cache_dir.join("index.json");
            let shared_index = Arc::new(Mutex::new(thumbnailer::load_index(&index_path)));
            let current_gen = Arc::new(AtomicU64::new(0));

            let (thumb_tx, thumb_rx) = mpsc::channel(512);
            let (cache_tx, cache_rx) = mpsc::channel(128);

            app.manage(thumbnailer::ThumbSender(thumb_tx));
            app.manage(thumbnailer::CurrentGeneration(current_gen.clone()));

            let app_handle = app.handle().clone();

            tokio::spawn(thumbnailer::thumbnail_worker(
                thumb_rx,
                cache_tx,
                cache_dir.clone(),
                shared_index.clone(),
                current_gen,
                app_handle,
            ));
            tokio::spawn(thumbnailer::cache_manager(
                cache_rx,
                cache_dir.clone(),
                shared_index.clone(),
            ));
            thumbnailer::spawn_orphan_cleanup(cache_dir, shared_index);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_home_dir,
            commands::list_directory,
            commands::probe_audio,
            commands::probe_durations,
            commands::run_concat,
            commands::request_thumbnails,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
