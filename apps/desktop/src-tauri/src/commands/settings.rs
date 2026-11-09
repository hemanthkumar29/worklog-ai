use crate::database::{
    DatabaseStatsDto, DbState, SettingsRepository, UpdateUserProfileInput, UserProfileDto,
};
use tauri::State;

#[tauri::command]
pub fn get_user_profile(state: State<'_, DbState>) -> Result<UserProfileDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    SettingsRepository::get_user_profile(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_user_profile(
    state: State<'_, DbState>,
    input: UpdateUserProfileInput,
) -> Result<UserProfileDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    SettingsRepository::update_user_profile(&conn, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_database_stats(state: State<'_, DbState>) -> Result<DatabaseStatsDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    SettingsRepository::get_database_stats(&conn, &state.db_path, &state.backup_dir).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn wipe_all_data(state: State<'_, DbState>) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    SettingsRepository::wipe_all_data(&conn).map_err(|e| e.to_string())?;
    Ok(true)
}

#[tauri::command]
pub fn get_setting(state: State<'_, DbState>, key: String) -> Result<Option<String>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    Ok(SettingsRepository::get_setting(&conn, &key))
}

#[tauri::command]
pub fn set_setting(state: State<'_, DbState>, key: String, value: String) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    SettingsRepository::set_setting(&conn, &key, &value).map_err(|e| e.to_string())?;
    Ok(true)
}
