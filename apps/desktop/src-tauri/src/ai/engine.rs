use super::fallback::{AIStructuredOutput, DeterministicNLPEngine};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityContextItem {
    pub title: String,
    pub description: String,
    pub date: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EnhancementRequest {
    pub raw_input: String,
    pub project_name: Option<String>,
    pub project_technologies: Vec<String>,
    pub recent_activities: Vec<ActivityContextItem>,
}

pub trait LocalAIEngine: Send + Sync {
    fn check_availability(&self) -> bool;
    fn enhance_activity(&self, req: EnhancementRequest) -> Result<AIStructuredOutput, String>;
}

pub struct HybridAIEngine;

impl HybridAIEngine {
    pub fn new() -> Self {
        Self
    }
}

impl LocalAIEngine for HybridAIEngine {
    fn check_availability(&self) -> bool {
        true
    }

    fn enhance_activity(&self, req: EnhancementRequest) -> Result<AIStructuredOutput, String> {
        // High reliability: Use deterministic NLP processor with context grounding
        let mut output = DeterministicNLPEngine::enhance(
            &req.raw_input,
            req.project_name.as_deref(),
            &req.project_technologies,
        );

        // Ground with recent activity context if available without hallucinating completed tasks
        if !req.recent_activities.is_empty() {
            let last_act = &req.recent_activities[0];
            // If the user's input refers to "remaining cases" or "remaining tasks" or "finished the testing"
            let input_lower = req.raw_input.to_lowercase();
            if input_lower.contains("remaining") || input_lower.contains("finished the") || input_lower.contains("completed the rest") {
                output.description = format!(
                    "Following up on previous work ({}): {}",
                    last_act.title, output.description
                );
            }
        }

        Ok(output)
    }
}
