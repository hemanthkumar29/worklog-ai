import React, { useState } from "react";
import {
  Sparkles,
  FileSpreadsheet,
  Plus,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Check,
  FolderKanban,
} from "lucide-react";
import { useActivityStore } from "../../stores/useActivityStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useExcelStore } from "../../stores/useExcelStore";
import { ActivityType, ActivityStatus, AIStructuredOutput } from "../../types";

export const QuickCaptureView: React.FC = () => {
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const { enhanceInput, saveActivity, syncToExcel, isEnhancing, isSyncing } = useActivityStore();
  const { connections } = useExcelStore();

  const [rawInput, setRawInput] = useState("");
  const [activityDate, setActivityDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Enhanced state for interactive review
  const [hasEnhanced, setHasEnhanced] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activityType, setActivityType] = useState<ActivityType>("DEVELOPMENT");
  const [status, setStatus] = useState<ActivityStatus>("COMPLETED");
  const [timeSpentMinutes, setTimeSpentMinutes] = useState<number | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string[]>([]);
  const [nextSteps, setNextSteps] = useState<string[]>([]);

  // Inputs for adding new items
  const [newTaskInput, setNewTaskInput] = useState("");
  const [newTechInput, setNewTechInput] = useState("");
  const [newChallengeInput, setNewChallengeInput] = useState("");
  const [newNextStepInput, setNewNextStepInput] = useState("");

  // Notification / Feedback State
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    backupPath?: string;
  } | null>(null);

  const samplePrompts = [
    {
      label: "Salesforce Duplicate Rules",
      text: "I worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates. Spent 2.5 hours.",
    },
    {
      label: "React Optimization",
      text: "Optimized dashboard re-renders using useMemo and memo. Profiled component tree and fixed unnecessary state updates. Saved 2.5 hours.",
    },
    {
      label: "API Investigation",
      text: "Investigated bug where user session tokens were prematurely invalidated. Traced Redis expiry headers, reproduced in staging, and patched TTL configuration.",
    },
  ];

  const handleEnhance = async () => {
    if (!rawInput.trim()) return;
    setFeedback(null);

    try {
      const output: AIStructuredOutput = await enhanceInput(
        rawInput.trim(),
        activeProjectId || undefined
      );

      setTitle(output.activityTitle);
      setDescription(output.description);
      setActivityType(output.activityType);
      setStatus(output.status);
      setTimeSpentMinutes(output.timeSpentMinutes);
      setTasks(output.detailedTasks || []);
      setTechnologies(output.technologies || []);
      setChallenges(output.challenges || []);
      setNextSteps(output.nextSteps || []);
      setHasEnhanced(true);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.toString() || "AI enhancement failed. You can still fill in the details manually.",
      });
      setTitle(rawInput.slice(0, 50));
      setDescription(rawInput);
      setHasEnhanced(true);
    }
  };

  const handleSaveOnly = async () => {
    if (!activeProjectId) {
      setFeedback({ type: "error", message: "Please select a project before saving." });
      return;
    }
    setFeedback(null);

    try {
      const saved = await saveActivity({
        projectId: activeProjectId,
        activityDate,
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

      setFeedback({
        type: "success",
        message: `Activity saved successfully to local SQLite database! (ID: ${saved.id.slice(0, 8)})`,
      });
      resetForm();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.toString() || "Failed to save activity to SQLite.",
      });
    }
  };

  const handleSaveAndSync = async () => {
    if (!activeProjectId) {
      setFeedback({ type: "error", message: "Please select a project before syncing." });
      return;
    }

    const activeProject = projects.find((p) => p.id === activeProjectId);
    const connection = connections.find(
      (c) => c.id === activeProject?.excelConnectionId
    ) || connections[0];

    if (!connection || !connection.templates || connection.templates.length === 0) {
      setFeedback({
        type: "error",
        message:
          "No Excel template configured for this project. Please configure column mappings in the 'Excel Integration' tab first, or click 'Save Locally'.",
      });
      return;
    }

    const template = connection.templates[0];
    setFeedback(null);

    try {
      const saved = await saveActivity({
        projectId: activeProjectId,
        activityDate,
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

      setFeedback({
        type: "success",
        message: `Activity successfully saved and appended to row ${syncResult.rowNumber} in sheet '${syncResult.sheetName}'!`,
        backupPath: syncResult.backupPath,
      });
      resetForm();
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.toString() || "Excel synchronization failed. Activity was preserved safely in local database.",
      });
    }
  };

  const resetForm = () => {
    setRawInput("");
    setHasEnhanced(false);
    setTitle("");
    setDescription("");
    setTasks([]);
    setTechnologies([]);
    setChallenges([]);
    setNextSteps([]);
    setTimeSpentMinutes(null);
  };

  const handleAddTask = () => {
    if (newTaskInput.trim()) {
      setTasks([...tasks, newTaskInput.trim()]);
      setNewTaskInput("");
    }
  };

  const handleAddTech = () => {
    if (newTechInput.trim() && !technologies.includes(newTechInput.trim())) {
      setTechnologies([...technologies, newTechInput.trim()]);
      setNewTechInput("");
    }
  };

  const handleAddChallenge = () => {
    if (newChallengeInput.trim()) {
      setChallenges([...challenges, newChallengeInput.trim()]);
      setNewChallengeInput("");
    }
  };

  const handleAddNextStep = () => {
    if (newNextStepInput.trim()) {
      setNextSteps([...nextSteps, newNextStepInput.trim()]);
      setNewNextStepInput("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16 select-none animate-apple-in">
      {/* Top macOS Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Quick Capture
            </h2>
            <span className="macos-kbd">⌘1</span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            Describe your work in plain words. AI will structure and polish it for your Excel report.
          </p>
        </div>

        {/* Project Selector & Date Picker */}
        <div className="flex items-center gap-2">
          {/* Date Picker Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 text-[12px] shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            />
          </div>

          {/* Project Dropdown */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/20 text-[12px] shadow-2xs">
            <FolderKanban className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
            <select
              value={activeProjectId || ""}
              onChange={(e) => setActiveProject(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-800 dark:text-slate-100 font-medium cursor-pointer"
            >
              {projects.length === 0 ? (
                <option value="">No projects</option>
              ) : (
                projects.map((p) => (
                  <option key={p.id} value={p.id} className="dark:bg-slate-900">
                    {p.name}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all animate-apple-in ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-[12px] space-y-1">
            <p className="font-semibold">{feedback.message}</p>
            {feedback.backupPath && (
              <p className="text-[11px] opacity-80">
                Safe backup created at: <code className="font-mono">{feedback.backupPath}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input Canvas Card (Apple Notes Style) */}
      <div className="macos-card p-4 space-y-3 bg-white/70 dark:bg-black/25 border border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex items-center justify-between">
          <label className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
            What did you work on today?
          </label>
          <span className="text-[11px] text-slate-400 dark:text-slate-400">
            Natural Language Input
          </span>
        </div>

        <textarea
          rows={4}
          placeholder="e.g. Worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates. Spent 2.5 hours."
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleEnhance();
            }
          }}
          className="w-full rounded-lg border border-black/10 dark:border-white/10 bg-white/80 dark:bg-black/30 p-3 text-[13px] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF] transition-all leading-relaxed"
        />

        {/* Quick Sample Prompts & Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-black/[0.05] dark:border-white/[0.05]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-medium text-slate-400">Templates:</span>
            {samplePrompts.map((sp, idx) => (
              <button
                key={idx}
                onClick={() => setRawInput(sp.text)}
                className="text-[11px] px-2 py-0.5 rounded-md bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.12] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer macos-button-press"
              >
                {sp.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleEnhance}
            disabled={isEnhancing || !rawInput.trim()}
            className="macos-btn-primary"
          >
            {isEnhancing ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>Enhance with AI</span>
            <kbd className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-mono">⌘↵</kbd>
          </button>
        </div>
      </div>

      {/* AI Structured Review Card (macOS Inspector Style) */}
      {hasEnhanced && (
        <div className="macos-card p-5 space-y-5 bg-white/80 dark:bg-black/40 border border-black/[0.08] dark:border-white/[0.1] shadow-lg animate-apple-in">
          {/* Inspector Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-slate-100">
                Structured Activity Inspector
              </h3>
            </div>
            <button
              onClick={() => setHasEnhanced(false)}
              className="text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Re-edit Notes</span>
            </button>
          </div>

          {/* Title & Key Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Activity Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="macos-input w-full"
                placeholder="Title..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Category
              </label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                className="macos-input w-full cursor-pointer"
              >
                <option value="DEVELOPMENT">Development</option>
                <option value="BUG_FIXING">Bug Fixing</option>
                <option value="RESEARCH_AND_TESTING">Research & Testing</option>
                <option value="CODE_REVIEW">Code Review</option>
                <option value="MEETING">Meeting</option>
                <option value="DOCUMENTATION">Documentation</option>
                <option value="DEPLOYMENT">Deployment</option>
                <option value="PLANNING">Planning</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                className="macos-input w-full cursor-pointer"
              >
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="BLOCKED">Blocked</option>
                <option value="PLANNED">Planned</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Professional Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="macos-input w-full leading-relaxed"
            />
          </div>

          {/* Granular Tasks (Apple Reminders Style) */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
              Detailed Action Items
            </label>
            <div className="space-y-1">
              {tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1.5 rounded-md hover:bg-black/[0.03] dark:hover:bg-white/[0.04] group transition-colors"
                >
                  <div className="w-4 h-4 rounded-full border border-[#007AFF]/50 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-[#007AFF]" />
                  </div>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const updated = [...tasks];
                      updated[idx] = e.target.value;
                      setTasks(updated);
                    }}
                    className="flex-1 text-[12px] bg-transparent focus:outline-none text-slate-800 dark:text-slate-200"
                  />
                  <button
                    onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Add another task item..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="flex-1 text-[12px] py-1 px-2.5 rounded-md border border-dashed border-black/15 dark:border-white/15 bg-transparent focus:outline-none"
                />
                <button
                  onClick={handleAddTask}
                  className="macos-btn-secondary px-2.5 py-1 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Technologies Chips */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
              Technologies Used
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {technologies.map((tech, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] border border-[#007AFF]/25"
                >
                  <span>{tech}</span>
                  <button
                    onClick={() => setTechnologies(technologies.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                placeholder="+ Add Tech"
                value={newTechInput}
                onChange={(e) => setNewTechInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
                className="text-[11px] py-0.5 px-2 w-20 rounded-md border border-dashed border-black/15 dark:border-white/15 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Challenges & Next Steps Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
            {/* Challenges */}
            <div className="space-y-1.5 p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/20">
              <label className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                Blockers & Challenges
              </label>
              <div className="space-y-1">
                {challenges.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200">
                    <span>• {c}</span>
                    <button
                      onClick={() => setChallenges(challenges.filter((_, i) => i !== idx))}
                      className="text-amber-500 hover:text-rose-500 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    placeholder="+ Challenge..."
                    value={newChallengeInput}
                    onChange={(e) => setNewChallengeInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddChallenge()}
                    className="flex-1 text-[11px] py-0.5 px-2 rounded border border-amber-300/40 dark:border-amber-700/40 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-1.5 p-3 rounded-lg bg-sky-500/[0.06] border border-sky-500/20">
              <label className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ArrowRight className="w-3.5 h-3.5" />
                Next Standup Deliverables
              </label>
              <div className="space-y-1">
                {nextSteps.map((ns, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px] text-sky-900 dark:text-sky-200">
                    <span>• {ns}</span>
                    <button
                      onClick={() => setNextSteps(nextSteps.filter((_, i) => i !== idx))}
                      className="text-sky-500 hover:text-rose-500 cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div className="flex gap-1 pt-1">
                  <input
                    type="text"
                    placeholder="+ Next step..."
                    value={newNextStepInput}
                    onChange={(e) => setNewNextStepInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNextStep()}
                    className="flex-1 text-[11px] py-0.5 px-2 rounded border border-sky-300/40 dark:border-sky-700/40 bg-transparent focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
            <button
              onClick={resetForm}
              className="text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors"
            >
              Discard
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveOnly}
                className="macos-btn-secondary"
              >
                Save Locally
              </button>

              <button
                onClick={handleSaveAndSync}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white rounded-md bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-xs cursor-pointer macos-button-press border border-white/20 disabled:opacity-50"
              >
                {isSyncing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                <span>Sync to Excel</span>
                <kbd className="px-1 py-0.2 rounded bg-white/20 text-[10px] font-mono">⌘S</kbd>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
