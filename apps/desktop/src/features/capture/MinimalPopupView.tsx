import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileSpreadsheet,
} from "lucide-react";
import { useActivityStore } from "../../stores/useActivityStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useExcelStore } from "../../stores/useExcelStore";
import { tauriApi } from "../../services/tauriApi";
import { ActivityType, ActivityStatus, AIStructuredOutput } from "../../types";

export const MinimalPopupView: React.FC = () => {
  const { projects, activeProjectId, setActiveProject, loadProjects } = useProjectStore();
  const { enhanceInput, saveActivity, syncToExcel, isEnhancing, isSyncing } = useActivityStore();
  const { connections, loadConnections } = useExcelStore();

  const [rawInput, setRawInput] = useState("");
  const [hasEnhanced, setHasEnhanced] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("DEVELOPMENT");
  const [status, setStatus] = useState<ActivityStatus>("COMPLETED");
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number | null>(null);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);

  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadProjects();
    loadConnections();
    // Auto focus textarea when popup opens
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, [loadProjects, loadConnections]);

  // Global keydown listeners inside popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!hasEnhanced && rawInput.trim()) {
          handleEnhance();
        } else if (hasEnhanced) {
          handleSaveAndSync();
        }
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        if (hasEnhanced) {
          handleSaveAndSync();
        }
      } else if ((e.metaKey || e.ctrlKey) && (e.key === "o" || e.key === "O")) {
        e.preventDefault();
        handleOpenDashboard();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasEnhanced, rawInput, title, description, activityType, status, timeSpentMinutes, tasks, technologies, challenges, nextSteps]);

  const handleClose = async () => {
    try {
      await tauriApi.hideQuickCapture();
    } catch {
      // In dev browser fallback
      window.close();
    }
  };

  const handleOpenDashboard = async () => {
    try {
      await tauriApi.openDashboard();
      await tauriApi.hideQuickCapture();
    } catch (err) {
      console.error("Open dashboard error", err);
    }
  };

  const handleEnhance = async () => {
    if (!rawInput.trim() || isEnhancing) return;
    setStatusMessage(null);

    try {
      const output: AIStructuredOutput = await enhanceInput(
        rawInput.trim(),
        activeProjectId || undefined
      );

      setTitle(output.activityTitle || "Work Activity");
      setDescription(output.description || rawInput);
      setActivityType(output.activityType || "DEVELOPMENT");
      setStatus(output.status || "COMPLETED");
      setTimeSpentMinutes(output.timeSpentMinutes ?? null);
      setTechnologies(output.technologies || []);
      setTasks(output.detailedTasks || []);
      setChallenges(output.challenges || []);
      setNextSteps(output.nextSteps || []);
      setHasEnhanced(true);
    } catch (err: any) {
      setTitle(rawInput.slice(0, 50));
      setDescription(rawInput);
      setHasEnhanced(true);
      setStatusMessage({
        type: "error",
        text: "Offline heuristic parser applied.",
      });
    }
  };

  const handleSaveOnly = async () => {
    if (!activeProjectId) {
      setStatusMessage({ type: "error", text: "Select a project first." });
      return;
    }

    try {
      const today = new Date().toISOString().split("T")[0];
      await saveActivity({
        projectId: activeProjectId,
        activityDate: today,
        rawInput,
        activityTitle: title.trim() || "Untitled Activity",
        enhancedDescription: description.trim() || rawInput,
        activityType,
        status,
        timeSpentMinutes,
        tasks,
        technologies,
        challenges,
        nextSteps,
      });

      setStatusMessage({ type: "success", text: "Saved locally in SQLite database!" });
      setTimeout(() => {
        resetAndClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.toString() || "Save failed." });
    }
  };

  const handleSaveAndSync = async () => {
    if (!activeProjectId) {
      setStatusMessage({ type: "error", text: "Select a project first." });
      return;
    }

    const activeProject = projects.find((p) => p.id === activeProjectId);
    const connection =
      connections.find((c) => c.id === activeProject?.excelConnectionId) ||
      connections[0];

    if (!connection || !connection.templates || connection.templates.length === 0) {
      // Fallback to local save if no Excel template configured yet
      await handleSaveOnly();
      return;
    }

    const template = connection.templates[0];

    try {
      const today = new Date().toISOString().split("T")[0];
      const saved = await saveActivity({
        projectId: activeProjectId,
        activityDate: today,
        rawInput,
        activityTitle: title.trim() || "Untitled Activity",
        enhancedDescription: description.trim() || rawInput,
        activityType,
        status,
        timeSpentMinutes,
        tasks,
        technologies,
        challenges,
        nextSteps,
      });

      const syncResult = await syncToExcel(saved.id, template.id);
      setStatusMessage({
        type: "success",
        text: `Appended to row ${syncResult.rowNumber} in '${syncResult.sheetName}'!`,
      });

      setTimeout(() => {
        resetAndClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "Saved locally. Excel file may be open or locked.",
      });
    }
  };

  const resetAndClose = () => {
    setRawInput("");
    setHasEnhanced(false);
    setTitle("");
    setDescription("");
    setStatusMessage(null);
    handleClose();
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-between p-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl text-slate-900 dark:text-slate-100 font-sans border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl select-none overflow-hidden">
      {/* Top Header / Drag Region */}
      <div
        className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 cursor-default"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold tracking-tight">WorkLog AI</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
            Quick Capture
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Selector Pill */}
          <select
            value={activeProjectId || ""}
            onChange={(e) => setActiveProject(e.target.value)}
            className="text-xs font-medium bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            {projects.length === 0 && <option value="">Default Project</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Full Dashboard Link */}
          <button
            onClick={handleOpenDashboard}
            title="Open Full Dashboard (⌘O)"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            title="Dismiss (Esc)"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 py-3 overflow-y-auto">
        {!hasEnhanced ? (
          <div className="flex flex-col h-full justify-between">
            <textarea
              ref={textareaRef}
              rows={4}
              placeholder="Describe what you worked on today... (e.g. Tested Salesforce duplicate rules, fixed trigger flow bug, updated unit tests - 2.5 hrs)"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full h-full resize-none bg-transparent text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
              <div className="flex gap-2">
                <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => setRawInput("Investigated bug and fixed failing test suite in staging - 2 hrs")}>
                  + Bug Fix
                </span>
                <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => setRawInput("Architected and implemented new feature API endpoints with documentation - 3 hrs")}>
                  + Feature
                </span>
                <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer" onClick={() => setRawInput("Team sprint planning, backlog grooming, and architecture sync - 1.5 hrs")}>
                  + Meeting
                </span>
              </div>
              <span>Press <kbd className="font-mono font-bold">⌘+Enter</kbd> to Enhance</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Structured Activity Title"
              className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800">
                {activityType}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                {status}
              </span>
              {timeSpentMinutes && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {(timeSpentMinutes / 60).toFixed(1)} hrs
                </span>
              )}
              {technologies.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Description Preview */}
            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
              {description}
            </p>
          </div>
        )}
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`py-1.5 px-3 rounded-lg text-xs font-medium flex items-center gap-2 mb-2 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          <span className="truncate">{statusMessage.text}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <button
          onClick={handleClose}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
        >
          Dismiss (Esc)
        </button>

        <div className="flex items-center gap-2">
          {!hasEnhanced ? (
            <button
              onClick={handleEnhance}
              disabled={!rawInput.trim() || isEnhancing}
              className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
            >
              {isEnhancing ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Enhance (⌘+Enter)</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => setHasEnhanced(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition-colors"
              >
                Re-edit
              </button>
              <button
                onClick={handleSaveOnly}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Save Locally
              </button>
              <button
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
              >
                {isSyncing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>Sync & Close (⌘S)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
