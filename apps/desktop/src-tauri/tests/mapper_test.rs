use app_lib::excel::ColumnMapper;

#[test]
fn test_column_mapper_heuristic_matching() {
    let company_headers = vec![
        "Work Date".to_string(),
        "Associate Name".to_string(),
        "Project Name".to_string(),
        "Work Details".to_string(),
        "Task Type".to_string(),
        "Duration".to_string(),
        "Current Status".to_string(),
    ];

    let suggestions = ColumnMapper::suggest_mappings(&company_headers);

    let get_mapped_col = |field: &str| -> Option<String> {
        suggestions
            .iter()
            .find(|s| s.worklog_field == field)
            .map(|s| s.excel_column_name.clone())
    };

    assert_eq!(get_mapped_col("activityDate"), Some("Work Date".to_string()));
    assert_eq!(get_mapped_col("employeeName"), Some("Associate Name".to_string()));
    assert_eq!(get_mapped_col("projectName"), Some("Project Name".to_string()));
    assert_eq!(get_mapped_col("description"), Some("Work Details".to_string()));
    assert_eq!(get_mapped_col("activityType"), Some("Task Type".to_string()));
    assert_eq!(get_mapped_col("timeSpentHours"), Some("Duration".to_string()));
    assert_eq!(get_mapped_col("status"), Some("Current Status".to_string()));
}
