import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  ShieldCheck,
  Table,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
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

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const worklogFieldDefinitions: Array<{
    id: StandardWorkLogField;
    label: string;
    description: string;
    required: boolean;
  }> = [
    { id: "activityDate", label: "Date", description: "Activity log date (e.g. 2026-11-09)", required: true },
    { id: "employeeName", label: "Employee Name", description: "User's display name", required: false },
    { id: "projectName", label: "Project Name", description: "Associated project", required: true },
    { id: "activityTitle", label: "Activity Title", description: "Structured task title", required: true },
    { id: "description", label: "Detailed Description", description: "AI enhanced professional description", required: true },
    { id: "activityType", label: "Category / Task Type", description: "e.g. Development, Bug Fixing, Research", required: false },
    { id: "technologies", label: "Technologies Used", description: "Comma-separated tech keywords", required: false },
    { id: "timeSpentHours", label: "Duration (Hours)", description: "Decimal hours (e.g. 2.50)", required: false },
    { id: "status", label: "Status", description: "Completed, In Progress, Blocked", required: false },
    { id: "challenges", label: "Challenges / Blockers", description: "Key blockers or edge cases", required: false },
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
        message: "Workbook inspected successfully! Sheets and headers loaded.",
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
        message: `Template '${templateName}' saved successfully for sheet '${selectedSheetName}'!`,
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          Excel Integration Engine
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Map your company's existing Excel workbook columns to WorkLog AI fields. Appends rows safely with zero formatting loss.
        </p>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            notification.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* File Inspector Card */}
      <Card className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Target Excel Workbook Path (.xlsx)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/Users/username/Work/Timesheets/Daily_Work_Log.xlsx"
              value={inputFilePath}
              onChange={(e) => setInputFilePath(e.target.value)}
              className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              onClick={handleInspect}
              isLoading={isInspecting}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Inspect File
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Accepts standard Microsoft Excel .xlsx files. Existing worksheets, charts, styles, and formulas are fully preserved.
          </p>
        </div>

        {/* Saved Connections Quick Selector */}
        {connections.length > 0 && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Previously Inspected Workbooks:
            </span>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {connections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setInputFilePath(c.filePath);
                    inspectFile(c.filePath);
                  }}
                  className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Active Inspection Result & Column Mapping */}
      {activeInspection && (
        <Card className="space-y-6 animate-in fade-in duration-300">
          {/* File Meta Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-600" />
                {activeInspection.fileName}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-lg">
                {activeInspection.filePath}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={activeInspection.isLocked ? "warning" : "success"} size="sm">
                {activeInspection.isLocked ? "File In Use / Locked" : "Ready for Sync"}
              </Badge>
              <Badge variant="neutral" size="sm">
                {(activeInspection.fileSizeBytes / 1024).toFixed(1)} KB
              </Badge>
            </div>
          </div>

          {/* Worksheet Selector Tabs */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Select Worksheet to Map & Append to:
            </label>
            <div className="flex flex-wrap gap-2">
              {activeInspection.sheets.map((sheet: ExcelSheetInfo) => (
                <button
                  key={sheet.name}
                  onClick={() => setSelectedSheet(sheet.name)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer font-medium ${
                    selectedSheetName === sheet.name
                      ? "bg-brand-50 dark:bg-brand-950 border-brand-500 text-brand-700 dark:text-brand-300 shadow-2xs"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {sheet.name} ({sheet.rowCount} rows)
                </button>
              ))}
            </div>
          </div>

          {/* Visual Column Mapping Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Field Mapping Configuration
                </h4>
                <p className="text-[11px] text-slate-400">
                  Select which Excel column in sheet '{selectedSheetName}' corresponds to each field.
                </p>
              </div>
              <Input
                placeholder="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                className="w-52 py-1 text-xs"
              />
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 px-4">WorkLog AI Field</th>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4">Mapped Excel Column</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {worklogFieldDefinitions.map((field) => {
                    const mappedColIdx = currentMappings[field.id];
                    return (
                      <tr key={field.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {field.label}
                          {field.required && (
                            <span className="text-rose-500 ml-1 font-bold">*</span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400">
                          {field.description}
                        </td>
                        <td className="py-2.5 px-4">
                          <select
                            value={mappedColIdx !== null ? mappedColIdx.toString() : ""}
                            onChange={(e) =>
                              setMapping(
                                field.id,
                                e.target.value === "" ? null : parseInt(e.target.value, 10)
                              )
                            }
                            className="w-full text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1 focus:outline-none cursor-pointer"
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
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Safe append mode active: formulas and styling remain untouched.</span>
            </div>

            <Button
              onClick={handleSaveTemplate}
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
            >
              Save Mapping Template
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
