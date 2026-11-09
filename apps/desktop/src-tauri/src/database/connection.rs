use rusqlite::{Connection, Result};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::AppHandle;
use tauri::Manager;

pub struct DbState {
    pub conn: Mutex<Connection>,
    pub db_path: PathBuf,
    pub backup_dir: PathBuf,
}

pub fn get_app_data_dir(app: &AppHandle) -> PathBuf {
    app.path()
        .app_data_dir()
        .unwrap_or_else(|_| dirs::data_dir().unwrap_or_else(|| PathBuf::from(".")).join("WorkLogAI"))
}

pub fn init_database(app: &AppHandle) -> Result<DbState, Box<dyn std::error::Error>> {
    let app_dir = get_app_data_dir(app);
    fs::create_dir_all(&app_dir)?;

    let backup_dir = app_dir.join("backups");
    fs::create_dir_all(&backup_dir)?;

    let db_path = app_dir.join("worklog.db");
    log::info!("Initializing SQLite database at: {:?}", db_path);

    let conn = Connection::open(&db_path)?;

    // Configure SQLite performance and safety
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;
         PRAGMA busy_timeout = 5000;",
    )?;

    // Run schema migrations
    crate::database::migrations::run_migrations(&conn)?;

    Ok(DbState {
        conn: Mutex::new(conn),
        db_path,
        backup_dir,
    })
}
