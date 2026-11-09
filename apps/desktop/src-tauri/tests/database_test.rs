use app_lib::database::{
    migrations::run_migrations, ActivityFilter, ActivityRepository, CreateActivityInput,
    CreateProjectInput, ProjectRepository,
};
use rusqlite::Connection;

#[test]
fn test_sqlite_in_memory_migrations_and_cascading() {
    let conn = Connection::open_in_memory().expect("Failed to open in-memory SQLite");
    conn.execute_batch("PRAGMA foreign_keys = ON;").unwrap();

    // 1. Run migrations
    run_migrations(&conn).expect("Migrations should run cleanly");

    // 2. Create project
    let project = ProjectRepository::create(
        &conn,
        CreateProjectInput {
            name: "Enterprise Platform".to_string(),
            description: "Core banking platform".to_string(),
            client_name: Some("Global Bank".to_string()),
            technologies: vec!["Rust".to_string(), "PostgreSQL".to_string()],
            start_date: Some("2026-01-01".to_string()),
            end_date: None,
            status: Some("ACTIVE".to_string()),
            excel_connection_id: None,
            default_worksheet: None,
        },
    )
    .expect("Project should be created");

    // 3. Create activity linked to project
    let activity = ActivityRepository::create(
        &conn,
        CreateActivityInput {
            project_id: project.id.clone(),
            activity_date: "2026-11-09".to_string(),
            raw_input: "Implemented atomic database migrations".to_string(),
            activity_title: "Database Migrations".to_string(),
            enhanced_description: "Developed and verified schema migrations for SQLite.".to_string(),
            activity_type: "DEVELOPMENT".to_string(),
            status: "COMPLETED".to_string(),
            time_spent_minutes: Some(120),
            tasks: vec!["Written schema.sql".to_string(), "Configured foreign keys".to_string()],
            technologies: vec!["SQLite".to_string(), "Rust".to_string()],
            challenges: vec!["Ensuring backwards compatibility".to_string()],
            next_steps: vec!["Add index for performance".to_string()],
        },
    )
    .expect("Activity should be created");

    assert_eq!(activity.project_id, project.id);
    assert_eq!(activity.tasks.len(), 2);
    assert_eq!(activity.technologies.len(), 2);
    assert_eq!(activity.challenges.len(), 1);
    assert_eq!(activity.next_steps.len(), 1);

    // 4. Test listing with filter
    let list = ActivityRepository::list(
        &conn,
        ActivityFilter {
            project_id: Some(project.id.clone()),
            ..Default::default()
        },
    )
    .expect("Should list activities");
    assert_eq!(list.len(), 1);

    // 5. Test cascading deletion: deleting project deletes activity and tasks
    let deleted = ProjectRepository::delete(&conn, &project.id).expect("Delete project");
    assert!(deleted);

    let remaining_activities = ActivityRepository::list(&conn, ActivityFilter::default()).unwrap();
    assert_eq!(remaining_activities.len(), 0, "Activities should be deleted by cascade");
}
