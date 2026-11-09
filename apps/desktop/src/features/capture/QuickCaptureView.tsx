import React, { useState } from "react";
import {
  Sparkles,
  Save,
  FileSpreadsheet,
  Plus,
  Trash2,
  Clock,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  ArrowRightCircle,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
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
      text: "I worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates.",
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
      // Fallback: Populate basic fields
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

    // Check if an Excel connection exists
    const activeProject = projects.find((p) => p.id === activeProjectId);
    const connection = connections.find(
      (c) => c.id === activeProject?.excelConnectionId
    ) || connections[0];

    if (!connection || !connection.templates || connection.templates.length === 0) {
      setFeedback({
        type: "error",
        message:
          "No Excel template configured for this project. Please configure column mappings in the 'Excel Integration' tab first, or click 'Save to History Only'.",
      });
      return;
    }

    const template = connection.templates[0];
    setFeedback(null);

    try {
      // 1. Save activity locally first
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

      // 2. Synchronize to Excel
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Top Banner / Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Quick Capture
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Describe your work in plain words. AI will structure and polish it for your Excel report.
          </p>
        </div>

        {/* Project Selector & Date Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={activityDate}
              onChange={(e) => setActivityDate(e.target.value)}
              className="bg-transparent focus:outline-none text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            />
          </div>

          <div className="min-w-[180px]">
            <Select
              value={activeProjectId || ""}
              onChange={(e) => setActiveProject(e.target.value)}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-semibold">{feedback.message}</p>
            {feedback.backupPath && (
              <p className="text-[11px] opacity-80">
                Safe backup created at: <code className="font-mono">{feedback.backupPath}</code>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Input Box Card */}
      <Card className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            What did you work on today?
          </label>
          <Textarea
            rows={4}
            placeholder="e.g. Worked on Salesforce account duplicate prevention. Explored matching rules and duplicate rules. Tested account creation with similar names and investigated why the flow was not detecting duplicates..."
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            className="text-sm leading-relaxed"
          />
        </div>

        {/* Quick Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-medium text-slate-400">Quick Try:</span>
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => setRawInput(sp.text)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {sp.label}
            </button>
          ))}
        </div>

        {/* Enhance Button */}
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleEnhance}
            isLoading={isEnhancing}
            disabled={!rawInput.trim()}
            icon={<Sparkles className="w-4 h-4 text-amber-300" />}
            size="md"
          >
            Enhance with Local AI
          </Button>
        </div>
      </Card>

      {/* AI Structured Review Card */}
      {hasEnhanced && (
        <Card className="border-brand-200/80 dark:border-brand-900/60 shadow-lg space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                AI Structured Work Log (Review & Edit)
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Review and adjust before saving
            </span>
          </div>

          {/* Title & Metadata Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Activity Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <Select
                label="Category"
                value={activityType}
                onChange={(e) => setActivityType(e.target.value as ActivityType)}
                options={[
                  { value: "DEVELOPMENT", label: "Development" },
                  { value: "BUG_FIXING", label: "Bug Fixing" },
                  { value: "RESEARCH_AND_TESTING", label: "Research & Testing" },
                  { value: "CODE_REVIEW", label: "Code Review" },
                  { value: "MEETING", label: "Meeting" },
                  { value: "DOCUMENTATION", label: "Documentation" },
                  { value: "DEPLOYMENT", label: "Deployment" },
                  { value: "PLANNING", label: "Planning" },
                ]}
              />
            </div>

            <div>
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ActivityStatus)}
                options={[
                  { value: "COMPLETED", label: "Completed" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "BLOCKED", label: "Blocked" },
                  { value: "PLANNED", label: "Planned" },
                ]}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Textarea
              label="Professional Description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Granular Tasks */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <ListTodo className="w-3.5 h-3.5 text-brand-600" />
              Detailed Action Items
            </label>
            <div className="space-y-1.5">
              {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <span className="text-xs text-brand-600 font-bold">•</span>
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const updated = [...tasks];
                      updated[idx] = e.target.value;
                      setTasks(updated);
                    }}
                    className="flex-1 text-xs py-1 px-2 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => setTasks(tasks.filter((_, i) => i !== idx))}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="+ Add another task..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  className="flex-1 text-xs py-1 px-2.5 rounded-md border border-dashed border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none text-slate-700 dark:text-slate-300"
                />
                <Button size="sm" variant="ghost" onClick={handleAddTask}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Technologies Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-brand-600" />
              Technologies Used
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              {technologies.map((tech, idx) => (
                <Badge
                  key={idx}
                  variant="info"
                  className="flex items-center gap-1 pr-1.5"
                >
                  {tech}
                  <button
                    onClick={() => setTechnologies(technologies.filter((_, i) => i !== idx))}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="+ Tech"
                  value={newTechInput}
                  onChange={(e) => setNewTechInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTech()}
                  className="text-xs py-0.5 px-2 w-20 rounded border border-dashed border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Challenges & Next Steps Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Challenges */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Challenges / Blockers
              </label>
              <div className="space-y-1">
                {challenges.map((ch, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className="text-amber-500 font-bold">•</span>
                    <span className="flex-1 text-slate-700 dark:text-slate-300">{ch}</span>
                    <button
                      onClick={() => setChallenges(challenges.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="+ Add challenge..."
                  value={newChallengeInput}
                  onChange={(e) => setNewChallengeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddChallenge()}
                  className="w-full text-xs py-1 px-2 rounded border border-dashed border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <ArrowRightCircle className="w-3.5 h-3.5" />
                Next Steps / Follow-ups
              </label>
              <div className="space-y-1">
                {nextSteps.map((ns, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-xs">
                    <span className="text-sky-500 font-bold">•</span>
                    <span className="flex-1 text-slate-700 dark:text-slate-300">{ns}</span>
                    <button
                      onClick={() => setNextSteps(nextSteps.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  placeholder="+ Add next step..."
                  value={newNextStepInput}
                  onChange={(e) => setNewNextStepInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddNextStep()}
                  className="w-full text-xs py-1 px-2 rounded border border-dashed border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Time spent optional input */}
          <div className="pt-2 flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Time spent (minutes):
            </span>
            <input
              type="number"
              placeholder="e.g. 120"
              value={timeSpentMinutes !== null ? timeSpentMinutes : ""}
              onChange={(e) =>
                setTimeSpentMinutes(e.target.value ? parseInt(e.target.value, 10) : null)
              }
              className="w-24 text-xs py-1 px-2 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none"
            />
            {timeSpentMinutes && (
              <span className="text-xs text-slate-400">
                ({(timeSpentMinutes / 60).toFixed(1)} hours)
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleSaveOnly}
              icon={<Save className="w-4 h-4" />}
            >
              Save to History Only
            </Button>

            <Button
              variant="primary"
              onClick={handleSaveAndSync}
              isLoading={isSyncing}
              icon={<FileSpreadsheet className="w-4 h-4 text-emerald-300" />}
            >
              Approve & Sync to Excel
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
