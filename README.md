# WorkLog AI

> **"Describe your work. Let AI document it."**  
> An offline-first, open-source desktop productivity application that transforms unstructured natural language work descriptions into structured, professional work logs and synchronizes them directly into existing Microsoft Excel (`.xlsx`) workbooks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Offline--First-success.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-Zero%20Cloud%20Telemetry-blue.svg)](#)
[![Platforms](https://img.shields.io/badge/Platforms-macOS%20%7C%20Windows-lightgrey.svg)](#)
[![Release](https://img.shields.io/badge/Release-v1.0.1-green.svg)](https://github.com/hemanthkumar29/worklog-ai/releases)

---

## Executive Overview

Maintaining daily work activity logs in corporate Excel spreadsheets is a recurring requirement across IT services, software engineering, consulting, and finance. Professionals are often required to document:
* Task titles, standardized categories, and operational statuses
* Professionally structured summaries
* Granular sub-tasks and accomplishments
* Technical stack and frameworks used
* Exact duration and hours spent
* Blockers, challenges, and upcoming standup deliverables

Manual spreadsheet maintenance at the end of every business day is time-consuming, prone to inconsistent syntax, and often results in lost detail.

WorkLog AI eliminates this operational overhead:
* **Natural Language Input:** Enter rough conversational notes or summaries of daily tasks.
* **Deterministic Local AI Structuring:** Automatically analyzes grammar, classifies technical domains, splits granular deliverables, extracts technologies, and infers progress status without inventing unperformed tasks or working hours.
* **Non-Destructive Excel Synchronization:** Appends validated records directly into existing corporate `.xlsx` workbooks while preserving existing formatting, cell formulas, colors, and other worksheets.
* **Local-First Privacy:** Runs entirely on the local machine with zero external cloud API dependencies, zero remote servers, and zero telemetry.

---

## Download Packages (Release v1.0.1)

WorkLog AI is distributed as a self-contained desktop package. No external runtimes (such as Python, Node.js, Java, or SQLite) or API credentials are required.

| Platform | Architecture | Distribution Format | Download |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (`M1/M2/M3/M4`, `arm64`) | Disk Image (`.dmg`) | [WorkLog_AI_1.0.1_macOS_arm64.dmg](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog_AI_1.0.1_macOS_arm64.dmg) |
| **macOS** | Apple Silicon (`M1/M2/M3/M4`, `arm64`) | Portable Archive (`.zip`) | [WorkLog_AI_1.0.1_macOS_arm64.zip](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog_AI_1.0.1_macOS_arm64.zip) |
| **Windows** | Windows 10 / 11 (64-bit `x64`) | NSIS Setup (`.exe`) | [WorkLog_AI_1.0.1_x64-setup.exe](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog_AI_1.0.1_x64-setup.exe) |

*For all historical versions, checksums, and release notes, visit the [Releases](https://github.com/hemanthkumar29/worklog-ai/releases) page.*

---

## Installation & Security Authorization Guide

### macOS Installation

#### Method A: Standard DMG Installation (Recommended)
1. Download `WorkLog_AI_1.0.1_macOS_arm64.dmg`.
2. Open the disk image and drag **WorkLog AI** into the **Applications** folder.
3. Open **Terminal** (`Cmd + Space` -> type `Terminal`) and execute the following authorization command:
   ```bash
   xattr -cr "/Applications/WorkLog AI.app"
   ```
4. Launch WorkLog AI from the Applications folder or Spotlight.

> **Note on macOS Gatekeeper:**  
> Because WorkLog AI is a free open-source application distributed without an Apple Developer subscription certificate, macOS Gatekeeper applies a `com.apple.quarantine` extended attribute to files downloaded via web browsers (Brave, Chrome, Safari). This triggers the system dialog: *"WorkLog AI.app is damaged and can't be opened. You should move it to the Bin."*  
> Executing `xattr -cr "/Applications/WorkLog AI.app"` removes this quarantine attribute and enables normal execution. This step is only required once after initial download.

#### Method B: One-Line Terminal Installer
Alternatively, install and authorize WorkLog AI in a single command:
```bash
curl -fsSL https://raw.githubusercontent.com/hemanthkumar29/worklog-ai/main/scripts/install.sh | bash
```

---

### Windows Installation

1. Download `WorkLog_AI_1.0.1_x64-setup.exe`.
2. Run the installer and complete the setup wizard.
3. **Windows SmartScreen Notice:**  
   If Windows displays *"Windows protected your PC"*, click **More info**, then select **Run anyway**. This prompt appears for newly compiled open-source executables until reputation is established.
4. Launch **WorkLog AI** from the Start Menu or Desktop shortcut.

---

## Operational Walkthrough

### 1. Initial Onboarding
Upon first launch, complete the three-step configuration:
* **User Profile:** Set your display name (e.g., *Jane Doe*) and preferred date formatting standard (`YYYY-MM-DD`, `DD/MM/YYYY`, or `MM/DD/YYYY`).
* **Initial Project:** Define your primary project identifier (e.g., *Core Banking Modernization*).
* **Excel Workbook Association:** Connect an existing corporate `.xlsx` spreadsheet, or select Skip to configure workbook mapping at a later time.

Preferences are persisted locally in the embedded SQLite database across restarts.

---

### 2. Global Quick Capture
Access the capture window from any application using system-wide hotkeys:
* **macOS:** `Cmd + Shift + Space`
* **Windows:** `Ctrl + Shift + Space`

Enter raw task notes in natural language:
```text
I worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates.
```

Click **Enhance with Local AI**. The offline inference engine parses and organizes the input into structured schema attributes:
* **Title:** Salesforce Account Duplicate Prevention
* **Category:** `RESEARCH_AND_TESTING`
* **Status:** `IN_PROGRESS`
* **Summary:** Researched and tested Salesforce duplicate prevention mechanisms for Account records.
* **Granular Deliverables:**
  * Explored Matching Rules and Duplicate Rules
  * Tested account creation with similar names
  * Investigated issues with record-triggered flows
* **Technologies:** `Salesforce`, `Matching Rules`, `Duplicate Rules`
* **Challenges:** Investigating duplicate detection in record-triggered flows
* **Next Steps:** Continue validating duplicate prevention scenarios

Review and edit any field directly. Select **Approve & Sync to Excel** to record the entry in SQLite and append to your connected spreadsheet.

---

### 3. Excel Inspection & Field Mapping
1. Open the **Excel Integration** view from the primary navigation.
2. Select your corporate `.xlsx` file. The inspection engine automatically analyzes:
   * Available worksheets in the workbook
   * Header row identification
   * Existing column titles and sample records
   * File lock status (detects active locks by Microsoft Excel)
3. Select the target destination sheet (e.g., `Daily_Logs`).
4. Validate auto-matched field mappings:

| WorkLog AI Schema Field | Target Excel Column | Match Algorithm |
| :--- | :--- | :--- |
| Date | `Log Date` | Exact / Synonym Heuristic |
| Employee Name | `Resource Name` | Exact / Synonym Heuristic |
| Project Name | `Project` | Exact / Synonym Heuristic |
| Activity Title | `Task Title` | Exact / Synonym Heuristic |
| Description | `Work Description` | Exact / Synonym Heuristic |
| Category | `Category` | Exact / Synonym Heuristic |
| Hours | `Duration` | Exact / Synonym Heuristic |
| Status | `Status` | Exact / Synonym Heuristic |

5. Select **Save Mapping Template**. The configuration is permanently retained for all subsequent sync operations.

---

### 4. Non-Destructive Excel Engine Safety Guarantees
WorkLog AI adheres to enterprise file-handling protocols:
* **Lock Verification:** Inspects read/write availability before file modification. If locked by another process, WorkLog AI notifies the user while safely persisting the record in SQLite.
* **Automated Pre-Write Backups:** Automatically creates a timestamped copy in `~/.config/WorkLogAI/backups/<filename>_<timestamp>.bak.xlsx` prior to every write operation.
* **Targeted OpenXML Patching:** Utilizes a pure-Rust zip-stream writer that modifies only the target sheet XML (`<sheetData>`). Styles, fonts, cell formatting, formulas, and unrelated worksheets remain unaltered.
* **Atomic Replacement:** Changes are written to a temporary file (`.tmp`) followed by an atomic filesystem rename, preventing corrupted states during sudden power or process interruptions.
* **Idempotency Control:** Tracks operations in SQLite `sync_jobs` to prevent duplicate row appends upon retries.

---

### 5. Reporting and Export
The **Reports** view provides consolidated productivity summaries:
* Total accumulated hours across selectable date ranges
* Status distribution metrics (Completed vs. In-Progress vs. Blocked)
* Project-specific time allocations
* **CSV Export:** Generates unformatted tabular data for custom processing.
* **PDF Export:** Produces formatted, executive-ready documentation for management standups and performance reviews.

---

## Technical Architecture & Privacy Matrix

```
[ User Input / Global Shortcut ]
               │
               ▼
   [ Tauri 2 Native Layer ] ─── (Rust IPC) ─── [ React + TypeScript UI ]
               │
       ┌───────┴────────────────────────┐
       ▼                                ▼
[ Local AI Engine ]            [ SQLite Engine ]
 - Tier 2: Pure-Rust NLP        - WAL Mode, Foreign Keys
 - Tier 1: Offline GGUF         - 14 Relational Tables
       │                                │
       └───────┬────────────────────────┘
               ▼
[ Non-Destructive Excel Engine ]
 - calamine (read / inspect)
 - zip-stream XML patcher (write / append)
 - Automated timestamped backups
               │
               ▼
[ Corporate .xlsx File ]
```

| Security Dimension | Implementation Standard |
| :--- | :--- |
| **Network Communication** | Zero outbound or inbound network sockets opened during runtime. |
| **External Cloud Services** | No remote servers, cloud databases, or third-party APIs utilized. |
| **Telemetry / Tracking** | Zero telemetry, usage analytics, or crash-reporting beacons. |
| **Data Storage Location** | Stored strictly in local system application directories: |
| | - macOS: `~/Library/Application Support/com.worklog.ai/` |
| | - Windows: `%APPDATA%\com.worklog.ai\` |

---

## Developer Guide: Building from Source

### Prerequisites
* Rust Toolchain (stable $\ge$ 1.80): [rustup.rs](https://rustup.rs/)
* Node.js ($\ge$ 20.x or 22.x LTS) and `npm`
* Platform Build Tools:
  * macOS: Xcode Command Line Tools (`xcode-select --install`)
  * Windows: Visual Studio C++ Build Tools and WebView2 Runtime

### Build Instructions

```bash
# Clone the repository
git clone https://github.com/hemanthkumar29/worklog-ai.git
cd worklog-ai

# Install web dependencies
cd apps/desktop
npm install

# Run automated unit and integration tests
cd src-tauri
cargo test --offline

# Launch application in local development mode
cd ..
npm run tauri dev

# Compile release package
npm run tauri build
```

Generated packages will be output to:
* macOS: `apps/desktop/src-tauri/target/release/bundle/dmg/` and `.app`
* Windows: `apps/desktop/src-tauri/target/release/bundle/nsis/*.exe`

---

## Automated Verification Suite

The repository includes test suites covering all operational modules:
* `database_test.rs`: Validates SQLite migrations, foreign key constraints, cascading deletions, and transactional integrity.
* `ai_enhancement_test.rs`: Validates deterministic NLP classification, entity recognition, status inference, and anti-hallucination constraints.
* `mapper_test.rs`: Validates heuristic fuzzy column matching and synonym mapping.
* `excel_writer_test.rs`: Validates OpenXML zip-stream appending, backup creation, and formula preservation.
* `e2e_workflow_test.rs`: Executes an end-to-end integration test from initial profile setup through AI enhancement to workbook modification.

Execute tests via:
```bash
cd apps/desktop/src-tauri
cargo test --offline
```

---

## License

WorkLog AI is open-source software licensed under the [MIT License](LICENSE).  
Copyright (c) 2026 Hemanth Kumar.
