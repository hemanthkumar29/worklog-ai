use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExcelFieldMappingDto {
    pub id: String,
    pub template_id: String,
    pub worklog_field: String,
    pub excel_column_name: String,
    pub excel_column_index: i64,
    pub is_required: bool,
    pub default_value: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExcelTemplateDto {
    pub id: String,
    pub excel_connection_id: String,
    pub name: String,
    pub worksheet_name: String,
    pub header_row_index: i64,
    pub mappings: Vec<ExcelFieldMappingDto>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExcelConnectionDto {
    pub id: String,
    pub name: String,
    pub file_path: String,
    pub file_exists: bool,
    pub last_inspected_at: Option<String>,
    pub templates: Vec<ExcelTemplateDto>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveFieldMappingInput {
    pub worklog_field: String,
    pub excel_column_name: String,
    pub excel_column_index: i64,
    pub is_required: bool,
    pub default_value: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveTemplateInput {
    pub excel_connection_id: String,
    pub name: String,
    pub worksheet_name: String,
    pub header_row_index: i64,
    pub mappings: Vec<SaveFieldMappingInput>,
}

pub struct ExcelRepository;

impl ExcelRepository {
    pub fn get_or_create_connection(conn: &Connection, file_path: &str, name: &str) -> Result<ExcelConnectionDto> {
        let existing = conn.query_row(
            "SELECT id FROM excel_connections WHERE file_path = ?",
            params![file_path],
            |row| row.get::<_, String>(0),
        );

        let id = match existing {
            Ok(existing_id) => {
                let now = chrono::Utc::now().to_rfc3339();
                conn.execute(
                    "UPDATE excel_connections SET name = ?, last_inspected_at = ?, updated_at = ? WHERE id = ?",
                    params![name, now, now, existing_id],
                )?;
                existing_id
            }
            Err(_) => {
                let id = uuid::Uuid::new_v4().to_string();
                let now = chrono::Utc::now().to_rfc3339();
                conn.execute(
                    "INSERT INTO excel_connections (id, name, file_path, file_exists, last_inspected_at, created_at, updated_at)
                     VALUES (?, ?, ?, 1, ?, ?, ?)",
                    params![id, name, file_path, now, now, now],
                )?;
                id
            }
        };

        Self::get_connection_by_id(conn, &id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn list_connections(conn: &Connection) -> Result<Vec<ExcelConnectionDto>> {
        let mut stmt = conn.prepare(
            "SELECT id, name, file_path, file_exists, last_inspected_at, created_at, updated_at
             FROM excel_connections ORDER BY updated_at DESC",
        )?;

        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let file_path: String = row.get(2)?;
            let file_exists: bool = row.get::<_, i64>(3)? != 0;
            let last_inspected_at: Option<String> = row.get(4)?;
            let created_at: String = row.get(5)?;
            let updated_at: String = row.get(6)?;

            let templates = Self::get_templates_for_connection(conn, &id).unwrap_or_default();

            Ok(ExcelConnectionDto {
                id,
                name,
                file_path,
                file_exists,
                last_inspected_at,
                templates,
                created_at,
                updated_at,
            })
        })?;

        let mut list = Vec::new();
        for item in rows {
            list.push(item?);
        }
        Ok(list)
    }

    pub fn get_connection_by_id(conn: &Connection, id: &str) -> Result<Option<ExcelConnectionDto>> {
        let mut stmt = conn.prepare(
            "SELECT id, name, file_path, file_exists, last_inspected_at, created_at, updated_at
             FROM excel_connections WHERE id = ?",
        )?;

        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let file_path: String = row.get(2)?;
            let file_exists: bool = row.get::<_, i64>(3)? != 0;
            let last_inspected_at: Option<String> = row.get(4)?;
            let created_at: String = row.get(5)?;
            let updated_at: String = row.get(6)?;

            let templates = Self::get_templates_for_connection(conn, &id)?;

            Ok(Some(ExcelConnectionDto {
                id,
                name,
                file_path,
                file_exists,
                last_inspected_at,
                templates,
                created_at,
                updated_at,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn save_template(conn: &Connection, input: SaveTemplateInput) -> Result<ExcelTemplateDto> {
        let now = chrono::Utc::now().to_rfc3339();

        // Check if template with this name for connection exists
        let existing = conn.query_row(
            "SELECT id FROM excel_templates WHERE excel_connection_id = ? AND worksheet_name = ?",
            params![input.excel_connection_id, input.worksheet_name],
            |row| row.get::<_, String>(0),
        );

        let template_id = match existing {
            Ok(tid) => {
                conn.execute(
                    "UPDATE excel_templates SET name = ?, header_row_index = ?, updated_at = ? WHERE id = ?",
                    params![input.name, input.header_row_index, now, tid],
                )?;
                conn.execute("DELETE FROM excel_field_mappings WHERE template_id = ?", params![tid])?;
                tid
            }
            Err(_) => {
                let tid = uuid::Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO excel_templates (id, excel_connection_id, name, worksheet_name, header_row_index, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)",
                    params![tid, input.excel_connection_id, input.name, input.worksheet_name, input.header_row_index, now, now],
                )?;
                tid
            }
        };

        // Insert field mappings
        for m in input.mappings {
            let mid = uuid::Uuid::new_v4().to_string();
            let req = if m.is_required { 1 } else { 0 };
            conn.execute(
                "INSERT INTO excel_field_mappings (id, template_id, worklog_field, excel_column_name, excel_column_index, is_required, default_value, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                params![mid, template_id, m.worklog_field, m.excel_column_name, m.excel_column_index, req, m.default_value, now, now],
            )?;
        }

        Self::get_template_by_id(conn, &template_id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn get_template_by_id(conn: &Connection, id: &str) -> Result<Option<ExcelTemplateDto>> {
        let mut stmt = conn.prepare(
            "SELECT id, excel_connection_id, name, worksheet_name, header_row_index, created_at, updated_at
             FROM excel_templates WHERE id = ?",
        )?;

        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let excel_connection_id: String = row.get(1)?;
            let name: String = row.get(2)?;
            let worksheet_name: String = row.get(3)?;
            let header_row_index: i64 = row.get(4)?;
            let created_at: String = row.get(5)?;
            let updated_at: String = row.get(6)?;

            let mappings = Self::get_mappings_for_template(conn, &id)?;

            Ok(Some(ExcelTemplateDto {
                id,
                excel_connection_id,
                name,
                worksheet_name,
                header_row_index,
                mappings,
                created_at,
                updated_at,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn record_sync_job(
        conn: &Connection,
        activity_id: &str,
        excel_connection_id: &str,
        template_id: &str,
        status: &str,
        error_msg: Option<&str>,
        row_index: Option<i64>,
    ) -> Result<()> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO sync_jobs (id, activity_id, excel_connection_id, template_id, status, error_message, row_appended_index, synced_at, retry_count)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
             ON CONFLICT(activity_id, excel_connection_id, template_id) DO UPDATE SET
                status = excluded.status,
                error_message = excluded.error_message,
                row_appended_index = excluded.row_appended_index,
                synced_at = excluded.synced_at,
                retry_count = sync_jobs.retry_count + 1",
            params![id, activity_id, excel_connection_id, template_id, status, error_msg, row_index, now],
        )?;

        Ok(())
    }

    fn get_templates_for_connection(conn: &Connection, conn_id: &str) -> Result<Vec<ExcelTemplateDto>> {
        let mut stmt = conn.prepare(
            "SELECT id, excel_connection_id, name, worksheet_name, header_row_index, created_at, updated_at
             FROM excel_templates WHERE excel_connection_id = ? ORDER BY name ASC",
        )?;

        let rows = stmt.query_map(params![conn_id], |row| {
            let id: String = row.get(0)?;
            let excel_connection_id: String = row.get(1)?;
            let name: String = row.get(2)?;
            let worksheet_name: String = row.get(3)?;
            let header_row_index: i64 = row.get(4)?;
            let created_at: String = row.get(5)?;
            let updated_at: String = row.get(6)?;

            let mappings = Self::get_mappings_for_template(conn, &id).unwrap_or_default();

            Ok(ExcelTemplateDto {
                id,
                excel_connection_id,
                name,
                worksheet_name,
                header_row_index,
                mappings,
                created_at,
                updated_at,
            })
        })?;

        let mut list = Vec::new();
        for t in rows {
            list.push(t?);
        }
        Ok(list)
    }

    fn get_mappings_for_template(conn: &Connection, template_id: &str) -> Result<Vec<ExcelFieldMappingDto>> {
        let mut stmt = conn.prepare(
            "SELECT id, template_id, worklog_field, excel_column_name, excel_column_index, is_required, default_value
             FROM excel_field_mappings WHERE template_id = ? ORDER BY excel_column_index ASC",
        )?;

        let rows = stmt.query_map(params![template_id], |row| {
            Ok(ExcelFieldMappingDto {
                id: row.get(0)?,
                template_id: row.get(1)?,
                worklog_field: row.get(2)?,
                excel_column_name: row.get(3)?,
                excel_column_index: row.get(4)?,
                is_required: row.get::<_, i64>(5)? != 0,
                default_value: row.get(6)?,
            })
        })?;

        let mut list = Vec::new();
        for m in rows {
            list.push(m?);
        }
        Ok(list)
    }
}
