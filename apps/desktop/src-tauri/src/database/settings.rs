use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserProfileDto {
    pub id: String,
    pub display_name: String,
    pub date_format: String,
    pub default_project_id: Option<String>,
    pub default_excel_connection_id: Option<String>,
    pub is_onboarded: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateUserProfileInput {
    pub display_name: Option<String>,
    pub date_format: Option<String>,
    pub default_project_id: Option<String>,
    pub default_excel_connection_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DatabaseStatsDto {
    pub total_activities: i64,
    pub total_projects: i64,
    pub total_excel_connections: i64,
    pub db_size_bytes: u64,
    pub db_path: String,
    pub backup_dir: String,
}

pub struct SettingsRepository;

impl SettingsRepository {
    pub fn get_user_profile(conn: &Connection) -> Result<UserProfileDto> {
        let mut stmt = conn.prepare(
            "SELECT id, display_name, date_format, default_project_id, default_excel_connection_id, created_at, updated_at
             FROM users LIMIT 1",
        )?;

        let mut rows = stmt.query([])?;
        if let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let display_name: String = row.get(1)?;
            let date_format: String = row.get(2)?;
            let default_project_id: Option<String> = row.get(3)?;
            let default_excel_connection_id: Option<String> = row.get(4)?;
            let created_at: String = row.get(5)?;
            let updated_at: String = row.get(6)?;

            let is_onboarded = Self::get_setting(conn, "is_onboarded")
                .map(|val| val == "true")
                .unwrap_or(false);

            Ok(UserProfileDto {
                id,
                display_name,
                date_format,
                default_project_id,
                default_excel_connection_id,
                is_onboarded,
                created_at,
                updated_at,
            })
        } else {
            Err(rusqlite::Error::QueryReturnedNoRows)
        }
    }

    pub fn update_user_profile(conn: &Connection, input: UpdateUserProfileInput) -> Result<UserProfileDto> {
        let now = chrono::Utc::now().to_rfc3339();

        if let Some(ref name) = input.display_name {
            conn.execute("UPDATE users SET display_name = ?, updated_at = ?", params![name, now])?;
        }
        if let Some(ref df) = input.date_format {
            conn.execute("UPDATE users SET date_format = ?, updated_at = ?", params![df, now])?;
        }
        if let Some(ref pid) = input.default_project_id {
            conn.execute("UPDATE users SET default_project_id = ?, updated_at = ?", params![pid, now])?;
        }
        if let Some(ref eid) = input.default_excel_connection_id {
            conn.execute("UPDATE users SET default_excel_connection_id = ?, updated_at = ?", params![eid, now])?;
        }

        Self::get_user_profile(conn)
    }

    pub fn get_setting(conn: &Connection, key: &str) -> Option<String> {
        conn.query_row(
            "SELECT value FROM application_settings WHERE key = ?",
            params![key],
            |row| row.get(0),
        ).ok()
    }

    pub fn set_setting(conn: &Connection, key: &str, value: &str) -> Result<()> {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO application_settings (key, value, updated_at) VALUES (?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at",
            params![key, value, now],
        )?;
        Ok(())
    }

    pub fn get_database_stats(conn: &Connection, db_path: &std::path::Path, backup_dir: &std::path::Path) -> Result<DatabaseStatsDto> {
        let total_activities: i64 = conn.query_row("SELECT COUNT(*) FROM activities", [], |row| row.get(0)).unwrap_or(0);
        let total_projects: i64 = conn.query_row("SELECT COUNT(*) FROM projects", [], |row| row.get(0)).unwrap_or(0);
        let total_excel_connections: i64 = conn.query_row("SELECT COUNT(*) FROM excel_connections", [], |row| row.get(0)).unwrap_or(0);

        let db_size_bytes = std::fs::metadata(db_path).map(|m| m.len()).unwrap_or(0);

        Ok(DatabaseStatsDto {
            total_activities,
            total_projects,
            total_excel_connections,
            db_size_bytes,
            db_path: db_path.to_string_lossy().to_string(),
            backup_dir: backup_dir.to_string_lossy().to_string(),
        })
    }

    pub fn wipe_all_data(conn: &Connection) -> Result<()> {
        conn.execute_batch(
            "DELETE FROM sync_jobs;
             DELETE FROM activity_next_steps;
             DELETE FROM activity_challenges;
             DELETE FROM activity_technologies;
             DELETE FROM activity_tasks;
             DELETE FROM activities;
             DELETE FROM excel_field_mappings;
             DELETE FROM excel_templates;
             DELETE FROM excel_connections;
             DELETE FROM projects;
             DELETE FROM audit_logs;
             UPDATE application_settings SET value = 'false' WHERE key = 'is_onboarded';",
        )?;
        Ok(())
    }
}
