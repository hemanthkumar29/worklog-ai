use app_lib::ai::{AIStructuredOutput, DeterministicNLPEngine};

#[test]
fn test_salesforce_duplicate_prevention_nlp_enhancement() {
    let input = "I worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates.";
    let output: AIStructuredOutput = DeterministicNLPEngine::enhance(input, Some("Salesforce Integration"), &[]);

    // 1. Verify title
    assert!(
        output.activity_title.to_lowercase().contains("salesforce")
            || output.activity_title.to_lowercase().contains("duplicate"),
        "Title should reflect Salesforce or Duplicate rules, got: {}",
        output.activity_title
    );

    // 2. Verify technologies
    assert!(
        output.technologies.iter().any(|t| t.eq_ignore_ascii_case("Salesforce")),
        "Should extract Salesforce from input"
    );
    assert!(
        output.technologies.iter().any(|t| t.eq_ignore_ascii_case("Matching Rules")),
        "Should extract Matching Rules"
    );
    assert!(
        output.technologies.iter().any(|t| t.eq_ignore_ascii_case("Duplicate Rules")),
        "Should extract Duplicate Rules"
    );

    // 3. Verify category classification
    assert_eq!(output.activity_type, "RESEARCH_AND_TESTING");

    // 4. Verify status
    assert_eq!(output.status, "IN_PROGRESS");

    // 5. Verify tasks extracted
    assert!(!output.detailed_tasks.is_empty(), "Tasks should not be empty");
    assert!(
        output.detailed_tasks.iter().any(|t| t.to_lowercase().contains("matching rules") || t.to_lowercase().contains("duplicate rules")),
        "Tasks should contain matching/duplicate rules breakdown"
    );

    // 6. Verify challenges identified
    assert!(
        !output.challenges.is_empty(),
        "Challenges should capture the investigated issue"
    );
    assert!(
        output.challenges[0].to_lowercase().contains("investigated why")
            || output.challenges[0].to_lowercase().contains("not detecting duplicates"),
        "Challenge should note the detection issue: {:?}",
        output.challenges
    );
}

#[test]
fn test_bug_fixing_and_time_extraction() {
    let input = "Fixed memory leak in Redis caching layer. Traced abandoned socket connections and patched TTL cleanup handler. Spent 2.5 hours.";
    let output = DeterministicNLPEngine::enhance(input, Some("Backend Core"), &["Redis".to_string()]);

    assert_eq!(output.activity_type, "BUG_FIXING");
    assert_eq!(output.status, "COMPLETED");
    assert_eq!(output.time_spent_minutes, Some(150)); // 2.5 * 60 = 150 minutes
    assert!(output.technologies.contains(&"Redis".to_string()));
}
