use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectDto {
    pub id: String,
    pub name: String,
    pub description: String,
    pub client_name: Option<String>,
    pub technologies: Vec<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String,
    pub excel_connection_id: Option<String>,
    pub default_worksheet: Option<String>,
    pub is_archived: bool,
    pub activity_count: i64,
    pub total_time_minutes: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProjectInput {
    pub name: String,
    pub description: String,
    pub client_name: Option<String>,
    pub technologies: Vec<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: Option<String>,
    pub excel_connection_id: Option<String>,
    pub default_worksheet: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProjectInput {
    pub id: String,
    pub name: Option<String>,
    pub description: Option<String>,
    pub client_name: Option<String>,
    pub technologies: Option<Vec<String>>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: Option<String>,
    pub excel_connection_id: Option<String>,
    pub default_worksheet: Option<String>,
    pub is_archived: Option<bool>,
}

pub struct ProjectRepository;

impl ProjectRepository {
    pub fn create(conn: &Connection, input: CreateProjectInput) -> Result<ProjectDto> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        let tech_csv = input.technologies.join(",");
        let status = input.status.unwrap_or_else(|| "ACTIVE".to_string());

        conn.execute(
            "INSERT INTO projects (
                id, name, description, client_name, technologies_csv, start_date, end_date,
                status, excel_connection_id, default_worksheet, is_archived, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)",
            params![
                id,
                input.name,
                input.description,
                input.client_name,
                tech_csv,
                input.start_date,
                input.end_date,
                status,
                input.excel_connection_id,
                input.default_worksheet,
                now,
                now
            ],
        )?;

        Self::get_by_id(conn, &id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn get_by_id(conn: &Connection, id: &str) -> Result<Option<ProjectDto>> {
        let mut stmt = conn.prepare(
            "SELECT p.id, p.name, p.description, p.client_name, p.technologies_csv,
                    p.start_date, p.end_date, p.status, p.excel_connection_id,
                    p.default_worksheet, p.is_archived, p.created_at, p.updated_at,
                    COALESCE(COUNT(a.id), 0) as activity_count,
                    COALESCE(SUM(a.time_spent_minutes), 0) as total_time_minutes
             FROM projects p
             LEFT JOIN activities a ON p.id = a.project_id
             WHERE p.id = ?
             GROUP BY p.id",
        )?;

        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let description: String = row.get(2).unwrap_or_default();
            let client_name: Option<String> = row.get(3)?;
            let tech_csv: String = row.get(4).unwrap_or_default();
            let start_date: Option<String> = row.get(5)?;
            let end_date: Option<String> = row.get(6)?;
            let status: String = row.get(7)?;
            let excel_connection_id: Option<String> = row.get(8)?;
            let default_worksheet: Option<String> = row.get(9)?;
            let is_archived: bool = row.get::<_, i64>(10)? != 0;
            let created_at: String = row.get(11)?;
            let updated_at: String = row.get(12)?;
            let activity_count: i64 = row.get(13)?;
            let total_time_minutes: i64 = row.get(14)?;

            let technologies = if tech_csv.is_empty() {
                Vec::new()
            } else {
                tech_csv.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect()
            };

            Ok(Some(ProjectDto {
                id,
                name,
                description,
                client_name,
                technologies,
                start_date,
                end_date,
                status,
                excel_connection_id,
                default_worksheet,
                is_archived,
                activity_count,
                total_time_minutes,
                created_at,
                updated_at,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn list(conn: &Connection, include_archived: bool) -> Result<Vec<ProjectDto>> {
        let sql = if include_archived {
            "SELECT p.id, p.name, p.description, p.client_name, p.technologies_csv,
                    p.start_date, p.end_date, p.status, p.excel_connection_id,
                    p.default_worksheet, p.is_archived, p.created_at, p.updated_at,
                    COALESCE(COUNT(a.id), 0) as activity_count,
                    COALESCE(SUM(a.time_spent_minutes), 0) as total_time_minutes
             FROM projects p
             LEFT JOIN activities a ON p.id = a.project_id
             GROUP BY p.id
             ORDER BY p.name ASC"
        } else {
            "SELECT p.id, p.name, p.description, p.client_name, p.technologies_csv,
                    p.start_date, p.end_date, p.status, p.excel_connection_id,
                    p.default_worksheet, p.is_archived, p.created_at, p.updated_at,
                    COALESCE(COUNT(a.id), 0) as activity_count,
                    COALESCE(SUM(a.time_spent_minutes), 0) as total_time_minutes
             FROM projects p
             LEFT JOIN activities a ON p.id = a.project_id
             WHERE p.is_archived = 0
             GROUP BY p.id
             ORDER BY p.name ASC"
        };

        let mut stmt = conn.prepare(sql)?;
        let rows = stmt.query_map([], |row| {
            let id: String = row.get(0)?;
            let name: String = row.get(1)?;
            let description: String = row.get(2).unwrap_or_default();
            let client_name: Option<String> = row.get(3)?;
            let tech_csv: String = row.get(4).unwrap_or_default();
            let start_date: Option<String> = row.get(5)?;
            let end_date: Option<String> = row.get(6)?;
            let status: String = row.get(7)?;
            let excel_connection_id: Option<String> = row.get(8)?;
            let default_worksheet: Option<String> = row.get(9)?;
            let is_archived: bool = row.get::<_, i64>(10)? != 0;
            let created_at: String = row.get(11)?;
            let updated_at: String = row.get(12)?;
            let activity_count: i64 = row.get(13)?;
            let total_time_minutes: i64 = row.get(14)?;

            let technologies = if tech_csv.is_empty() {
                Vec::new()
            } else {
                tech_csv.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect()
            };

            Ok(ProjectDto {
                id,
                name,
                description,
                client_name,
                technologies,
                start_date,
                end_date,
                status,
                excel_connection_id,
                default_worksheet,
                is_archived,
                activity_count,
                total_time_minutes,
                created_at,
                updated_at,
            })
        })?;

        let mut list = Vec::new();
        for p in rows {
            list.push(p?);
        }
        Ok(list)
    }

    pub fn update(conn: &Connection, input: UpdateProjectInput) -> Result<Option<ProjectDto>> {
        let now = chrono::Utc::now().to_rfc3339();

        if let Some(ref name) = input.name {
            conn.execute("UPDATE projects SET name = ?, updated_at = ? WHERE id = ?", params![name, now, input.id])?;
        }
        if let Some(ref desc) = input.description {
            conn.execute("UPDATE projects SET description = ?, updated_at = ? WHERE id = ?", params![desc, now, input.id])?;
        }
        if let Some(ref client) = input.client_name {
            conn.execute("UPDATE projects SET client_name = ?, updated_at = ? WHERE id = ?", params![client, now, input.id])?;
        }
        if let Some(ref techs) = input.technologies {
            let tech_csv = techs.join(",");
            conn.execute("UPDATE projects SET technologies_csv = ?, updated_at = ? WHERE id = ?", params![tech_csv, now, input.id])?;
        }
        if let Some(ref status) = input.status {
            conn.execute("UPDATE projects SET status = ?, updated_at = ? WHERE id = ?", params![status, now, input.id])?;
        }
        if let Some(ref ec_id) = input.excel_connection_id {
            conn.execute("UPDATE projects SET excel_connection_id = ?, updated_at = ? WHERE id = ?", params![ec_id, now, input.id])?;
        }
        if let Some(ref ws) = input.default_worksheet {
            conn.execute("UPDATE projects SET default_worksheet = ?, updated_at = ? WHERE id = ?", params![ws, now, input.id])?;
        }
        if let Some(archived) = input.is_archived {
            let val = if archived { 1 } else { 0 };
            conn.execute("UPDATE projects SET is_archived = ?, updated_at = ? WHERE id = ?", params![val, now, input.id])?;
        }

        Self::get_by_id(conn, &input.id)
    }

    pub fn delete(conn: &Connection, id: &str) -> Result<bool> {
        let count = conn.execute("DELETE FROM projects WHERE id = ?", params![id])?;
        Ok(count > 0)
    }
}
