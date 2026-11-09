use rusqlite::{params, Connection, Result};

const SCHEMA_SQL: &str = include_str!("schema.sql");

pub fn run_migrations(conn: &Connection) -> Result<()> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _schema_migrations (
            version INTEGER PRIMARY KEY,
            applied_at TEXT NOT NULL
        );",
    )?;

    let mut stmt = conn.prepare("SELECT MAX(version) FROM _schema_migrations")?;
    let current_version: Option<i64> = stmt.query_row([], |row| row.get(0)).unwrap_or(None);
    let version = current_version.unwrap_or(0);

    if version < 1 {
        log::info!("Applying schema migration v1...");
        conn.execute_batch(SCHEMA_SQL)?;

        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO _schema_migrations (version, applied_at) VALUES (?, ?)",
            params![1, now],
        )?;

        // Seed default application settings and default user profile if empty
        seed_defaults(conn, &now)?;
    }

    Ok(())
}

fn seed_defaults(conn: &Connection, now: &str) -> Result<()> {
    let user_count: i64 = conn.query_row("SELECT COUNT(*) FROM users", [], |row| row.get(0))?;
    if user_count == 0 {
        let user_id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO users (id, display_name, date_format, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            params![user_id, "Employee", "YYYY-MM-DD", now, now],
        )?;
    }

    // Default settings
    let default_settings = [
        ("theme", "system"),
        ("ai_engine", "HYBRID"),
        ("shortcut_quick_capture", "CommandOrControl+Shift+Space"),
        ("auto_sync_excel", "true"),
        ("backup_retention", "10"),
    ];

    for (k, v) in default_settings {
        conn.execute(
            "INSERT OR IGNORE INTO application_settings (key, value, updated_at) VALUES (?, ?, ?)",
            params![k, v, now],
        )?;
    }

    // Default AI settings
    let ai_count: i64 = conn.query_row("SELECT COUNT(*) FROM ai_model_settings", [], |row| row.get(0))?;
    if ai_count == 0 {
        let ai_id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO ai_model_settings (id, active_engine, context_window, temperature, max_tokens, use_metal, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            params![ai_id, "HYBRID", 2048, 0.2, 1024, 1, now, now],
        )?;
    }

    Ok(())
}
