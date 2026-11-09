use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityDto {
    pub id: String,
    pub project_id: String,
    pub project_name: Option<String>,
    pub activity_date: String,
    pub raw_input: String,
    pub activity_title: String,
    pub enhanced_description: String,
    pub activity_type: String,
    pub status: String,
    pub time_spent_minutes: Option<i64>,
    pub review_status: String,
    pub sync_status: String,
    pub tasks: Vec<String>,
    pub technologies: Vec<String>,
    pub challenges: Vec<String>,
    pub next_steps: Vec<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateActivityInput {
    pub project_id: String,
    pub activity_date: String,
    pub raw_input: String,
    pub activity_title: String,
    pub enhanced_description: String,
    pub activity_type: String,
    pub status: String,
    pub time_spent_minutes: Option<i64>,
    pub tasks: Vec<String>,
    pub technologies: Vec<String>,
    pub challenges: Vec<String>,
    pub next_steps: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateActivityInput {
    pub id: String,
    pub project_id: Option<String>,
    pub activity_date: Option<String>,
    pub activity_title: Option<String>,
    pub enhanced_description: Option<String>,
    pub activity_type: Option<String>,
    pub status: Option<String>,
    pub time_spent_minutes: Option<i64>,
    pub review_status: Option<String>,
    pub sync_status: Option<String>,
    pub tasks: Option<Vec<String>>,
    pub technologies: Option<Vec<String>>,
    pub challenges: Option<Vec<String>>,
    pub next_steps: Option<Vec<String>>,
}

#[derive(Debug, Deserialize, Default)]
pub struct ActivityFilter {
    pub project_id: Option<String>,
    pub search_query: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: Option<String>,
    pub sync_status: Option<String>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub struct ActivityRepository;

impl ActivityRepository {
    pub fn create(conn: &Connection, input: CreateActivityInput) -> Result<ActivityDto> {
        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO activities (
                id, project_id, activity_date, raw_input, activity_title, enhanced_description,
                activity_type, status, time_spent_minutes, review_status, sync_status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED', 'PENDING', ?, ?)",
            params![
                id,
                input.project_id,
                input.activity_date,
                input.raw_input,
                input.activity_title,
                input.enhanced_description,
                input.activity_type,
                input.status,
                input.time_spent_minutes,
                now,
                now
            ],
        )?;

        // Insert tasks
        for (idx, task) in input.tasks.iter().enumerate() {
            let task_id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO activity_tasks (id, activity_id, task_description, order_index, is_completed, created_at)
                 VALUES (?, ?, ?, ?, 1, ?)",
                params![task_id, id, task, idx as i64, now],
            )?;
        }

        // Insert technologies
        for tech in &input.technologies {
            let tech_id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO activity_technologies (id, activity_id, technology_name, created_at)
                 VALUES (?, ?, ?, ?)",
                params![tech_id, id, tech, now],
            )?;
        }

        // Insert challenges
        for (idx, ch) in input.challenges.iter().enumerate() {
            let ch_id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO activity_challenges (id, activity_id, challenge_description, order_index, created_at)
                 VALUES (?, ?, ?, ?, ?)",
                params![ch_id, id, ch, idx as i64, now],
            )?;
        }

        // Insert next steps
        for (idx, ns) in input.next_steps.iter().enumerate() {
            let ns_id = uuid::Uuid::new_v4().to_string();
            conn.execute(
                "INSERT INTO activity_next_steps (id, activity_id, next_step_description, order_index, created_at)
                 VALUES (?, ?, ?, ?, ?)",
                params![ns_id, id, ns, idx as i64, now],
            )?;
        }

        Self::get_by_id(conn, &id)?.ok_or(rusqlite::Error::QueryReturnedNoRows)
    }

    pub fn get_by_id(conn: &Connection, id: &str) -> Result<Option<ActivityDto>> {
        let mut stmt = conn.prepare(
            "SELECT a.id, a.project_id, p.name as project_name, a.activity_date, a.raw_input,
                    a.activity_title, a.enhanced_description, a.activity_type, a.status,
                    a.time_spent_minutes, a.review_status, a.sync_status, a.created_at, a.updated_at
             FROM activities a
             LEFT JOIN projects p ON a.project_id = p.id
             WHERE a.id = ?",
        )?;

        let mut rows = stmt.query(params![id])?;
        if let Some(row) = rows.next()? {
            let activity_id: String = row.get(0)?;
            let project_id: String = row.get(1)?;
            let project_name: Option<String> = row.get(2)?;
            let activity_date: String = row.get(3)?;
            let raw_input: String = row.get(4)?;
            let activity_title: String = row.get(5)?;
            let enhanced_description: String = row.get(6)?;
            let activity_type: String = row.get(7)?;
            let status: String = row.get(8)?;
            let time_spent_minutes: Option<i64> = row.get(9)?;
            let review_status: String = row.get(10)?;
            let sync_status: String = row.get(11)?;
            let created_at: String = row.get(12)?;
            let updated_at: String = row.get(13)?;

            let tasks = Self::get_tasks_for_activity(conn, &activity_id)?;
            let technologies = Self::get_technologies_for_activity(conn, &activity_id)?;
            let challenges = Self::get_challenges_for_activity(conn, &activity_id)?;
            let next_steps = Self::get_next_steps_for_activity(conn, &activity_id)?;

            Ok(Some(ActivityDto {
                id: activity_id,
                project_id,
                project_name,
                activity_date,
                raw_input,
                activity_title,
                enhanced_description,
                activity_type,
                status,
                time_spent_minutes,
                review_status,
                sync_status,
                tasks,
                technologies,
                challenges,
                next_steps,
                created_at,
                updated_at,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn list(conn: &Connection, filter: ActivityFilter) -> Result<Vec<ActivityDto>> {
        let mut query = String::from(
            "SELECT a.id, a.project_id, p.name as project_name, a.activity_date, a.raw_input,
                    a.activity_title, a.enhanced_description, a.activity_type, a.status,
                    a.time_spent_minutes, a.review_status, a.sync_status, a.created_at, a.updated_at
             FROM activities a
             LEFT JOIN projects p ON a.project_id = p.id
             WHERE 1=1 ",
        );

        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

        if let Some(pid) = filter.project_id {
            if !pid.is_empty() {
                query.push_str(" AND a.project_id = ?");
                params_vec.push(Box::new(pid));
            }
        }

        if let Some(q) = filter.search_query {
            if !q.trim().is_empty() {
                let term = format!("%{}%", q.trim());
                query.push_str(" AND (a.activity_title LIKE ? OR a.enhanced_description LIKE ? OR a.raw_input LIKE ?)");
                params_vec.push(Box::new(term.clone()));
                params_vec.push(Box::new(term.clone()));
                params_vec.push(Box::new(term));
            }
        }

        if let Some(s) = filter.start_date {
            if !s.is_empty() {
                query.push_str(" AND a.activity_date >= ?");
                params_vec.push(Box::new(s));
            }
        }

        if let Some(e) = filter.end_date {
            if !e.is_empty() {
                query.push_str(" AND a.activity_date <= ?");
                params_vec.push(Box::new(e));
            }
        }

        if let Some(st) = filter.status {
            if !st.is_empty() {
                query.push_str(" AND a.status = ?");
                params_vec.push(Box::new(st));
            }
        }

        if let Some(sync) = filter.sync_status {
            if !sync.is_empty() {
                query.push_str(" AND a.sync_status = ?");
                params_vec.push(Box::new(sync));
            }
        }

        query.push_str(" ORDER BY a.activity_date DESC, a.created_at DESC");

        if let Some(limit) = filter.limit {
            query.push_str(&format!(" LIMIT {}", limit));
            if let Some(offset) = filter.offset {
                query.push_str(&format!(" OFFSET {}", offset));
            }
        }

        let mut stmt = conn.prepare(&query)?;
        let param_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|b| b.as_ref()).collect();

        let activity_rows = stmt.query_map(&param_refs[..], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, Option<String>>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
                row.get::<_, String>(5)?,
                row.get::<_, String>(6)?,
                row.get::<_, String>(7)?,
                row.get::<_, String>(8)?,
                row.get::<_, Option<i64>>(9)?,
                row.get::<_, String>(10)?,
                row.get::<_, String>(11)?,
                row.get::<_, String>(12)?,
                row.get::<_, String>(13)?,
            ))
        })?;

        let mut results = Vec::new();
        for r in activity_rows {
            let (
                activity_id,
                project_id,
                project_name,
                activity_date,
                raw_input,
                activity_title,
                enhanced_description,
                activity_type,
                status,
                time_spent_minutes,
                review_status,
                sync_status,
                created_at,
                updated_at,
            ) = r?;

            let tasks = Self::get_tasks_for_activity(conn, &activity_id)?;
            let technologies = Self::get_technologies_for_activity(conn, &activity_id)?;
            let challenges = Self::get_challenges_for_activity(conn, &activity_id)?;
            let next_steps = Self::get_next_steps_for_activity(conn, &activity_id)?;

            results.push(ActivityDto {
                id: activity_id,
                project_id,
                project_name,
                activity_date,
                raw_input,
                activity_title,
                enhanced_description,
                activity_type,
                status,
                time_spent_minutes,
                review_status,
                sync_status,
                tasks,
                technologies,
                challenges,
                next_steps,
                created_at,
                updated_at,
            });
        }

        Ok(results)
    }

    pub fn update(conn: &Connection, input: UpdateActivityInput) -> Result<Option<ActivityDto>> {
        let now = chrono::Utc::now().to_rfc3339();

        if let Some(ref title) = input.activity_title {
            conn.execute(
                "UPDATE activities SET activity_title = ?, updated_at = ? WHERE id = ?",
                params![title, now, input.id],
            )?;
        }
        if let Some(ref desc) = input.enhanced_description {
            conn.execute(
                "UPDATE activities SET enhanced_description = ?, updated_at = ? WHERE id = ?",
                params![desc, now, input.id],
            )?;
        }
        if let Some(ref at) = input.activity_type {
            conn.execute(
                "UPDATE activities SET activity_type = ?, updated_at = ? WHERE id = ?",
                params![at, now, input.id],
            )?;
        }
        if let Some(ref st) = input.status {
            conn.execute(
                "UPDATE activities SET status = ?, updated_at = ? WHERE id = ?",
                params![st, now, input.id],
            )?;
        }
        if let Some(ref date) = input.activity_date {
            conn.execute(
                "UPDATE activities SET activity_date = ?, updated_at = ? WHERE id = ?",
                params![date, now, input.id],
            )?;
        }
        if let Some(tsm) = input.time_spent_minutes {
            conn.execute(
                "UPDATE activities SET time_spent_minutes = ?, updated_at = ? WHERE id = ?",
                params![tsm, now, input.id],
            )?;
        }
        if let Some(ref rs) = input.review_status {
            conn.execute(
                "UPDATE activities SET review_status = ?, updated_at = ? WHERE id = ?",
                params![rs, now, input.id],
            )?;
        }
        if let Some(ref ss) = input.sync_status {
            conn.execute(
                "UPDATE activities SET sync_status = ?, updated_at = ? WHERE id = ?",
                params![ss, now, input.id],
            )?;
        }

        if let Some(ref tasks) = input.tasks {
            conn.execute("DELETE FROM activity_tasks WHERE activity_id = ?", params![input.id])?;
            for (idx, task) in tasks.iter().enumerate() {
                let task_id = uuid::Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO activity_tasks (id, activity_id, task_description, order_index, is_completed, created_at)
                     VALUES (?, ?, ?, ?, 1, ?)",
                    params![task_id, input.id, task, idx as i64, now],
                )?;
            }
        }

        if let Some(ref technologies) = input.technologies {
            conn.execute("DELETE FROM activity_technologies WHERE activity_id = ?", params![input.id])?;
            for tech in technologies {
                let tech_id = uuid::Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO activity_technologies (id, activity_id, technology_name, created_at)
                     VALUES (?, ?, ?, ?)",
                    params![tech_id, input.id, tech, now],
                )?;
            }
        }

        if let Some(ref challenges) = input.challenges {
            conn.execute("DELETE FROM activity_challenges WHERE activity_id = ?", params![input.id])?;
            for (idx, ch) in challenges.iter().enumerate() {
                let ch_id = uuid::Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO activity_challenges (id, activity_id, challenge_description, order_index, created_at)
                     VALUES (?, ?, ?, ?, ?)",
                    params![ch_id, input.id, ch, idx as i64, now],
                )?;
            }
        }

        if let Some(ref next_steps) = input.next_steps {
            conn.execute("DELETE FROM activity_next_steps WHERE activity_id = ?", params![input.id])?;
            for (idx, ns) in next_steps.iter().enumerate() {
                let ns_id = uuid::Uuid::new_v4().to_string();
                conn.execute(
                    "INSERT INTO activity_next_steps (id, activity_id, next_step_description, order_index, created_at)
                     VALUES (?, ?, ?, ?, ?)",
                    params![ns_id, input.id, ns, idx as i64, now],
                )?;
            }
        }

        Self::get_by_id(conn, &input.id)
    }

    pub fn delete(conn: &Connection, id: &str) -> Result<bool> {
        let rows = conn.execute("DELETE FROM activities WHERE id = ?", params![id])?;
        Ok(rows > 0)
    }

    pub fn update_sync_status(conn: &Connection, activity_id: &str, status: &str) -> Result<()> {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE activities SET sync_status = ?, updated_at = ? WHERE id = ?",
            params![status, now, activity_id],
        )?;
        Ok(())
    }

    fn get_tasks_for_activity(conn: &Connection, activity_id: &str) -> Result<Vec<String>> {
        let mut stmt = conn.prepare(
            "SELECT task_description FROM activity_tasks WHERE activity_id = ? ORDER BY order_index ASC",
        )?;
        let rows = stmt.query_map(params![activity_id], |row| row.get(0))?;
        let mut tasks = Vec::new();
        for task in rows {
            tasks.push(task?);
        }
        Ok(tasks)
    }

    fn get_technologies_for_activity(conn: &Connection, activity_id: &str) -> Result<Vec<String>> {
        let mut stmt = conn.prepare(
            "SELECT technology_name FROM activity_technologies WHERE activity_id = ? ORDER BY created_at ASC",
        )?;
        let rows = stmt.query_map(params![activity_id], |row| row.get(0))?;
        let mut techs = Vec::new();
        for tech in rows {
            techs.push(tech?);
        }
        Ok(techs)
    }

    fn get_challenges_for_activity(conn: &Connection, activity_id: &str) -> Result<Vec<String>> {
        let mut stmt = conn.prepare(
            "SELECT challenge_description FROM activity_challenges WHERE activity_id = ? ORDER BY order_index ASC",
        )?;
        let rows = stmt.query_map(params![activity_id], |row| row.get(0))?;
        let mut items = Vec::new();
        for item in rows {
            items.push(item?);
        }
        Ok(items)
    }

    fn get_next_steps_for_activity(conn: &Connection, activity_id: &str) -> Result<Vec<String>> {
        let mut stmt = conn.prepare(
            "SELECT next_step_description FROM activity_next_steps WHERE activity_id = ? ORDER BY order_index ASC",
        )?;
        let rows = stmt.query_map(params![activity_id], |row| row.get(0))?;
        let mut items = Vec::new();
        for item in rows {
            items.push(item?);
        }
        Ok(items)
    }
}
