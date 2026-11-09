# WorkLog AI — Architecture & Technical Design Document

## 1. System Overview

**WorkLog AI** is an offline-first desktop productivity application engineered to eliminate the manual burden of daily spreadsheet reporting. The system allows employees to describe their work in natural language, automatically improves and structures the description using a local AI engine, preserves original inputs, stores activities in an ACID-compliant relational SQLite database, and safely appends approved logs to existing Microsoft Excel workbooks (`.xlsx`) with 100% data and formatting fidelity.

The application operates with **zero server dependencies, zero telemetry, and zero developer-installed runtime requirements**.

---

## 2. High-Level Component Diagram

```
+-----------------------------------------------------------------------------------------+
|                                    WORKLOG AI DESKTOP                                   |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                           Presentation Layer (Webview)                            |  |
|  |                                                                                   |  |
|  |   [Quick Capture]    [Activity History]   [Projects]   [Excel Engine]  [Reports]  |  |
|  |          |                   |                 |             |             |      |  |
|  |          +-------------------+--------+--------+-------------+-------------+      |  |
|  |                                       | React 18 + Zustand Stores                 |  |
|  +---------------------------------------+-------------------------------------------+  |
|                                          | IPC (Tauri v2 Commands)                      |
|  +---------------------------------------v-------------------------------------------+  |
|  |                            Native Core Engine (Rust)                              |  |
|  |                                                                                   |  |
|  |  +---------------------------+  +--------------------------+  +----------------+  |  |
|  |  |      Database Manager     |  |      Local AI Engine     |  |  Excel Engine  |  |  |
|  |  |  - rusqlite (WAL mode)    |  |  - Dual-tier Inference   |  |  - Calamine    |  |  |
|  |  |  - 14 Relational Tables   |  |  - Hardware Profiler     |  |    Inspector   |  |  |
|  |  |  - Cascading Foreign Keys |  |  - Deterministic NLP     |  |  - Safe Atomic |  |  |
|  |  |  - Schema Migrations      |  |    Rule-Based Engine     |  |    XML Writer  |  |  |
|  |  +---------------------------+  +--------------------------+  +----------------+  |  |
|  |                                                                                   |  |
|  |  +---------------------------+  +--------------------------+  +----------------+  |  |
|  |  |  Global Shortcuts Plugin  |  | Native Dialog & FS Plugin|  | Auto-Backup Mgr|  |  |
|  |  +---------------------------+  +--------------------------+  +----------------+  |  |
|  +-----------------------------------------------------------------------------------+  |
|                                          | Direct Local File I/O                        |
|  +---------------------------------------v-------------------------------------------+  |
|  |                             Local Filesystem Storage                              |  |
|  |                                                                                   |  |
|  |  - SQLite DB: ~/.config/WorkLogAI/worklog.db (macOS/Win AppData)                  |  |
|  |  - Automated Backups: ~/.config/WorkLogAI/backups/*.bak.xlsx                      |  |
|  |  - User's Company Excel Workbooks (*.xlsx)                                        |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Database Architecture (SQLite)

The application initializes an embedded SQLite database on first launch with `WAL` (Write-Ahead Logging) mode and `foreign_keys = ON`.

### Relational Schema Design:

```
  +--------------+        1:N        +-----------------------+
  |    users     |------------------>|       projects        |
  +--------------+                   +-----------------------+
                                                 | 1:N
                                                 v
  +-----------------------+          +-----------------------+
  |   excel_connections   |          |      activities       |
  +-----------------------+          +-----------------------+
              | 1:N                               | 1:N
              v                                   +---> [activity_tasks]
  +-----------------------+                       +---> [activity_technologies]
  |    excel_templates    |                       +---> [activity_challenges]
  +-----------------------+                       +---> [activity_next_steps]
              | 1:N                               |
              v                                   v
  +-----------------------+          +-----------------------+
  | excel_field_mappings  |          |       sync_jobs       |
  +-----------------------+          +-----------------------+
