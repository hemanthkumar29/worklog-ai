import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  FileSpreadsheet,
  Clock,
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
      }, 900);
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
      }, 1000);
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: "Saved locally. Excel file may be locked by another application.",
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
    <div className="h-screen w-screen flex flex-col justify-between p-4 macos-popup-glass text-slate-900 dark:text-slate-100 font-sans rounded-2xl select-none overflow-hidden animate-apple-in border border-white/60 dark:border-white/15">
      {/* Top Header / Drag Region */}
      <div
        className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08] cursor-default"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[13px] font-bold tracking-tight">WorkLog AI</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-slate-500">
            ⌘⇧Space
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Project Selector Pill */}
          <select
            value={activeProjectId || ""}
            onChange={(e) => setActiveProject(e.target.value)}
            className="text-[12px] font-medium bg-black/[0.04] dark:bg-white/[0.08] border border-black/10 dark:border-white/10 rounded-md px-2.5 py-1 text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            {projects.length === 0 && <option value="">Default Project</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="dark:bg-[#1c1c1e]">
                {p.name}
              </option>
            ))}
          </select>

          {/* Full Dashboard Link */}
          <button
            onClick={handleOpenDashboard}
            title="Open Full Dashboard (⌘O)"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors macos-button-press cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            title="Dismiss (Esc)"
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors macos-button-press cursor-pointer"
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
              placeholder="What did you work on today? (e.g. Investigated memory leak in websocket engine, wrote unit tests - 2.5 hrs)"
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full h-full resize-none bg-transparent text-[13px] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none leading-relaxed font-sans"
            />

            <div className="flex items-center justify-between pt-2.5 border-t border-black/[0.06] dark:border-white/[0.06] text-[11px] text-slate-400">
              <div className="flex gap-2">
                <button
                  type="button"
                  className="hover:text-[#007AFF] dark:hover:text-[#0A84FF] cursor-pointer transition-colors"
                  onClick={() => setRawInput("Investigated bug and fixed failing test suite in staging - 2 hrs")}
                >
                  + Bug Fix
                </button>
                <button
                  type="button"
                  className="hover:text-[#007AFF] dark:hover:text-[#0A84FF] cursor-pointer transition-colors"
                  onClick={() => setRawInput("Architected and implemented new feature API endpoints with documentation - 3 hrs")}
                >
                  + Feature
                </button>
                <button
                  type="button"
                  className="hover:text-[#007AFF] dark:hover:text-[#0A84FF] cursor-pointer transition-colors"
                  onClick={() => setRawInput("Sprint planning, technical architecture review, and backlog grooming - 1.5 hrs")}
                >
                  + Meeting
                </button>
              </div>
              <span className="flex items-center gap-1">
                <span>Enhance</span>
                <kbd className="macos-kbd">⌘↵</kbd>
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5 animate-apple-in">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Structured Activity Title"
              className="macos-input w-full text-[13px] font-bold"
            />

            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="px-2 py-0.5 rounded-md bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF] font-semibold border border-[#007AFF]/25">
                {activityType}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-[#34C759]/15 text-[#34C759] dark:text-[#30D158] font-semibold border border-[#34C759]/25">
                ● {status}
              </span>
              {timeSpentMinutes && (
                <span className="px-2 py-0.5 rounded-md bg-black/[0.05] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {(timeSpentMinutes / 60).toFixed(1)} hrs
                </span>
              )}
              {technologies.map((t, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 border border-black/[0.04] dark:border-white/[0.06]"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Description Preview */}
            <div className="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed bg-black/[0.02] dark:bg-white/[0.03] p-2.5 rounded-lg border border-black/[0.06] dark:border-white/[0.06]">
              {description}
            </div>
          </div>
        )}
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div
          className={`py-1.5 px-3 rounded-lg text-[12px] font-medium flex items-center gap-2 mb-2 animate-apple-in ${
            statusMessage.type === "success"
              ? "bg-[#34C759]/15 text-[#34C759] dark:text-[#30D158] border border-[#34C759]/25"
              : "bg-[#FF3B30]/15 text-[#FF3B30] dark:text-[#FF453A] border border-[#FF3B30]/25"
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
      <div className="pt-2.5 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between">
        <button
          onClick={handleClose}
          className="text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium macos-button-press cursor-pointer"
        >
          Dismiss (Esc)
        </button>

        <div className="flex items-center gap-2">
          {!hasEnhanced ? (
            <button
              onClick={handleEnhance}
              disabled={!rawInput.trim() || isEnhancing}
              className="macos-btn-primary cursor-pointer disabled:opacity-40"
            >
              {isEnhancing ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>Enhance</span>
              <kbd className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-mono">⌘↵</kbd>
            </button>
          ) : (
            <>
              <button
                onClick={() => setHasEnhanced(false)}
                className="macos-btn-secondary text-[12px] cursor-pointer"
              >
                Re-edit
              </button>
              <button
                onClick={handleSaveOnly}
                className="macos-btn-secondary text-[12px] cursor-pointer"
              >
                Save Locally
                <kbd className="macos-kbd ml-1">⌘↵</kbd>
              </button>
              <button
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-white rounded-md bg-[#34C759] hover:bg-[#2DB84D] active:bg-[#28A745] shadow-xs cursor-pointer macos-button-press border border-white/20 disabled:opacity-50"
              >
                {isSyncing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>Sync Excel</span>
                <kbd className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-mono">⌘S</kbd>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
