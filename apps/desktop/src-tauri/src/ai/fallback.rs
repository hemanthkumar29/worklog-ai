use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AIStructuredOutput {
    pub activity_title: String,
    pub description: String,
    pub detailed_tasks: Vec<String>,
    pub activity_type: String,
    pub technologies: Vec<String>,
    pub status: String,
    pub time_spent_minutes: Option<i64>,
    pub challenges: Vec<String>,
    pub next_steps: Vec<String>,
}

pub struct DeterministicNLPEngine;

impl DeterministicNLPEngine {
    pub fn enhance(raw_input: &str, project_name: Option<&str>, project_techs: &[String]) -> AIStructuredOutput {
        let trimmed = raw_input.trim();
        if trimmed.is_empty() {
            return AIStructuredOutput {
                activity_title: "General Work Activity".to_string(),
                description: "Worked on assigned project tasks.".to_string(),
                detailed_tasks: vec!["Worked on assigned tasks".to_string()],
                activity_type: "DEVELOPMENT".to_string(),
                technologies: Vec::new(),
                status: "COMPLETED".to_string(),
                time_spent_minutes: None,
                challenges: Vec::new(),
                next_steps: Vec::new(),
            };
        }

        // 1. Extract Technologies
        let mut technologies = Self::extract_technologies(trimmed);
        for pt in project_techs {
            if trimmed.to_lowercase().contains(&pt.to_lowercase()) && !technologies.iter().any(|t| t.eq_ignore_ascii_case(pt)) {
                technologies.push(pt.clone());
            }
        }

        // 2. Classify Activity Type
        let activity_type = Self::classify_activity_type(trimmed);

        // 3. Infer Status
        let status = Self::infer_status(trimmed);

        // 4. Extract Time Spent if explicitly mentioned
        let time_spent_minutes = Self::extract_time_spent(trimmed);

        // 5. Extract Detailed Tasks
        let detailed_tasks = Self::extract_detailed_tasks(trimmed);

        // 6. Extract Challenges
        let challenges = Self::extract_challenges(trimmed);

        // 7. Extract Next Steps
        let next_steps = Self::extract_next_steps(trimmed);

        // 8. Generate Professional Title
        let activity_title = Self::generate_title(trimmed, project_name, &technologies, &activity_type);

        // 9. Synthesize Professional Description
        let description = Self::synthesize_description(trimmed, &activity_title, &activity_type, &status);

        AIStructuredOutput {
            activity_title,
            description,
            detailed_tasks,
            activity_type,
            technologies,
            status,
            time_spent_minutes,
            challenges,
            next_steps,
        }
    }

    fn extract_technologies(text: &str) -> Vec<String> {
        let known_techs = [
            // Salesforce & CRM
            "Salesforce", "Matching Rules", "Duplicate Rules", "Apex", "Visualforce", "LWC", "Lightning Web Components",
            "SOQL", "SOSL", "Flow Builder", "Process Builder", "Sales Cloud", "Service Cloud",
            // Languages & Frameworks
            "React", "TypeScript", "JavaScript", "Rust", "Python", "Java", "C++", "C#", ".NET", "Go", "Golang",
            "Swift", "Kotlin", "Flutter", "Dart", "PHP", "Ruby", "Rails", "Vue", "Angular", "Next.js", "Nuxt", "Svelte",
            // Backend & APIs
            "Node.js", "Express", "Spring Boot", "FastAPI", "Django", "Flask", "GraphQL", "REST", "gRPC", "WebSocket",
            // Databases & Storage
            "SQLite", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Cassandra", "Oracle", "Elasticsearch", "Prisma",
            // Cloud & DevOps
            "AWS", "GCP", "Google Cloud", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD", "GitHub Actions",
            "GitLab", "Jenkins", "Nginx", "Linux", "Apache",
            // Desktop & Tools
            "Tauri", "Electron", "Excel", "OpenPyXL", "Git", "Jira", "Vite", "Tailwind CSS", "Webpack", "Kafka",
        ];

        let mut found = Vec::new();
        let lower = text.to_lowercase();

        for tech in known_techs {
            let tech_lower = tech.to_lowercase();
            // Match with boundary check
            let pattern = format!(r"(?i)\b{}\b", regex::escape(&tech_lower));
            if let Ok(re) = Regex::new(&pattern) {
                if re.is_match(&lower) && !found.iter().any(|t: &String| t.eq_ignore_ascii_case(tech)) {
                    found.push(tech.to_string());
                }
            }
        }

        found
    }

