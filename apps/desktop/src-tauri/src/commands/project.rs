use crate::database::{
    CreateProjectInput, DbState, ProjectDto, ProjectRepository, UpdateProjectInput,
};
use tauri::State;

#[tauri::command]
pub fn create_project(state: State<'_, DbState>, input: CreateProjectInput) -> Result<ProjectDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ProjectRepository::create(&conn, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_project(state: State<'_, DbState>, id: String) -> Result<Option<ProjectDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ProjectRepository::get_by_id(&conn, &id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_projects(state: State<'_, DbState>, include_archived: Option<bool>) -> Result<Vec<ProjectDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ProjectRepository::list(&conn, include_archived.unwrap_or(false)).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_project(state: State<'_, DbState>, input: UpdateProjectInput) -> Result<Option<ProjectDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ProjectRepository::update(&conn, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_project(state: State<'_, DbState>, id: String) -> Result<bool, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ProjectRepository::delete(&conn, &id).map_err(|e| e.to_string())
}
