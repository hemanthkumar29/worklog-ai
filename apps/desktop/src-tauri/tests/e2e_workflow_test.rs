use app_lib::ai::{AIStructuredOutput, DeterministicNLPEngine};
use app_lib::database::{
    migrations::run_migrations, ActivityRepository, CreateActivityInput,
    CreateProjectInput, ExcelRepository, ProjectRepository, SaveFieldMappingInput,
    SaveTemplateInput, SettingsRepository,
};
use app_lib::excel::{ExcelInspector, ExcelWriter};
use rusqlite::Connection;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::Write;
use zip::write::SimpleFileOptions;
use zip::ZipWriter;

fn create_company_excel(path: &std::path::Path) {
    let file = File::create(path).unwrap();
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default();

    zip.start_file("[Content_Types].xml", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>"#).unwrap();

    zip.start_file("_rels/.rels", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>"#).unwrap();

    zip.start_file("xl/workbook.xml", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <sheets>
        <sheet name="Daily Logs" sheetId="1" r:id="rId1"/>
    </sheets>
</workbook>"#).unwrap();

    zip.start_file("xl/_rels/workbook.xml.rels", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>"#).unwrap();

    zip.start_file("xl/worksheets/sheet1.xml", options).unwrap();
    zip.write_all(br#"<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <dimension ref="A1:E1"/>
    <sheetData>
        <row r="1">
            <c r="A1" t="inlineStr"><is><t>Work Date</t></is></c>
            <c r="B1" t="inlineStr"><is><t>Associate Name</t></is></c>
            <c r="C1" t="inlineStr"><is><t>Project Name</t></is></c>
            <c r="D1" t="inlineStr"><is><t>Activity Title</t></is></c>
            <c r="E1" t="inlineStr"><is><t>Work Details</t></is></c>
        </row>
    </sheetData>
</worksheet>"#).unwrap();

    zip.finish().unwrap();
}

#[test]
fn test_complete_end_to_end_user_scenario() {
    let test_dir = std::env::temp_dir().join(format!("worklog_e2e_{}", uuid::Uuid::new_v4()));
    fs::create_dir_all(&test_dir).unwrap();
    let excel_path = test_dir.join("Company_WorkLog.xlsx");
    let backup_dir = test_dir.join("backups");
    let db_path = test_dir.join("worklog.db");

    // 1. Launch & Initialize Database
    let conn = Connection::open(&db_path).unwrap();
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         PRAGMA synchronous = NORMAL;
         PRAGMA foreign_keys = ON;
         PRAGMA busy_timeout = 5000;",
    ).unwrap();
    run_migrations(&conn).unwrap();

    // 2. Local User Profile Onboarding
    let user = SettingsRepository::get_user_profile(&conn).unwrap();
    assert_eq!(user.display_name, "Employee");

    // 3. Create Project
    let project = ProjectRepository::create(
        &conn,
        CreateProjectInput {
            name: "Salesforce CRM".to_string(),
            description: "Enterprise CRM implementation".to_string(),
            client_name: Some("Global Logistics".to_string()),
            technologies: vec!["Salesforce".to_string(), "Apex".to_string()],
            start_date: Some("2026-11-01".to_string()),
            end_date: None,
            status: Some("ACTIVE".to_string()),
            excel_connection_id: None,
            default_worksheet: Some("Daily Logs".to_string()),
        },
    ).unwrap();

    // 4. Connect and Inspect Excel Workbook
    create_company_excel(&excel_path);
    let inspection = ExcelInspector::inspect(excel_path.to_str().unwrap()).unwrap();
    assert_eq!(inspection.sheets.len(), 1);
    assert_eq!(inspection.sheets[0].name, "Daily Logs");
    assert_eq!(inspection.sheets[0].headers.len(), 5);

    let connection = ExcelRepository::get_or_create_connection(
        &conn,
        excel_path.to_str().unwrap(),
        "Company WorkLog",
    ).unwrap();

    // 5. Configure Column Mappings
    let template = ExcelRepository::save_template(
        &conn,
        SaveTemplateInput {
            excel_connection_id: connection.id.clone(),
            name: "Default Template".to_string(),
            worksheet_name: "Daily Logs".to_string(),
            header_row_index: 1,
            mappings: vec![
                SaveFieldMappingInput {
                    worklog_field: "activityDate".to_string(),
                    excel_column_name: "Work Date".to_string(),
                    excel_column_index: 0,
                    is_required: true,
                    default_value: None,
                },
                SaveFieldMappingInput {
                    worklog_field: "employeeName".to_string(),
                    excel_column_name: "Associate Name".to_string(),
                    excel_column_index: 1,
                    is_required: false,
                    default_value: None,
                },
                SaveFieldMappingInput {
                    worklog_field: "projectName".to_string(),
                    excel_column_name: "Project Name".to_string(),
                    excel_column_index: 2,
                    is_required: true,
                    default_value: None,
                },
                SaveFieldMappingInput {
                    worklog_field: "activityTitle".to_string(),
                    excel_column_name: "Activity Title".to_string(),
                    excel_column_index: 3,
                    is_required: true,
                    default_value: None,
                },
                SaveFieldMappingInput {
                    worklog_field: "description".to_string(),
                    excel_column_name: "Work Details".to_string(),
                    excel_column_index: 4,
                    is_required: true,
                    default_value: None,
                },
            ],
        },
    ).unwrap();

    // 6. Enter natural language input in Quick Capture
    let user_input = "Today I researched Salesforce duplicate prevention, configured matching rules, and tested Account record creation.";

    // 7. Process using Local AI Engine
    let ai_output: AIStructuredOutput = DeterministicNLPEngine::enhance(
        user_input,
        Some(&project.name),
        &project.technologies,
    );

    assert!(ai_output.activity_title.to_lowercase().contains("salesforce"));
    assert!(ai_output.technologies.contains(&"Salesforce".to_string()));
    assert!(!ai_output.detailed_tasks.is_empty());

    // 8. User reviews, modifies, and approves activity
    let approved_activity = ActivityRepository::create(
        &conn,
        CreateActivityInput {
            project_id: project.id.clone(),
            activity_date: "2026-11-09".to_string(),
            raw_input: user_input.to_string(),
            activity_title: ai_output.activity_title.clone(),
            enhanced_description: ai_output.description.clone(),
            activity_type: ai_output.activity_type.clone(),
            status: ai_output.status.clone(),
            time_spent_minutes: Some(180),
            tasks: ai_output.detailed_tasks.clone(),
            technologies: ai_output.technologies.clone(),
            challenges: ai_output.challenges.clone(),
            next_steps: ai_output.next_steps.clone(),
        },
    ).unwrap();

    // 9. Synchronize to Excel
    let mut column_values: HashMap<usize, String> = HashMap::new();
    for m in &template.mappings {
        let val = match m.worklog_field.as_str() {
            "activityDate" => approved_activity.activity_date.clone(),
            "employeeName" => user.display_name.clone(),
            "projectName" => project.name.clone(),
            "activityTitle" => approved_activity.activity_title.clone(),
            "description" => approved_activity.enhanced_description.clone(),
            _ => String::new(),
        };
        column_values.insert(m.excel_column_index as usize, val);
    }

    let append_result = ExcelWriter::append_row(
        excel_path.to_str().unwrap(),
        "Daily Logs",
        &column_values,
        &backup_dir,
    ).unwrap();

    assert!(append_result.success);
    assert_eq!(append_result.row_number, 2);

    // Record sync job in DB
    ExcelRepository::record_sync_job(
        &conn,
        &approved_activity.id,
        &connection.id,
        &template.id,
        "SUCCESS",
        None,
        Some(2),
    ).unwrap();
    ActivityRepository::update_sync_status(&conn, &approved_activity.id, "SYNCED").unwrap();

    // 10. Close and Re-open Database (Simulating restart)
    drop(conn);

    let reopened_conn = Connection::open(&db_path).unwrap();
    let stored_activity = ActivityRepository::get_by_id(&reopened_conn, &approved_activity.id)
        .unwrap()
        .expect("Activity must persist across application restarts");

    assert_eq!(stored_activity.activity_title, approved_activity.activity_title);
    assert_eq!(stored_activity.sync_status, "SYNCED");
    assert_eq!(stored_activity.raw_input, user_input);

    // 11. Inspect Excel file and confirm row exists with original data intact
    let post_sync_inspection = ExcelInspector::inspect(excel_path.to_str().unwrap()).unwrap();
    assert_eq!(post_sync_inspection.sheets[0].row_count, 2);
    assert_eq!(post_sync_inspection.sheets[0].headers[0], "Work Date");
    assert_eq!(post_sync_inspection.sheets[0].headers[1], "Associate Name");

    // Clean up
    let _ = fs::remove_dir_all(&test_dir);
}
