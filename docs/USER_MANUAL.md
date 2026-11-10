# WorkLog AI — Official User Manual

## Table of Contents
1. Introduction & Core Philosophy
2. Getting Started & Onboarding
3. Quick Capture Workflow
4. Managing Projects
5. Connecting & Mapping Excel Workbooks
6. Activity History & Search
7. Reporting & Analytics (PDF & CSV Export)
8. Settings & Local Data Management
9. Troubleshooting & FAQ

---

## 1. Introduction & Core Philosophy

WorkLog AI is an intelligent, self-contained desktop application designed to eliminate the daily friction of writing and updating timesheets.

Unlike cloud tools that transmit confidential company task descriptions over the internet, WorkLog AI executes 100% locally on your computer. Your work descriptions, project contexts, database entries, and Excel sheets never leave your device.

---

## 2. Getting Started & Onboarding

When you open WorkLog AI for the first time, the **3-Step Welcome Wizard** guides you through initial setup:

1. **Step 1: Local Profile**
   - Enter your **Display Name** (e.g. *Sarah Jenkins*). This is automatically written into the "Associate / Employee" column in your Excel timesheet.
   - Choose your preferred **Date Format** (`YYYY-MM-DD`, `DD/MM/YYYY`, or `MM/DD/YYYY`).
2. **Step 2: Create First Project**
   - Enter a project name (e.g. *Global Payment Gateway*).
   - Enter client/organization name and technologies (e.g. *Java, Spring Boot, React, Kafka*).
3. **Step 3: Connect Excel Workbook (Optional)**
   - Enter or select the file path to your existing `.xlsx` timesheet.
   - You can also skip this step and configure it later from the **Excel Integration** tab.

Click **Finish Setup** to enter your workspace.

---

## 3. Quick Capture Workflow & Spotlight Mode

The Quick Capture interface is designed for minimal keystrokes, fast daily entry, and zero disruption to your flow.

### Spotlight Floating Quick Capture
WorkLog AI features a floating Quick Capture popup inspired by macOS Spotlight and Raycast:
1. Press the global shortcut `Cmd + Shift + Space` (on macOS) or `Ctrl + Shift + Space` (on Windows) from any application.
2. The sleek, translucent Quick Capture card floats over your active windows with focus immediately inside the input field.
3. Enter your raw notes and use the native shortcuts:
   * **`Cmd + Enter`**: Enhance notes with local AI.
   * **`Cmd + S`**: Save record locally and sync directly to Excel.
   * **`Cmd + O`**: Open the full application dashboard.
   * **`Escape`**: Instantly dismiss and hide the popup.

### Step-by-Step Entry in Main Dashboard:
1. Navigate to Quick Capture via the sidebar or press `Cmd + 1`.
2. Select your active project and verify the date (defaults to today).
3. In the text area, describe what you did today in plain English. For example:
   > *"Spent 2.5 hours investigating a memory leak in the payment webhook consumer. Discovered unclosed database connections during connection timeouts. Patched the connection pool and verified in staging."*
4. Click **Enhance with Local AI** (or press `Cmd + Enter`):
   - The AI engine generates a structured title: `Payment Webhook: Memory Leak Investigation`.
   - Categorizes it as `BUG_FIXING`.
   - Infers status as `COMPLETED`.
   - Extracts time spent as `150 minutes (2.5h)`.
   - Generates bulleted tasks:
     - *Investigated memory leak in payment webhook consumer*
     - *Discovered unclosed database connections during connection timeouts*
     - *Patched connection pool and verified in staging*
   - Detects technologies: `Database`, `Staging`.
5. Review the structured card. You can edit any field, add/remove tasks, or adjust time spent.
6. Click **Approve & Sync to Excel** (or press `Cmd + S`) to immediately record the activity locally and append the row to your company's Excel spreadsheet.

### macOS-Native Keyboard Shortcuts

| Key Combination | Action |
|---|---|
| `Cmd + Shift + Space` | Toggle Spotlight Quick Capture popup from any app |
| `Cmd + 1` | Switch to Quick Capture |
| `Cmd + 2` | Switch to Activity History |
| `Cmd + 3` | Switch to Projects |
| `Cmd + 4` | Switch to Excel Integration |
| `Cmd + 5` | Switch to Reports & Analytics |
| `Cmd + 6` or `Cmd + ,` | Open Settings & Preferences |
| `Cmd + N` | New Quick Capture entry |
| `Cmd + Enter` | Enhance notes with local AI |
| `Cmd + S` | Save & sync to Excel |
| `Escape` | Dismiss popup or close modal |

---

## 4. Connecting & Mapping Excel Workbooks

### Inspecting Existing Spreadsheets
1. Open the **Excel Integration** tab.
2. Paste or select the path to your corporate `.xlsx` workbook.
3. Click **Inspect File**.
4. WorkLog AI reads the workbook without modifying it, detecting:
   - All worksheet tabs.
   - Column header row and column names.
   - Total row count and lock status.

### Mapping Columns
1. Select the worksheet you want to append logs to (e.g. `Daily Logs` or `Timesheet`).
2. Match each WorkLog AI field to your company's column:
   - `Date` $\rightarrow$ `Work Date`
   - `Employee Name` $\rightarrow$ `Developer Name`
   - `Project Name` $\rightarrow$ `Project`
   - `Activity Title` $\rightarrow$ `Task Title`
   - `Detailed Description` $\rightarrow$ `Work Details`
   - `Duration (Hours)` $\rightarrow$ `Hours Logged`
   - `Status` $\rightarrow$ `Status`
3. Click **Save Mapping Template**. WorkLog AI will remember this mapping for all future syncs.

---

## 5. Activity History & Search

The **Activity History** screen provides a complete, searchable log of all past work entries:
- **Instant Search:** Type any keyword, technology, or title to filter activities in real time.
- **Filters:** Filter by project, status (Completed / In Progress), or sync state (Synced / Pending).
- **View Full Details:** Click the eye icon to view the full details drawer, which displays the **unmodified original user input** alongside the AI enhanced version and detailed bullet points.
- **Edit & Delete:** Modify entries or safely delete them with confirmation.
- **Retry Excel Sync:** Click the Excel icon on any unsynced or failed item to re-attempt synchronization.

---

## 6. Reporting & Analytics

WorkLog AI includes built-in reporting to help you prepare status updates for managers and clients:
- **Daily Summary:** Shows total activities logged, completed vs in-progress tasks, total hours, and project breakdown.
- **Export to CSV:** Generates a clean comma-separated values file suitable for spreadsheet import.
- **Export to PDF:** Generates a formatted, publication-ready PDF document with headings, bullet points, and project tags.

---

## 7. Troubleshooting & FAQ

### Q: Why did Excel sync fail with "File is in use / locked"?
**A:** Microsoft Excel locks files exclusively when open. Simply save and close the file in Excel, then return to WorkLog AI and click the sync icon. Your activity remains completely safe in SQLite and is never lost.

### Q: Does WorkLog AI preserve my existing Excel styles and formulas?
**A:** Yes. WorkLog AI uses surgical OpenXML appending. It only touches the target worksheet data table to append the new row. Formulas, cell formatting, font colors, and other worksheets remain byte-for-byte intact. An automated `.bak` backup copy is also created before every write.

### Q: Where is my data saved?
- **macOS:** `~/Library/Application Support/com.worklog.ai/worklog.db`
- **Windows:** `%APPDATA%\com.worklog.ai\worklog.db`

### Q: Can I run WorkLog AI without internet?
**A:** Yes. The application has zero cloud dependencies and works 100% offline.