    fn classify_activity_type(text: &str) -> String {
        let lower = text.to_lowercase();

        if lower.contains("bug") || lower.contains("fix") || lower.contains("error") || lower.contains("issue")
            || lower.contains("patch") || lower.contains("crash") || lower.contains("debug") {
            "BUG_FIXING".to_string()
        } else if lower.contains("research") || lower.contains("investigat") || lower.contains("test")
            || lower.contains("explor") || lower.contains("validat") || lower.contains("poc") || lower.contains("benchmark") {
            "RESEARCH_AND_TESTING".to_string()
        } else if lower.contains("meeting") || lower.contains("standup") || lower.contains("sync")
            || lower.contains("discussion") || lower.contains("client call") {
            "MEETING".to_string()
        } else if lower.contains("review") || lower.contains("pr review") || lower.contains("pull request") {
            "CODE_REVIEW".to_string()
        } else if lower.contains("doc") || lower.contains("readme") || lower.contains("specification")
            || lower.contains("diagram") || lower.contains("architecture doc") {
            "DOCUMENTATION".to_string()
        } else if lower.contains("deploy") || lower.contains("release") || lower.contains("pipeline")
            || lower.contains("ci/cd") || lower.contains("staging") || lower.contains("production") {
            "DEPLOYMENT".to_string()
        } else if lower.contains("plan") || lower.contains("sprint") || lower.contains("backlog")
            || lower.contains("estimate") || lower.contains("roadmap") {
            "PLANNING".to_string()
        } else {
            "DEVELOPMENT".to_string()
        }
    }

    fn infer_status(text: &str) -> String {
        let lower = text.to_lowercase();

        if lower.contains("blocked") || lower.contains("waiting on") || lower.contains("stuck") || lower.contains("dependency block") {
            "BLOCKED".to_string()
        } else if lower.contains("in progress") || lower.contains("started") || lower.contains("ongoing")
            || lower.contains("working on") || lower.contains("investigating") || lower.contains("investigated why")
            || lower.contains("exploring") || lower.contains("continuing") || lower.contains("tested account") {
            "IN_PROGRESS".to_string()
        } else if lower.contains("plan to") || lower.contains("will work") || lower.contains("scheduled") {
            "PLANNED".to_string()
        } else {
            "COMPLETED".to_string()
        }
    }

    fn extract_time_spent(text: &str) -> Option<i64> {
        // Try hours pattern
        if let Ok(re_h) = Regex::new(r"(?i)(\d+(?:\.\d+)?)\s*(?:hrs?|hours?|h\b)") {
            if let Some(caps) = re_h.captures(text) {
                if let Ok(hours) = caps[1].parse::<f64>() {
                    return Some((hours * 60.0) as i64);
                }
            }
        }

        // Try minutes pattern
        if let Ok(re_m) = Regex::new(r"(?i)(\d+)\s*(?:mins?|minutes?|m\b)") {
            if let Some(caps) = re_m.captures(text) {
                if let Ok(mins) = caps[1].parse::<i64>() {
                    return Some(mins);
                }
            }
        }

        None
    }

    fn extract_detailed_tasks(text: &str) -> Vec<String> {
        let mut tasks = Vec::new();

        // Split by sentences, semicolons, or bullet indicators
        let cleaned = text.replace('\n', ". ").replace(';', ". ");
        let re_sentence = Regex::new(r"[.!?]+").unwrap();

        for s in re_sentence.split(&cleaned) {
            let item = s.trim();
            if item.len() >= 6 {
                let formatted = Self::capitalize_first(item);
                // Clean common leadings like "I worked on ", "Today I "
                let trimmed_lead = Self::clean_leading_pronouns(&formatted);
                if !trimmed_lead.is_empty() && !tasks.contains(&trimmed_lead) {
                    tasks.push(trimmed_lead);
                }
            }
        }

        if tasks.is_empty() {
            tasks.push(Self::capitalize_first(text.trim()));
        }

        tasks
    }

