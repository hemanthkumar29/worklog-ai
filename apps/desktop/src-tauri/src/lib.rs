pub mod ai;
pub mod commands;
pub mod database;
pub mod excel;

use database::init_database;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .setup(|app| {
            let db_state = init_database(&app.handle())
                .expect("Failed to initialize local SQLite database");
            app.manage(db_state);
            log::info!("WorkLog AI initialized successfully.");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_activity,
            commands::get_activity,
            commands::list_activities,
            commands::update_activity,
            commands::delete_activity,
            commands::create_project,
            commands::get_project,
            commands::list_projects,
            commands::update_project,
            commands::delete_project,
            commands::inspect_workbook,
            commands::suggest_column_mappings,
            commands::save_excel_template,
            commands::list_excel_connections,
            commands::sync_activity_to_excel,
            commands::get_hardware_profile,
            commands::enhance_activity_text,
            commands::get_user_profile,
            commands::update_user_profile,
            commands::get_database_stats,
            commands::wipe_all_data,
            commands::get_setting,
            commands::set_setting,
        ])
        .run(tauri::generate_context!())
        .expect("error while running WorkLog AI application");
}
