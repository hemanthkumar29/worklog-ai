# WorkLog AI 💼🤖

> **"Describe your work. Let AI document it."**  
> A 100% free, open-source, offline-first desktop productivity application that transforms natural language work descriptions into structured, professional work logs and automatically synchronizes them into existing corporate Microsoft Excel (`.xlsx`) workbooks.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Offline First](https://img.shields.io/badge/Architecture-100%25%20Offline-success.svg)](#)
[![Zero Cloud](https://img.shields.io/badge/Privacy-Zero%20Cloud%20Dependencies-blue.svg)](#)
[![Platforms](https://img.shields.io/badge/Platforms-macOS%20%7C%20Windows-lightgrey.svg)](#)
[![Release](https://img.shields.io/badge/Release-v1.0.0-green.svg)](https://github.com/hemanthkumar29/worklog-ai/releases)

---

## 🌟 Quick Download for Working Professionals

WorkLog AI is a 100% self-contained application. **No programming tools, databases, Python, Node.js, or cloud API keys are required.**

| Operating System | Architecture | Installer Format | Download Link |
| :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (`M1/M2/M3/M4`, `arm64`) | `.dmg` Installer | [Download macOS DMG](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.0/WorkLog_AI_1.0.0_macOS_arm64.dmg) |
| **macOS** | Apple Silicon (`M1/M2/M3/M4`, `arm64`) | Portable `.zip` | [Download macOS ZIP](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.0/WorkLog_AI_1.0.0_macOS_arm64.zip) |
| **Windows** | Windows 10 / 11 (64-bit `x64`) | NSIS Setup `.exe` | [Download Windows Setup](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.0/WorkLog_AI_1.0.0_x64-setup.exe) |

> 💡 **All Releases & Release Notes:** Check the [GitHub Releases Page](https://github.com/hemanthkumar29/worklog-ai/releases) for latest packages and source code.

---

## 🚀 Installation & First Run Guide

### 🍏 On macOS (macOS 11.0 Big Sur or Newer)

1. **Download:** Click [WorkLog_AI_1.0.0_macOS_arm64.dmg](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.0/WorkLog_AI_1.0.0_macOS_arm64.dmg).
2. **Install:** Double-click the `.dmg` file and drag **WorkLog AI** into your `/Applications` folder.
3. **Launch:** Open WorkLog AI from your Applications folder or Spotlight (`Cmd + Space` $\rightarrow$ `WorkLog AI`).
4. **First Launch Gatekeeper Notice (Unsigned Open-Source Binary):**
   - If macOS displays *"WorkLog AI cannot be opened because the developer cannot be verified"*:
     - **Option A (Finder):** In `/Applications`, Right-click (or Control-click) **WorkLog AI.app** and select **Open**, then click **Open**.
     - **Option B (Terminal):** Run:
       ```bash
       xattr -cr "/Applications/WorkLog AI.app"
       ```
     - **Option C (System Settings):** Go to **System Settings** $\rightarrow$ **Privacy & Security** $\rightarrow$ scroll to the bottom and click **Open Anyway**.

---

### 🪟 On Windows (Windows 10 / 11 64-bit)

1. **Download:** Click [WorkLog_AI_1.0.0_x64-setup.exe](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.0/WorkLog_AI_1.0.0_x64-setup.exe).
2. **Install:** Double-click the installer and follow the standard installation wizard.
3. **Windows SmartScreen Notice:**
   - Because WorkLog AI is an open-source binary, Windows SmartScreen may show *"Windows protected your PC"*.
   - Click **More info**, then click **Run anyway**.
4. **Launch:** Launch **WorkLog AI** from your desktop icon or the Start Menu.

---

## 💡 The Problem WorkLog AI Solves

Employees in software engineering, IT consulting, financial services, and corporate firms are required daily to update manual timesheets and Excel spreadsheets with:
- Task titles, technical categories, and statuses
- Grammatically polished, professional activity summaries
- Granular bullet points of tasks completed
- Technologies used
- Duration and hours spent
- Challenges and blockers
- Next steps for upcoming standups

Doing this manually at 5:00 PM is exhausting, repetitive, and error-prone. 

**WorkLog AI eliminates this friction completely:**
- 💬 **Natural Language Capture:** Simply write a rough description of what you did.
- ⚡ **Local AI Structuring:** Instant categorization, grammar improvement, and structured task extraction.
- 🔒 **100% Privacy & Zero Cloud:** No work logs, proprietary source code references, or client names ever leave your device.
- 📊 **Non-Destructive Safe Excel Sync:** Directly appends rows to your existing corporate `.xlsx` spreadsheet without disturbing formulas, formatting, colors, or other sheets.

---

## 🛠️ Step-by-Step User Walkthrough

### Step 1: 30-Second First Launch Onboarding
When you open WorkLog AI for the first time, a 3-step wizard guides you:
1. **Your Profile:** Enter your full name (e.g., *Alex Smith*) and preferred date format (`YYYY-MM-DD`, `DD/MM/YYYY`, or `MM/DD/YYYY`).
2. **First Project:** Enter your primary project name (e.g., *Customer Portal Redesign*).
3. **Excel Workbook (Optional):** Select your corporate timesheet workbook (`.xlsx`), or click **Skip** to connect it anytime later.

---

### Step 2: Floating Quick Capture (Global Desktop Hotkey)
Press the global keyboard shortcut anywhere on your desktop:
- **macOS:** `Cmd + Shift + Space`
- **Windows:** `Ctrl + Shift + Space`

Type your raw notes:
```text
I worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates.
```

Click **Enhance with Local AI**:
The built-in offline NLP engine structures your notes into:
- **Activity Title:** Salesforce Account Duplicate Prevention
- **Category:** `RESEARCH_AND_TESTING`
- **Status:** `IN_PROGRESS`
- **Summary:** Researched and tested Salesforce duplicate prevention mechanisms for Account records.
- **Detailed Tasks:**
  - Explored Matching Rules and Duplicate Rules
  - Tested account creation with similar names
  - Investigated issues with record-triggered flows
- **Technologies:** `Salesforce`, `Matching Rules`, `Duplicate Rules`
- **Challenges:** Investigating duplicate detection in record-triggered flows
- **Next Steps:** Continue validating duplicate prevention scenarios

Review and edit any field inline. Then click **"Approve & Sync to Excel"**!

---

### Step 3: Excel Workbook Integration & Column Mapping
1. Click the **Excel Integration** tab in the sidebar.
2. Select your corporate `.xlsx` workbook. WorkLog AI safely inspects:
   - All worksheet tabs in the workbook.
   - Header row detection.
   - File lock status (detects if Microsoft Excel currently has the file open).
3. Choose the target sheet (e.g., `Daily_Logs`).
4. Review the auto-matched columns:
   | WorkLog AI Field | Your Excel Column | Auto-Match Confidence |
   | :--- | :--- | :--- |
   | Date | `Log Date` | 100% |
   | Employee Name | `Resource Name` | 100% |
   | Project Name | `Project` | 100% |
   | Activity Title | `Task Title` | 100% |
   | Description | `Work Description` | 100% |
   | Category | `Category` | 100% |
   | Hours | `Hours Spent` | 100% |
   | Status | `Status` | 100% |
5. Click **Save Mapping Template**. The mapping is permanently remembered for all future entries.

---

### Step 4: Non-Destructive Excel Synchronization Guarantee
WorkLog AI protects your corporate spreadsheets with enterprise safety standards:
- 🛡️ **Exclusive Lock Detection:** Checks whether Excel is holding an exclusive lock. If locked, your log is safely stored in SQLite and you are prompted to save and close Excel.
- 💾 **Pre-Write Automated Backups:** Before every single write, a timestamped copy is created in `~/.config/WorkLogAI/backups/<filename>_<timestamp>.bak.xlsx`.
- 🎯 **Selective OpenXML Patching:** Uses a pure-Rust OpenXML zip-stream engine that only appends new row XML to the target `<sheetData>`. Existing formulas, colors, fonts, conditional formats, and other sheets are 100% untouched.
- 🔁 **Idempotent Sync Tracking:** Uses SQLite `sync_jobs` to guarantee an activity is never duplicated.

---

### Step 5: Daily & Weekly Reporting with PDF Export
- Navigate to the **Reports** tab to view your productivity analytics:
  - Total hours logged
  - Completed vs In-Progress breakdown
  - Project distribution charts
  - Chronological activity tables
- Click **Export CSV** for raw spreadsheet data.
- Click **Export PDF** for a beautifully formatted executive report ready for management standups.

---

## 🔒 Privacy & Architecture Guarantees

| Metric | WorkLog AI Guarantee |
| :--- | :--- |
| **Cloud Servers** | **Zero.** No backend servers, no AWS/GCP, no Supabase, no Firebase. |
| **External LLM APIs** | **Zero.** No OpenAI, Gemini, or Claude API calls. No API keys to configure. |
| **Network Traffic** | **Zero.** Operates completely offline (airplane mode verified). |
| **Data Storage** | Stored locally in embedded SQLite on your device. |
| **Telemetry & Tracking** | **Zero.** No Google Analytics, Mixpanel, Sentry, or background pings. |

---

## 📂 Where Your Data Lives

All application data is stored in standard operating system directories:

- **macOS:** `~/Library/Application Support/com.worklog.ai/`
- **Windows:** `%APPDATA%\com.worklog.ai\`

Files:
- `worklog.db`: Relational SQLite database with WAL mode and foreign keys.
- `backups/`: Automated timestamped Excel backups created prior to every append operation.

---

## 💻 Developer Guide: Building from Source

If you want to contribute, customize, or build WorkLog AI from source code:

### Prerequisites
- [Rust toolchain](https://rustup.rs/) (stable $\ge$ 1.80)
- [Node.js](https://nodejs.org/) ($\ge$ 20.x or 22.x) & `npm`
- **macOS:** Xcode Command Line Tools (`xcode-select --install`)
- **Windows:** Visual Studio C++ Build Tools & WebView2 runtime (preinstalled on Windows 10/11)

### Build Steps

```bash
# 1. Clone the repository
git clone https://github.com/hemanthkumar29/worklog-ai.git
cd worklog-ai

# 2. Install frontend dependencies
cd apps/desktop
npm install

# 3. Run automated tests (pure Rust offline test suite)
cd src-tauri
cargo test --offline

# 4. Run in development mode
cd ..
npm run tauri dev

# 5. Build production native installers
npm run tauri build
```

The output packages will be located in:
- **macOS:** `apps/desktop/src-tauri/target/release/bundle/dmg/*.dmg` and `.app`
- **Windows:** `apps/desktop/src-tauri/target/release/bundle/nsis/*.exe`

---

## 🧪 Automated Test Suite

WorkLog AI includes a comprehensive test suite covering the entire pipeline:
- `database_test.rs`: SQLite schema migrations, foreign keys, cascading deletes, transactions.
- `ai_enhancement_test.rs`: Natural language intent classification, technology extraction, status inference.
- `mapper_test.rs`: Heuristic fuzzy column matching with synonym tables.
- `excel_writer_test.rs`: OpenXML zip-stream row appending, formula preservation, backup creation.
- `e2e_workflow_test.rs`: Full end-to-end simulation from onboarding to natural language capture, AI enhancement, and safe Excel appending.

Run all tests anytime:
```bash
cd apps/desktop/src-tauri
cargo test --offline
```

---

## 📄 License & Open Source Notice

WorkLog AI is free and open-source software released under the [MIT License](LICENSE).  
Copyright (c) 2026 Hemanth Kumar.

Developed with precision using Tauri 2, Rust, React, TypeScript, and SQLite.
