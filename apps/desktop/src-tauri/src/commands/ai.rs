use crate::ai::{
    detect_hardware, AIStructuredOutput, ActivityContextItem, EnhancementRequest, HardwareProfileDto,
    HybridAIEngine, LocalAIEngine,
};
use crate::database::{ActivityFilter, ActivityRepository, DbState, ProjectRepository};
use tauri::State;

#[tauri::command]
pub fn get_hardware_profile() -> HardwareProfileDto {
    detect_hardware()
}

#[tauri::command]
pub fn enhance_activity_text(
    state: State<'_, DbState>,
    raw_input: String,
    project_id: Option<String>,
) -> Result<AIStructuredOutput, String> {
    let mut project_name = None;
    let mut project_technologies = Vec::new();
    let mut recent_activities = Vec::new();

    if let Some(ref pid) = project_id {
        if let Ok(conn) = state.conn.lock() {
            if let Ok(Some(proj)) = ProjectRepository::get_by_id(&conn, pid) {
                project_name = Some(proj.name);
                project_technologies = proj.technologies;
            }

            // Retrieve recent 3 activities for this project
            let filter = ActivityFilter {
                project_id: Some(pid.clone()),
                limit: Some(3),
                ..Default::default()
            };
            if let Ok(acts) = ActivityRepository::list(&conn, filter) {
                for a in acts {
                    recent_activities.push(ActivityContextItem {
                        title: a.activity_title,
                        description: a.enhanced_description,
                        date: a.activity_date,
                    });
                }
            }
        }
    }

    let req = EnhancementRequest {
        raw_input,
        project_name,
        project_technologies,
        recent_activities,
    };

    let engine = HybridAIEngine::new();
    engine.enhance_activity(req)
}
