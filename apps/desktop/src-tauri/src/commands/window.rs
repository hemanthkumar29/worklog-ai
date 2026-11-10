use tauri::{AppHandle, Manager};

#[tauri::command]
pub fn toggle_quick_capture(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("quick-capture") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.center();
            let _ = window.set_focus();
        }
    }
    Ok(())
}

#[tauri::command]
pub fn hide_quick_capture(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("quick-capture") {
        let _ = window.hide();
    }
    Ok(())
}

#[tauri::command]
pub fn show_quick_capture(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("quick-capture") {
        let _ = window.show();
        let _ = window.center();
        let _ = window.set_focus();
    }
    Ok(())
}

#[tauri::command]
pub fn open_dashboard(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.center();
        let _ = window.set_focus();
    }
    Ok(())
}

#[tauri::command]
pub fn hide_dashboard(app: AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
    Ok(())
}

