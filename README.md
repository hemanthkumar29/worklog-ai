# WorkLog AI

> **"Describe your work. Let AI document it."**  
> An offline-first, macOS-native desktop productivity application that transforms unstructured natural language work descriptions into structured, professional work logs and synchronizes them directly into existing Microsoft Excel (`.xlsx`) workbooks.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Offline--First-success.svg)](#)
[![Privacy](https://img.shields.io/badge/Privacy-Zero%20Cloud%20Telemetry-blue.svg)](#)
[![Platforms](https://img.shields.io/badge/Platforms-macOS%20%7C%20Windows-lightgrey.svg)](#)
[![Release](https://img.shields.io/badge/Release-v1.0.1-green.svg)](https://github.com/hemanthkumar29/worklog-ai/releases/tag/v1.0.1)

---

## Executive Overview

Maintaining daily work activity logs in corporate Excel spreadsheets is a recurring requirement across software engineering, consulting, IT services, and operations. Professionals are routinely expected to document:
* Task titles, standardized categories, and operational statuses
* Structured, executive-ready work summaries
* Granular sub-tasks and concrete accomplishments
* Technologies, libraries, and frameworks utilized
* Exact duration and hours spent
* Blockers, challenges, and upcoming standup deliverables

Manual spreadsheet maintenance at the end of every business day is time-consuming, prone to inconsistent syntax, and frequently leads to lost detail.

WorkLog AI eliminates this operational overhead through a streamlined desktop experience:
* **Natural Language Input:** Type rough conversational notes or summaries of daily tasks.
* **Deterministic Local AI Structuring:** Analyzes grammar, classifies technical domains, breaks down granular deliverables, identifies technology tags, and infers progress status without hallucinating unperformed tasks or working hours.
* **macOS-Native Interface & Apple HIG Compliance:** Designed specifically for macOS with refined typography, glassmorphism translucency, native titlebar integration, 60fps animations, and system-wide keyboard shortcuts.
* **Spotlight Floating Quick Capture:** Access an instant, distraction-free capture popup anywhere on your desktop via global hotkey (`Cmd + Shift + Space`), enhance notes with `Cmd + Enter`, and sync directly to Excel with `Cmd + S`.
* **Non-Destructive Excel Synchronization:** Appends validated records directly into existing corporate `.xlsx` workbooks while preserving existing cell formatting, formulas, styles, colors, and other worksheets.
* **Local-First Privacy:** Runs 100% locally on your machine with zero external cloud API dependencies, zero remote servers, and zero telemetry.

---

## Download Packages (Release v1.0.1)

WorkLog AI is distributed as a self-contained desktop package. No external runtimes (such as Python, Node.js, Java, or SQLite) or API credentials are required.

| Platform | Architecture | Distribution Format | File Size | Download Link |
| :--- | :--- | :--- | :--- | :--- |
| **macOS** | Apple Silicon (`M1/M2/M3/M4`, `arm64`) | Branded Retina Disk Image (`.dmg`) | 6.2 MB | [WorkLog_AI_1.0.1_macOS_arm64.dmg](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog_AI_1.0.1_macOS_arm64.dmg) |
| **macOS** | Apple Silicon (`M1/M2/M3/M4`, `arm64`) | Portable Application Archive (`.zip`) | 6.1 MB | [WorkLog_AI_1.0.1_macOS_arm64.zip](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog_AI_1.0.1_macOS_arm64.zip) |
| **Windows** | Windows 10 / 11 (64-bit `x64`) | Standalone NSIS Setup (`.exe`) | 4.3 MB | [WorkLog_AI_1.0.1_x64-setup.exe](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog.AI_1.0.1_x64-setup.exe) |

*For release notes and all historical versions, visit the [GitHub Releases](https://github.com/hemanthkumar29/worklog-ai/releases/tag/v1.0.1) page.*

---

## Installation & macOS Gatekeeper Authorization Guide

### macOS Installation

#### Method A: Branded Retina DMG Installer (Recommended)
1. Download [WorkLog_AI_1.0.1_macOS_arm64.dmg](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog_AI_1.0.1_macOS_arm64.dmg).
2. Double-click the downloaded `.dmg` file to open the custom installer window.
3. Drag **WorkLog AI** to the **Applications** folder target.
4. **First Launch Authorization:**  
   Because WorkLog AI is an open-source binary distributed outside the Mac App Store, macOS Gatekeeper flags downloaded binaries with a quarantine attribute. To authorize the app, choose one of the following:
   * **Option 1 (Easiest):** Double-click the `Authorize_App.command` script included inside the DMG installer window.
   * **Option 2 (Finder):** In your `/Applications` folder, right-click (or Control-click) **WorkLog AI**, select **Open**, and click **Open** in the confirmation dialog.
   * **Option 3 (Terminal):** Open Terminal and execute:
     ```bash
     xattr -cr "/Applications/WorkLog AI.app"
     ```
5. Launch WorkLog AI from your Applications folder or Spotlight (`Cmd + Space`).

#### Method B: One-Line Terminal Installer
Install and authorize WorkLog AI automatically in a single command:
```bash
curl -fsSL https://raw.githubusercontent.com/hemanthkumar29/worklog-ai/main/scripts/install.sh | bash
```

---

### Windows Installation

1. Download [WorkLog_AI_1.0.1_x64-setup.exe](https://github.com/hemanthkumar29/worklog-ai/releases/download/v1.0.1/WorkLog.AI_1.0.1_x64-setup.exe).
2. Run the installer and follow the setup wizard prompts.
3. **Windows SmartScreen Notice:**  
   If Windows displays *"Windows protected your PC"*, click **More info**, then select **Run anyway**. This prompt appears for newly compiled open-source executables until code reputation is established.
4. Launch **WorkLog AI** from your Start Menu or Desktop shortcut.

---

## User Experience & Interface Design

### macOS-Native Interface & Apple HIG Compliance
WorkLog AI has been crafted to match the aesthetic and feel of native macOS applications:
* **Native Titlebar Overlay:** Window titlebar set to overlay with inset traffic light controls (`close`, `minimize`, `zoom`) positioned directly over a frosted sidebar.
* **Glassmorphism & Depth:** Layered translucent surfaces featuring background blur (`blur(24px) saturate(180%)`), delicate hairline borders, and subtle elevation drops.
* **Micro-Interactions & Fluid Animations:** Smooth button press states (`active:scale-[0.98]`), Apple ease cubic bezier entrance transitions (`180ms cubic-bezier(0.16, 1, 0.3, 1)`), and 60fps responsiveness.
* **Dark & Light Appearance:** Cohesive appearance in both Dark Mode (deep midnight slate `#0b0f19` with elevated card surfaces) and Light Mode (crisp translucent materials with soft shadows).
* **System Tray Integration:** Persistent menu bar tray icon providing one-click access to Quick Capture, the main dashboard, or app termination.

### System-Wide Keyboard Navigation

| Shortcut | Scope | Action |
| :--- | :--- | :--- |
| `Cmd + Shift + Space` *(macOS)* / `Ctrl + Shift + Space` *(Win)* | Global (Any App) | Toggle Spotlight Quick Capture floating popup |
| `Cmd + 1` | Main Window | Switch to Quick Capture view |
| `Cmd + 2` | Main Window | Switch to Activity History view |
| `Cmd + 3` | Main Window | Switch to Projects view |
| `Cmd + 4` | Main Window | Switch to Excel Integration view |
| `Cmd + 5` | Main Window | Switch to Reports & Analytics view |
| `Cmd + 6` or `Cmd + ,` | Main Window | Switch to Settings / Preferences view |
| `Cmd + N` | Main Window | Jump to new Quick Capture entry |
| `Cmd + Enter` | Quick Capture | Enhance natural language notes with local AI |
| `Cmd + S` | Quick Capture | Save record locally and sync to connected Excel workbook |
| `Cmd + O` | Spotlight Popup | Open full application dashboard |
| `Escape` | Spotlight / Modals | Dismiss popup or close active modal |

---

## Operational Walkthrough

### 1. Three-Step Onboarding
Upon first launch, configure your local environment:
* **User Profile:** Enter your display name (e.g., *Jane Doe*) and preferred date formatting standard (`YYYY-MM-DD`, `DD/MM/YYYY`, or `MM/DD/YYYY`).
* **Initial Project:** Define your primary project identifier (e.g., *Core Banking Modernization*).
* **Excel Workbook Association:** Connect an existing corporate `.xlsx` spreadsheet, or select Skip to configure workbook mapping at a later time.

All configuration is saved locally in SQLite and retained across restarts.

---

### 2. Spotlight Floating Quick Capture
Trigger the floating quick capture card from any application using `Cmd + Shift + Space`:

```text
I worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates. Spent 2.5 hours.
```

Press `Cmd + Enter` to trigger the offline inference engine:
* **Title:** Salesforce Account Duplicate Prevention
* **Category:** `RESEARCH_AND_TESTING`
* **Status:** `IN_PROGRESS`
* **Duration:** 150 minutes (2.5 hours)
* **Summary:** Researched and tested Salesforce duplicate prevention mechanisms for Account records.
* **Granular Deliverables:**
  * Explored Matching Rules and Duplicate Rules
  * Tested account creation with similar names
  * Investigated duplicate detection issues in record-triggered flows
* **Technologies:** `Salesforce`, `Matching Rules`, `Duplicate Rules`
* **Challenges:** Investigating duplicate detection in record-triggered flows
* **Next Steps:** Continue validating duplicate prevention scenarios

Press `Cmd + S` to record the entry in SQLite and atomically append it to your connected Excel spreadsheet.

---

### 3. Excel Inspection & Field Mapping
1. Open the **Excel Integration** view from the primary sidebar or press `Cmd + 4`.
2. Select your corporate `.xlsx` file. The inspection engine automatically analyzes:
   * Available worksheets in the workbook
   * Header row identification
   * Existing column titles and sample records
   * File lock status (detects active locks by Microsoft Excel)
3. Select the target destination sheet (e.g., `Daily_Logs`).
4. Validate auto-matched field mappings:

| WorkLog AI Schema Field | Target Excel Column | Match Algorithm |
| :--- | :--- | :--- |
| Date | `Log Date` / `Work Date` | Exact / Synonym Heuristic |
| Employee Name | `Resource Name` / `Associate Name` | Exact / Synonym Heuristic |
| Project Name | `Project` / `Project Name` | Exact / Synonym Heuristic |
| Activity Title | `Task Title` / `Activity` | Exact / Synonym Heuristic |
| Description | `Work Description` / `Details` | Exact / Synonym Heuristic |
| Category | `Category` / `Activity Type` | Exact / Synonym Heuristic |
| Hours | `Duration` / `Hours Spent` | Exact / Synonym Heuristic |
| Status | `Status` / `Progress` | Exact / Synonym Heuristic |

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
The **Reports** view (`Cmd + 5`) provides consolidated productivity summaries:
* Total accumulated hours across selectable date ranges
* Status distribution metrics (Completed vs. In-Progress vs. Blocked)
* Project-specific time allocations
* **CSV Export:** Generates unformatted tabular data for custom processing.
* **PDF Export:** Produces formatted, executive-ready documentation for management standups and performance reviews.

---

## Technical Architecture & Privacy Matrix

```
[ User Input / Global Hotkey: Cmd+Shift+Space ]
                       │
                       ▼
          [ Tauri 2 Native Layer ]
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
 [ Spotlight Popup ] [ Dashboard ] [ System Tray ]
        │              │              │
        └───────┬──────┴──────────────┘
                │ (Rust IPC)
                ▼
      [ React 18 + TypeScript UI ]
        - macOS HIG Glassmorphism Tokens
        - Zustand State Hydration
        - Native Keyboard Router (Cmd+1..Cmd+6)
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
  * macOS: Xcode Command Line Tools (`xcode-select --install`) and Python 3 with `Pillow`
  * Windows: Visual Studio C++ Build Tools and WebView2 Runtime

### Build Instructions

```bash
# Clone the repository
git clone https://github.com/hemanthkumar29/worklog-ai.git
cd worklog-ai

# Install web dependencies
cd apps/desktop
npm install

# Run frontend test suite (10 Vitest tests)
npm test

# Build production web bundle
npm run build

# Run backend test suite (6 Rust integration tests)
cd src-tauri
cargo test --offline

# Launch application in local development mode
cd ..
npm run tauri dev

# Compile macOS release application bundle
npm run tauri build -- --bundles app

# Generate custom Retina DMG installer package
cd ../..
./scripts/create_dmg.sh
```

Generated packages will be output to:
* macOS Application: `apps/desktop/src-tauri/target/release/bundle/macos/WorkLog AI.app`
* macOS Retina DMG: `dist-packages/WorkLog_AI_1.0.1_macOS_arm64.dmg`
* macOS Portable Archive: `dist-packages/WorkLog_AI_1.0.1_macOS_arm64.zip`
* Windows Setup: `apps/desktop/src-tauri/target/release/bundle/nsis/*.exe`

---

## Automated Verification Suite

The repository contains automated unit and integration tests covering all critical components:

| Module / Test File | Test Scope | Status |
| :--- | :--- | :--- |
| `stores.test.ts` (Vitest) | Activity, Project, and User Zustand state management | Passed |
| `utils.test.ts` (Vitest) | Date formatting, duration conversions, and string utilities | Passed |
| `ai_enhancement_test.rs` (Cargo) | Deterministic NLP parsing, technology extraction, anti-hallucination | Passed |
| `ai_enhancement_test.rs` (Cargo) | Bug fixing classification and decimal time extraction (2.5h -> 150m) | Passed |
| `database_test.rs` (Cargo) | SQLite schema migrations, foreign keys, cascading deletions | Passed |
| `mapper_test.rs` (Cargo) | Heuristic fuzzy column matching and synonym mapping | Passed |
| `excel_writer_test.rs` (Cargo) | OpenXML zip-stream appending, backup creation, formula preservation | Passed |
| `e2e_workflow_test.rs` (Cargo) | Complete end-to-end user scenario (profile -> capture -> AI -> Excel sync) | Passed |

Run all tests:
```bash
# Frontend tests
cd apps/desktop && npm test

# Backend tests
cd apps/desktop/src-tauri && cargo test --offline
```

---

## License

WorkLog AI is open-source software licensed under the [MIT License](LICENSE).  
Copyright (c) 2026 Hemanth Kumar.
