use crate::database::{
    ActivityDto, ActivityFilter, ActivityRepository, CreateActivityInput, DbState, UpdateActivityInput,
};
use tauri::State;

#[tauri::command]
pub fn create_activity(state: State<'_, DbState>, input: CreateActivityInput) -> Result<ActivityDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ActivityRepository::create(&conn, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_activity(state: State<'_, DbState>, id: String) -> Result<Option<ActivityDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ActivityRepository::get_by_id(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_activities(state: State<'_, DbState>, filter: ActivityFilter) -> Result<Vec<ActivityDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ActivityRepository::list(&conn, filter).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_activity(state: State<'_, DbState>, input: UpdateActivityInput) -> Result<Option<ActivityDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ActivityRepository::update(&conn, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_activity(state: State<'_, DbState>, id: String) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ActivityRepository::delete(&conn, &id).map_err(|e| e.to_string())
}
