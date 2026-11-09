use crate::database::{
    ActivityRepository, DbState, ExcelConnectionDto, ExcelRepository, ExcelTemplateDto,
    SaveTemplateInput, SettingsRepository,
};
use crate::excel::{AppendRowResultDto, ColumnMapper, ExcelInspector, ExcelWriter, SuggestedMapping, WorkbookInspectionDto};
use std::collections::HashMap;
use tauri::State;

#[tauri::command]
pub fn inspect_workbook(
    state: State<'_, DbState>,
    file_path: String,
    save_connection: Option<bool>,
) -> Result<WorkbookInspectionDto, String> {
    let inspection = ExcelInspector::inspect(&file_path)?;

    if save_connection.unwrap_or(true) {
        if let Ok(conn) = state.conn.lock() {
            let _ = ExcelRepository::get_or_create_connection(&conn, &file_path, &inspection.file_name);
        }
    }

    Ok(inspection)
}

#[tauri::command]
pub fn suggest_column_mappings(headers: Vec<String>) -> Result<Vec<SuggestedMapping>, String> {
    Ok(ColumnMapper::suggest_mappings(&headers))
}

#[tauri::command]
pub fn save_excel_template(
    state: State<'_, DbState>,
    input: SaveTemplateInput,
) -> Result<ExcelTemplateDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ExcelRepository::save_template(&conn, input).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn list_excel_connections(state: State<'_, DbState>) -> Result<Vec<ExcelConnectionDto>, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;
    ExcelRepository::list_connections(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn sync_activity_to_excel(
    state: State<'_, DbState>,
    activity_id: String,
    template_id: String,
) -> Result<AppendRowResultDto, String> {
    let conn = state.conn.lock().map_err(|e| e.to_string())?;

    // 1. Fetch activity
    let activity = ActivityRepository::get_by_id(&conn, &activity_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Activity not found: {}", activity_id))?;

    // 2. Fetch template
    let template = ExcelRepository::get_template_by_id(&conn, &template_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Excel template not found: {}", template_id))?;

    // 3. Fetch connection to get file_path
    let connection = ExcelRepository::get_connection_by_id(&conn, &template.excel_connection_id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "Excel connection not found".to_string())?;

    // 4. Fetch user profile for employee name
    let user = SettingsRepository::get_user_profile(&conn).ok();
    let employee_name = user.map(|u| u.display_name).unwrap_or_else(|| "Employee".to_string());

    // 5. Build column index -> value map based on template mappings
    let mut column_values: HashMap<usize, String> = HashMap::new();

    for mapping in &template.mappings {
        let col_idx = mapping.excel_column_index as usize;
        let value = match mapping.worklog_field.as_str() {
            "activityDate" => activity.activity_date.clone(),
            "employeeName" => employee_name.clone(),
            "projectName" => activity.project_name.clone().unwrap_or_default(),
            "activityTitle" => activity.activity_title.clone(),
            "description" => activity.enhanced_description.clone(),
            "activityType" => activity.activity_type.clone(),
            "technologies" => activity.technologies.join(", "),
            "timeSpentHours" => {
                if let Some(mins) = activity.time_spent_minutes {
                    format!("{:.2}", mins as f64 / 60.0)
                } else {
                    mapping.default_value.clone().unwrap_or_default()
                }
            }
            "timeSpentMinutes" => {
                if let Some(mins) = activity.time_spent_minutes {
                    mins.to_string()
                } else {
                    mapping.default_value.clone().unwrap_or_default()
                }
            }
            "status" => activity.status.clone(),
            "challenges" => activity.challenges.join("; "),
            "nextSteps" => activity.next_steps.join("; "),
            "detailedTasks" => activity.tasks.join("\n"),
            _ => mapping.default_value.clone().unwrap_or_default(),
        };

        column_values.insert(col_idx, value);
    }

    // 6. Execute safe atomic append
    let write_result = ExcelWriter::append_row(
        &connection.file_path,
        &template.worksheet_name,
        &column_values,
        &state.backup_dir,
    );

    match write_result {
        Ok(res) => {
            // Update activity status to SYNCED
            let _ = ActivityRepository::update_sync_status(&conn, &activity_id, "SYNCED");
            // Record sync job
            let _ = ExcelRepository::record_sync_job(
                &conn,
                &activity_id,
                &connection.id,
                &template.id,
                "SUCCESS",
                None,
                Some(res.row_number as i64),
            );
            Ok(res)
        }
        Err(err) => {
            let _ = ActivityRepository::update_sync_status(&conn, &activity_id, "FAILED");
            let _ = ExcelRepository::record_sync_job(
                &conn,
                &activity_id,
                &connection.id,
                &template.id,
                "FAILED",
                Some(&err),
                None,
            );
            Err(err)
        }
    }
}