    fn extract_challenges(text: &str) -> Vec<String> {
        let mut challenges = Vec::new();
        let lower = text.to_lowercase();

        let trigger_phrases = [
            "investigating why", "investigated why", "issue with", "problem with",
            "not detecting", "failed to", "error occurred", "challenge with", "difficulty with",
            "stuck on", "blocked by", "not working",
        ];

        for tp in trigger_phrases {
            if let Some(pos) = lower.find(tp) {
                let remainder = &text[pos..];
                let end = remainder.find('.').or_else(|| remainder.find(';')).unwrap_or(remainder.len());
                let challenge_text = remainder[..end].trim();
                if challenge_text.len() > 8 {
                    challenges.push(Self::capitalize_first(challenge_text));
                }
            }
        }

        challenges
    }

    fn extract_next_steps(text: &str) -> Vec<String> {
        let mut next_steps = Vec::new();
        let lower = text.to_lowercase();

        let triggers = ["next:", "next step", "next steps", "will continue", "continue to", "plan to", "todo", "follow up"];

        for tg in triggers {
            if let Some(pos) = lower.find(tg) {
                let remainder = &text[pos..];
                let end = remainder.find('.').or_else(|| remainder.find(';')).unwrap_or(remainder.len());
                let ns = remainder[..end].trim();
                if ns.len() > 6 {
                    next_steps.push(Self::capitalize_first(ns));
                }
            }
        }

        next_steps
    }

    fn generate_title(text: &str, project_name: Option<&str>, techs: &[String], activity_type: &str) -> String {
        // Look for main subject
        let mut title_subject = String::new();

        if !techs.is_empty() {
            title_subject = techs.join(" & ");
        } else if let Some(p) = project_name {
            title_subject = p.to_string();
        }

        let first_sentence = text.split(['.', ';', '\n']).next().unwrap_or(text).trim();
        let cleaned = Self::clean_leading_pronouns(first_sentence);

        if cleaned.len() <= 60 && cleaned.len() >= 10 {
            return Self::capitalize_first(&cleaned);
        }

        let action_prefix = match activity_type {
            "BUG_FIXING" => "Bug Investigation & Fix",
            "RESEARCH_AND_TESTING" => "Research & Testing",
            "CODE_REVIEW" => "Code Review & Feedback",
            "MEETING" => "Team Sync & Planning",
            "DOCUMENTATION" => "Documentation & Specs",
            "DEPLOYMENT" => "Deployment & Release",
            _ => "Feature Implementation",
        };

        if !title_subject.is_empty() {
            format!("{}: {}", title_subject, action_prefix)
        } else {
            action_prefix.to_string()
        }
    }

    fn synthesize_description(text: &str, title: &str, activity_type: &str, status: &str) -> String {
        let cleaned = text.trim();
        let prefix = match (activity_type, status) {
            ("RESEARCH_AND_TESTING", "IN_PROGRESS") => "Researched and actively tested",
            ("RESEARCH_AND_TESTING", _) => "Conducted research and validation for",
            ("BUG_FIXING", "COMPLETED") => "Investigated root cause and resolved issue regarding",
            ("BUG_FIXING", _) => "Diagnosed and debugged issue with",
            ("DEVELOPMENT", "COMPLETED") => "Successfully developed and implemented",
            ("DEVELOPMENT", _) => "Developed and progressed work on",
            ("MEETING", _) => "Participated in collaboration session regarding",
            ("DOCUMENTATION", _) => "Authored technical documentation for",
            ("DEPLOYMENT", _) => "Executed deployment workflow for",
            _ => "Completed assigned tasks regarding",
        };

        let summary_subject = if !title.is_empty() && title.contains(':') {
            title.split(':').nth(1).unwrap_or(title).trim().to_lowercase()
        } else {
            title.to_lowercase()
        };

        format!("{} {}. {}", prefix, summary_subject, Self::capitalize_first(cleaned))
    }

    fn clean_leading_pronouns(s: &str) -> String {
        let patterns = [
            r"(?i)^(?:today\s+)?i\s+(?:have\s+)?(?:worked\s+on|did|tested|built|researched|created|added|configured)\s+",
            r"(?i)^(?:today\s+)?(?:we\s+)?(?:worked\s+on|did)\s+",
        ];

        let mut res = s.to_string();
        for p in patterns {
            if let Ok(re) = Regex::new(p) {
                res = re.replace(&res, "").to_string();
            }
        }
        res.trim().to_string()
    }

    fn capitalize_first(s: &str) -> String {
        let mut chars = s.chars();
        match chars.next() {
            None => String::new(),
            Some(f) => f.to_uppercase().collect::<String>() + chars.as_str(),
        }
    }
}
