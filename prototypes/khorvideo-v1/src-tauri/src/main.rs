// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_home_dir,
            commands::list_directory,
            commands::probe_audio,
            commands::run_concat
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
