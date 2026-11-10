pub mod ai;
pub mod commands;
pub mod database;
pub mod excel;

use database::init_database;
use tauri::Manager;
use tauri_plugin_global_shortcut::ShortcutState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcut("CommandOrControl+Shift+Space")
                .expect("Failed to register default quick-capture shortcut")
                .with_handler(|app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("quick-capture") {
                            if window.is_visible().unwrap_or(false) {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.center();
                                let _ = window.set_focus();
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            let db_state = init_database(&app.handle())
                .expect("Failed to initialize local SQLite database");
            app.manage(db_state);

            // Configure System Tray
            let quick_capture_item = tauri::menu::MenuItem::with_id(
                app,
                "quick_capture",
                "Quick Capture (⌘+Shift+Space)",
                true,
                None::<&str>,
            )?;
            let dashboard_item = tauri::menu::MenuItem::with_id(
                app,
                "dashboard",
                "Open Dashboard",
                true,
                None::<&str>,
            )?;
            let separator = tauri::menu::PredefinedMenuItem::separator(app)?;
            let quit_item = tauri::menu::MenuItem::with_id(
                app,
                "quit",
                "Quit WorkLog AI",
                true,
                None::<&str>,
            )?;

            let tray_menu = tauri::menu::Menu::with_items(
                app,
                &[&quick_capture_item, &dashboard_item, &separator, &quit_item],
            )?;

            if let Some(icon) = app.default_window_icon() {
                let _tray = tauri::tray::TrayIconBuilder::new()
                    .icon(icon.clone())
                    .menu(&tray_menu)
                    .show_menu_on_left_click(true)
                    .on_menu_event(|app, event| {
                        match event.id().as_ref() {
                            "quick_capture" => {
                                if let Some(window) = app.get_webview_window("quick-capture") {
                                    let _ = window.show();
                                    let _ = window.center();
                                    let _ = window.set_focus();
                                }
                            }
                            "dashboard" => {
                                if let Some(window) = app.get_webview_window("main") {
                                    let _ = window.show();
                                    let _ = window.center();
                                    let _ = window.set_focus();
                                }
                            }
                            "quit" => {
                                app.exit(0);
                            }
                            _ => {}
                        }
                    })
                    .build(app)?;
            }

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
            commands::toggle_quick_capture,
            commands::hide_quick_capture,
            commands::show_quick_capture,
            commands::open_dashboard,
            commands::hide_dashboard,
        ])
        .run(tauri::generate_context!())
        .expect("error while running WorkLog AI application");
}
