import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  ShieldCheck,
  Table,
  FolderOpen,
  FileCheck,
} from "lucide-react";
import { open as openFileDialog } from "@tauri-apps/plugin-dialog";
import { useExcelStore } from "../../stores/useExcelStore";
import { StandardWorkLogField, ExcelSheetInfo } from "../../types";

export const ExcelIntegrationView: React.FC = () => {
  const {
    connections,
    activeInspection,
    selectedSheetName,
    currentMappings,
    isInspecting,
    isSaving,
    loadConnections,
    inspectFile,
    setSelectedSheet,
    setMapping,
    saveTemplate,
  } = useExcelStore();

  const [inputFilePath, setInputFilePath] = useState("");
  const [templateName, setTemplateName] = useState("Standard Company WorkLog");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleBrowseFile = async () => {
    try {
      const selected = await openFileDialog({
        multiple: false,
        filters: [{ name: "Excel Workbook", extensions: ["xlsx"] }],
      });
      if (selected && typeof selected === "string") {
        setInputFilePath(selected);
        setNotification(null);
      }
    } catch (err) {
      console.error("Browse file error", err);
    }
  };

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const worklogFieldDefinitions: Array<{
    id: StandardWorkLogField;
    label: string;
    description: string;
    required: boolean;
  }> = [
    { id: "activityDate", label: "Date", description: "Activity log date (e.g. 2026-11-10)", required: true },
    { id: "employeeName", label: "Employee Name", description: "User's display name or ID", required: false },
    { id: "projectName", label: "Project Name", description: "Associated project context", required: true },
    { id: "activityTitle", label: "Activity Title", description: "Structured task title", required: true },
    { id: "description", label: "Detailed Description", description: "AI enhanced professional description", required: true },
    { id: "activityType", label: "Category / Type", description: "e.g. Development, Bug Fixing, Architecture", required: false },
    { id: "technologies", label: "Technologies Used", description: "Comma-separated tech keywords", required: false },
    { id: "timeSpentHours", label: "Duration (Hours)", description: "Decimal hours (e.g. 2.50)", required: false },
    { id: "status", label: "Status", description: "Completed, In Progress, Blocked", required: false },
    { id: "challenges", label: "Challenges / Blockers", description: "Key blockers or edge cases handled", required: false },
    { id: "nextSteps", label: "Next Steps", description: "Pending follow-ups or remaining tasks", required: false },
    { id: "detailedTasks", label: "Detailed Action Items", description: "Bulletized task breakdown", required: false },
  ];

  const handleInspect = async () => {
    if (!inputFilePath.trim()) return;
    setNotification(null);
    try {
      await inspectFile(inputFilePath.trim());
      setNotification({
        type: "success",
        message: "Workbook inspected successfully. Worksheets and headers ready for mapping.",
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.toString() || "Failed to inspect workbook file.",
      });
    }
  };

  const handleSaveTemplate = async () => {
    if (!activeInspection || !selectedSheetName) return;
    const connection = connections.find((c) => c.filePath === activeInspection.filePath);
    if (!connection) return;

    setNotification(null);
    try {
      const sheet = activeInspection.sheets.find((s: ExcelSheetInfo) => s.name === selectedSheetName);
      await saveTemplate({
        connectionId: connection.id,
        templateName: templateName.trim() || "Default Template",
        sheetName: selectedSheetName,
        headerRowIndex: sheet?.headerRowIndex || 1,
      });

      setNotification({
        type: "success",
        message: `Template '${templateName}' saved successfully for sheet '${selectedSheetName}'.`,
      });
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.toString() || "Failed to save mapping template.",
      });
    }
  };

  const selectedSheet = activeInspection?.sheets.find((s: ExcelSheetInfo) => s.name === selectedSheetName);
  const excelHeaders = selectedSheet?.headers || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none animate-apple-in">
      {/* Native macOS Sub-Toolbar */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-[#34C759] dark:text-[#30D158]" />
            Excel Integration Engine
          </h2>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Atomic Safe Append
          </span>
        </div>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
          Map company Excel workbooks to WorkLog AI fields. Appends rows non-destructively without altering formulas, styling, or existing data.
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 animate-apple-in ${
            notification.type === "success"
              ? "bg-[#34C759]/10 border-[#34C759]/25 text-[#34C759] dark:text-[#30D158]"
              : "bg-[#FF3B30]/10 border-[#FF3B30]/25 text-[#FF3B30] dark:text-[#FF453A]"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span className="text-[12px] font-medium leading-relaxed">{notification.message}</span>
        </div>
      )}

      {/* Target Workbook Card */}
      <div className="macos-card p-5 space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Target Excel Workbook (.xlsx)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/Users/username/Work/Timesheets/Daily_Work_Log.xlsx"
              value={inputFilePath}
              onChange={(e) => setInputFilePath(e.target.value)}
              className="macos-input flex-1 font-mono text-[12px]"
            />
            <button
              onClick={handleBrowseFile}
              className="macos-btn-secondary cursor-pointer"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Browse...</span>
            </button>
            <button
              onClick={handleInspect}
              disabled={isInspecting || !inputFilePath.trim()}
              className="macos-btn-primary cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isInspecting ? "animate-spin" : ""}`} />
              <span>Inspect</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Preserves all worksheets, macros, styling, and cell formats automatically.</span>
          </p>
        </div>

        {/* Previously Inspected Workbooks */}
        {connections.length > 0 && (
          <div className="pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Recent Connections:
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {connections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setInputFilePath(c.filePath);
                    inspectFile(c.filePath);
                  }}
                  className="text-[12px] px-2.5 py-1 rounded-md border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] hover:bg-black/[0.07] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer macos-button-press"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-medium">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Workbook Inspection & Column Mapping */}
      {activeInspection && (
        <div className="macos-card p-5 space-y-5 animate-apple-in">
          {/* File Meta Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div>
              <h3 className="font-bold text-[14px] text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {activeInspection.fileName}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                {activeInspection.filePath}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                  activeInspection.isLocked
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    : "bg-[#34C759]/15 text-[#34C759] dark:text-[#30D158]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {activeInspection.isLocked ? "File In Use" : "Ready for Sync"}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-[11px] font-mono text-slate-500">
                {(activeInspection.fileSizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>
          </div>

          {/* Worksheet Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Select Worksheet to Map & Append
            </label>
            <div className="flex flex-wrap gap-2">
              {activeInspection.sheets.map((sheet: ExcelSheetInfo) => (
                <button
                  key={sheet.name}
                  onClick={() => setSelectedSheet(sheet.name)}
                  className={`text-[12px] px-3 py-1.5 rounded-md border transition-all cursor-pointer font-medium macos-button-press ${
                    selectedSheetName === sheet.name
                      ? "bg-[#007AFF] text-white border-transparent shadow-xs"
                      : "border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  {sheet.name} ({sheet.rowCount} rows)
                </button>
              ))}
            </div>
          </div>

          {/* Column Mapping Table */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-[12px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Field to Column Mapping
                </h4>
                <p className="text-[11px] text-slate-400">
                  Select which Excel column in sheet '{selectedSheetName}' corresponds to each field.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium text-slate-500">Template:</span>
                <input
                  type="text"
                  placeholder="Template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="macos-input w-48 py-1 text-[12px]"
                />
              </div>
            </div>

            {/* NSTableView-style Table Container */}
            <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-white/50 dark:bg-black/20">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="bg-black/[0.03] dark:bg-white/[0.05] border-b border-black/[0.08] dark:border-white/[0.08] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">WorkLog Field</th>
                    <th className="py-2.5 px-4 font-semibold">Description</th>
                    <th className="py-2.5 px-4 font-semibold">Mapped Excel Column</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
                  {worklogFieldDefinitions.map((field) => {
                    const mappedColIdx = currentMappings[field.id];
                    return (
                      <tr key={field.id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors">
                        <td className="py-2 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {field.label}
                          {field.required && (
                            <span className="text-[#FF3B30] ml-1 font-bold">*</span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                          {field.description}
                        </td>
                        <td className="py-2 px-4">
                          <select
                            value={mappedColIdx !== null ? mappedColIdx.toString() : ""}
                            onChange={(e) =>
                              setMapping(
                                field.id,
                                e.target.value === "" ? null : parseInt(e.target.value, 10)
                              )
                            }
                            className="macos-input w-full py-1 text-[12px] cursor-pointer"
                          >
                            <option value="">-- Unmapped / Skip --</option>
                            {excelHeaders.map((header: string, idx: number) => (
                              <option key={idx} value={idx}>
                                Column {idx + 1}: {header || `(Blank Header)`}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Safe append: backups generated automatically before every write operation.</span>
            </div>

            <button
              onClick={handleSaveTemplate}
              disabled={isSaving}
              className="macos-btn-primary cursor-pointer disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              <span>Save Mapping Template</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
