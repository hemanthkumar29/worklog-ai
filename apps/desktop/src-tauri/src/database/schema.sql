-- WorkLog AI SQLite Relational Schema
-- Version: 1.0.0
-- WAL mode and foreign key enforcement are enabled on connection.

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    default_project_id TEXT,
    default_excel_connection_id TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    technologies_csv TEXT,
    start_date TEXT,
    end_date TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    excel_connection_id TEXT,
    default_worksheet TEXT,
    is_archived INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    activity_date TEXT NOT NULL,
    raw_input TEXT NOT NULL,
    activity_title TEXT NOT NULL,
    enhanced_description TEXT NOT NULL,
    activity_type TEXT NOT NULL DEFAULT 'DEVELOPMENT',
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    time_spent_minutes INTEGER,
    review_status TEXT NOT NULL DEFAULT 'APPROVED',
    sync_status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_tasks (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_technologies (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    technology_name TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_challenges (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    challenge_description TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity_next_steps (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    next_step_description TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS excel_connections (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE,
    file_exists INTEGER NOT NULL DEFAULT 1,
    last_inspected_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS excel_templates (
    id TEXT PRIMARY KEY,
    excel_connection_id TEXT NOT NULL REFERENCES excel_connections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    worksheet_name TEXT NOT NULL,
    header_row_index INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS excel_field_mappings (
    id TEXT PRIMARY KEY,
    template_id TEXT NOT NULL REFERENCES excel_templates(id) ON DELETE CASCADE,
    worklog_field TEXT NOT NULL,
    excel_column_name TEXT NOT NULL,
    excel_column_index INTEGER NOT NULL,
    is_required INTEGER NOT NULL DEFAULT 0,
    default_value TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(template_id, worklog_field)
);

CREATE TABLE IF NOT EXISTS sync_jobs (
    id TEXT PRIMARY KEY,
    activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    excel_connection_id TEXT NOT NULL REFERENCES excel_connections(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL REFERENCES excel_templates(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    error_message TEXT,
    row_appended_index INTEGER,
    synced_at TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(activity_id, excel_connection_id, template_id)
);

CREATE TABLE IF NOT EXISTS application_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ai_model_settings (
    id TEXT PRIMARY KEY,
    active_engine TEXT NOT NULL DEFAULT 'HYBRID',
    model_path TEXT,
    context_window INTEGER NOT NULL DEFAULT 2048,
    temperature REAL NOT NULL DEFAULT 0.2,
    max_tokens INTEGER NOT NULL DEFAULT 1024,
    use_metal INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    action TEXT NOT NULL,
    details_json TEXT,
    created_at TEXT NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_activities_project ON activities(project_id);
CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(activity_date);
CREATE INDEX IF NOT EXISTS idx_activities_sync ON activities(sync_status);
CREATE INDEX IF NOT EXISTS idx_tasks_activity ON activity_tasks(activity_id);
CREATE INDEX IF NOT EXISTS idx_tech_activity ON activity_technologies(activity_id);
CREATE INDEX IF NOT EXISTS idx_challenges_activity ON activity_challenges(activity_id);
CREATE INDEX IF NOT EXISTS idx_next_steps_activity ON activity_next_steps(activity_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_activity ON sync_jobs(activity_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