```

### Table Definitions & Foreign Key Constraints:
1. `users`: Stores user profile (`id`, `display_name`, `date_format`, `default_project_id`).
2. `projects`: Work projects (`id`, `name`, `description`, `client_name`, `technologies_csv`, `status`, `excel_connection_id`, `default_worksheet`, `is_archived`).
3. `activities`: The core activity log entity (`id`, `project_id`, `activity_date`, `raw_input`, `activity_title`, `enhanced_description`, `activity_type`, `status`, `time_spent_minutes`, `review_status`, `sync_status`).
4. `activity_tasks`: Granular task breakdown items (`id`, `activity_id` REFERENCES `activities(id)` ON DELETE CASCADE, `task_description`, `order_index`, `is_completed`).
5. `activity_technologies`: Technology tags (`id`, `activity_id` REFERENCES `activities(id)` ON DELETE CASCADE, `technology_name`).
6. `activity_challenges`: Blockers and edge cases (`id`, `activity_id` REFERENCES `activities(id)` ON DELETE CASCADE, `challenge_description`).
7. `activity_next_steps`: Follow-up items (`id`, `activity_id` REFERENCES `activities(id)` ON DELETE CASCADE, `next_step_description`).
8. `excel_connections`: Registered user `.xlsx` workbooks (`id`, `name`, `file_path` UNIQUE, `file_exists`, `last_inspected_at`).
9. `excel_templates`: Worksheet mapping profiles (`id`, `excel_connection_id` REFERENCES `excel_connections(id)` ON DELETE CASCADE, `name`, `worksheet_name`, `header_row_index`).
10. `excel_field_mappings`: Field column bindings (`id`, `template_id` REFERENCES `excel_templates(id)` ON DELETE CASCADE, `worklog_field`, `excel_column_name`, `excel_column_index`).
11. `sync_jobs`: Idempotent synchronization tracking (`id`, `activity_id`, `excel_connection_id`, `template_id`, `status`, `row_appended_index`, `synced_at`, `retry_count`, UNIQUE(`activity_id`, `excel_connection_id`, `template_id`)).
12. `application_settings`: Key-value configuration pairs (`key` PRIMARY KEY, `value`).
13. `ai_model_settings`: Local inference engine parameters (`id`, `active_engine`, `context_window`, `temperature`, `use_metal`).
14. `audit_logs`: Local audit trail for all modifications (`id`, `entity_type`, `entity_id`, `action`, `details_json`).

---

## 4. Local AI Engine Architecture

WorkLog AI employs a **Dual-Tier Hardware-Aware AI Strategy**:

```
                              [User Natural Language Input]
                                           |
                                           v
                              [Hardware Profiler (sysinfo)]
                              Checks RAM, CPU Cores, Metal/AVX2
                                           |
                   +-----------------------+-----------------------+
                   |                                               |
                   v (RAM >= 6GB & Model Present)                  v (Default & Low Memory Fallback)
          [Tier 1: Local Model]                       [Tier 2: High-Precision NLP Engine]
          - Quantized GGUF Model                      - Pure Rust Deterministic Extraction
          - llama.cpp Metal / AVX2                    - 250+ Tech Vocabulary Recognition
          - Strict Structured JSON Output             - Intent & Action Verb Classifier
                                                      - Regex Task & Challenge Decomposer
                   |                                               |
                   +-----------------------+-----------------------+
                                           |
                                           v
                             [Structured JSON Schema Validation]
                             - Activity Title
                             - Professional Enhanced Description
                             - Granular Action Items
                             - Category & Status
                             - Extracted Technologies
                             - Identified Challenges & Next Steps
                                           |
                                           v
                             [Interactive User Review & Approval]
```

### Prompt Engineering & Anti-Hallucination Guardrails:
1. **Never Invent Completed Work:** The engine parses only what the user entered or verified.
2. **Context Separation:** Historical activities from the SQLite database are injected strictly as background reference and labeled with distinct markers to prevent historical tasks from being duplicated today.
3. **Deterministic Verification:** If an AI model fails or returns malformed JSON, the deterministic tier instantly repairs or generates the response, ensuring zero application crashes.

---

## 5. Zero Data Loss Excel Append Engine

Editing existing Excel workbooks without destroying formulas, charts, fonts, custom colors, merged cells, or multiple worksheets is a critical engineering challenge.

WorkLog AI implements a **Non-Destructive OpenXML Zip-Stream Writer**:

1. **Pre-Flight Lock Check:** Attempts to open the target file for write access. If Microsoft Excel has locked the file exclusively, the operation safely aborts before touching any bytes, keeping the activity stored in SQLite and alerting the user.
2. **Automated Timestamped Backup:** Generates a copy in `~/.config/WorkLogAI/backups/<filename>_<timestamp>.bak.xlsx`.
3. **Surgical OpenXML Modification:**
   - Reads the workbook structure from `xl/workbook.xml` and relationships from `xl/_rels/workbook.xml.rels` to resolve the target sheet path (e.g., `xl/worksheets/sheet1.xml`).
   - Copies every other entry in the ZIP package (`xl/styles.xml`, `xl/drawings/`, VBA macros, other sheets) byte-for-byte with original compression.
   - Parses the highest existing row number `<row r="N">` in `<sheetData>`.
   - Appends `<row r="N+1">` with typed inline string cells `<c r="A{N+1}" t="inlineStr"><is><t>Value</t></is></c>`.
   - Expands the `<dimension ref="..."/>` element if present.
4. **Atomic File Swap:** Writes to `<path>.tmp` and executes an atomic filesystem rename/replace, preventing partial writes during sudden power loss or process interruption.
5. **Idempotency Guarantee:** The composite key `(activity_id, excel_connection_id, template_id)` in the `sync_jobs` table prevents the same activity from ever being appended twice upon retries.
