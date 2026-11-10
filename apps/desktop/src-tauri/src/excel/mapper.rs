use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SuggestedMapping {
    pub worklog_field: String,
    pub excel_column_name: String,
    pub excel_column_index: usize,
    pub confidence: f32,
    pub is_required: bool,
}

pub struct ColumnMapper;

impl ColumnMapper {
    pub fn suggest_mappings(headers: &[String]) -> Vec<SuggestedMapping> {
        let field_definitions = [
            ("activityDate", &["date", "work date", "log date", "day", "activity date", "entry date"][..], true),
            ("employeeName", &["employee", "associate", "developer", "engineer", "name", "consultant", "user", "resource", "author"][..], false),
            ("projectName", &["project", "client", "project name", "account", "engagement"][..], true),
            ("activityTitle", &["title", "task title", "task", "subject", "summary", "activity title", "topic"][..], true),
            ("description", &["description", "work description", "work details", "details", "comments", "remarks", "activity details", "work done"][..], true),
            ("activityType", &["type", "task type", "activity type", "category", "work type", "classification"][..], false),
            ("technologies", &["technologies", "tech", "tools", "stack", "skills", "tech stack", "technologies used"][..], false),
            ("timeSpentHours", &["hours", "duration", "time spent", "time", "hours spent", "effort", "effort (hrs)", "hours (hrs)"][..], false),
            ("status", &["status", "state", "current status", "progress"][..], false),
            ("challenges", &["challenges", "blockers", "issues", "impediments", "risks"][..], false),
            ("nextSteps", &["next steps", "next step", "future work", "pending", "follow up"][..], false),
            ("detailedTasks", &["tasks", "task list", "action items", "breakdown"][..], false),
        ];

        let mut suggestions = Vec::new();

        for (field_id, keywords, is_required) in field_definitions {
            let mut best_match: Option<(usize, String, f32)> = None;

            for (col_idx, header) in headers.iter().enumerate() {
                let col_norm = header.trim().to_lowercase();
                if col_norm.is_empty() {
                    continue;
                }

                // Check exact keyword match
                for kw in keywords.iter() {
                    let kw_norm = kw.to_lowercase();
                    if col_norm == kw_norm {
                        best_match = Some((col_idx, header.clone(), 1.0));
                        break;
                    } else if col_norm.contains(&kw_norm) || kw_norm.contains(&col_norm) {
                        let score = 0.8;
                        if best_match.as_ref().map(|b| b.2 < score).unwrap_or(true) {
                            best_match = Some((col_idx, header.clone(), score));
                        }
                    }
                }

                if best_match.as_ref().map(|b| b.2 >= 1.0).unwrap_or(false) {
                    break;
                }
            }

            if let Some((col_idx, col_name, score)) = best_match {
                suggestions.push(SuggestedMapping {
                    worklog_field: field_id.to_string(),
                    excel_column_name: col_name,
                    excel_column_index: col_idx,
                    confidence: score,
                    is_required,
                });
            }
        }

        suggestions
    }
}
