import React, { useState, useEffect } from "react";
import {
  Search,
  FileSpreadsheet,
  Trash2,
  Edit3,
  Clock,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock3,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useActivityStore } from "../../stores/useActivityStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useExcelStore } from "../../stores/useExcelStore";
import { Activity, ActivityType, ActivityStatus } from "../../types";

export const ActivityHistoryView: React.FC = () => {
  const { activities, loadActivities, updateActivity, deleteActivity, syncToExcel } =
    useActivityStore();
  const { projects } = useProjectStore();
  const { connections } = useExcelStore();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedSyncStatus, setSelectedSyncStatus] = useState<string>("");

  // Drawer / View Details Modal
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);

  // Edit Modal State
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editType, setEditType] = useState<ActivityType>("DEVELOPMENT");
  const [editStatus, setEditStatus] = useState<ActivityStatus>("COMPLETED");
  const [editTime, setEditTime] = useState<string>("");

  // Delete Confirmation Modal
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync feedback
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filteredActivities = activities.filter((a) => {
    if (selectedProjectId && a.projectId !== selectedProjectId) return false;
    if (selectedStatus && a.status !== selectedStatus) return false;
    if (selectedSyncStatus && a.syncStatus !== selectedSyncStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.activityTitle.toLowerCase().includes(q);
      const matchDesc = a.enhancedDescription.toLowerCase().includes(q);
      const matchRaw = a.rawInput.toLowerCase().includes(q);
      const matchTech = a.technologies?.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchRaw && !matchTech) return false;
    }
    return true;
  });

  const handleOpenEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setEditTitle(activity.activityTitle);
    setEditDesc(activity.enhancedDescription);
    setEditType(activity.activityType);
    setEditStatus(activity.status);
    setEditTime(activity.timeSpentMinutes ? activity.timeSpentMinutes.toString() : "");
  };

  const handleSaveEdit = async () => {
    if (!editingActivity) return;
    await updateActivity({
      id: editingActivity.id,
      activity_title: editTitle.trim(),
      enhanced_description: editDesc.trim(),
      activity_type: editType,
      status: editStatus,
      time_spent_minutes: editTime ? parseInt(editTime, 10) : null,
    });
    setEditingActivity(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteActivity(deletingId);
      setDeletingId(null);
      if (viewingActivity?.id === deletingId) setViewingActivity(null);
    }
  };

  const handleSyncSingle = async (activity: Activity) => {
    const project = projects.find((p) => p.id === activity.projectId);
    const connection =
      connections.find((c) => c.id === project?.excelConnectionId) || connections[0];

    if (!connection || !connection.templates || connection.templates.length === 0) {
      setSyncFeedback("No Excel template mapped for this project. Please configure in Excel tab.");
      return;
    }

    try {
      const res = await syncToExcel(activity.id, connection.templates[0].id);
      setSyncFeedback(`Successfully appended to row ${res.rowNumber} in sheet '${res.sheetName}'!`);
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err?.toString()}`);
    }
  };

  const getCategoryBadgeVariant = (type: string) => {
    switch (type) {
      case "RESEARCH_AND_TESTING":
        return "info";
      case "BUG_FIXING":
        return "danger";
      case "DEVELOPMENT":
        return "default";
      case "MEETING":
        return "warning";
      default:
        return "neutral";
    }
  };

  const getSyncBadge = (status: string) => {
    switch (status) {
      case "SYNCED":
        return (
          <Badge variant="success" size="sm" className="gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Synced
          </Badge>
        );
      case "FAILED":
        return (
          <Badge variant="danger" size="sm" className="gap-1">
            <XCircle className="w-3 h-3 text-rose-600" /> Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="neutral" size="sm" className="gap-1">
            <Clock3 className="w-3 h-3 text-slate-400" /> Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Activity History
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Full audit log of work activities, original inputs, and Excel sync status.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadActivities()}
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>
      </div>

      {syncFeedback && (
        <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-between">
          <span>{syncFeedback}</span>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-slate-400 hover:text-slate-600 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search activities, tech, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        {/* Project Filter */}
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="BLOCKED">Blocked</option>
          <option value="PLANNED">Planned</option>
        </select>

        {/* Sync Status Filter */}
        <select
          value={selectedSyncStatus}
          onChange={(e) => setSelectedSyncStatus(e.target.value)}
          className="text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 focus:outline-none cursor-pointer"
        >
          <option value="">All Sync States</option>
          <option value="SYNCED">Synced</option>
          <option value="PENDING">Pending Sync</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Activity Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <p className="text-sm font-semibold">No activities found</p>
            <p className="text-xs mt-1">Try modifying your filters or capture a new activity.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-950/40">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4">Activity Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Excel Sync</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {filteredActivities.map((act) => (
                  <tr
                    key={act.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => setViewingActivity(act)}
                  >
                    <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {act.activityDate}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {act.projectName || "Default"}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {act.activityTitle}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Badge variant={getCategoryBadgeVariant(act.activityType)} size="sm">
                        {act.activityType.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {act.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{getSyncBadge(act.syncStatus)}</td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        title="View Details"
                        onClick={() => setViewingActivity(act)}
                        className="p-1 rounded text-slate-400 hover:text-brand-600"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title="Edit Activity"
                        onClick={() => handleOpenEdit(act)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        title="Sync to Excel"
                        onClick={() => handleSyncSingle(act)}
                        className="p-1 rounded text-slate-400 hover:text-emerald-600"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete Activity"
                        onClick={() => setDeletingId(act.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Viewing Drawer / Modal */}
      {viewingActivity && (
        <Modal
          isOpen={!!viewingActivity}
          onClose={() => setViewingActivity(null)}
          title={viewingActivity.activityTitle}
          description={`Logged for ${viewingActivity.activityDate} • Project: ${viewingActivity.projectName || "General"}`}
          size="lg"
        >
          <div className="space-y-5 text-xs">
            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getCategoryBadgeVariant(viewingActivity.activityType)}>
                {viewingActivity.activityType.replace(/_/g, " ")}
              </Badge>
              <Badge variant="neutral">{viewingActivity.status}</Badge>
              {getSyncBadge(viewingActivity.syncStatus)}
              {viewingActivity.timeSpentMinutes && (
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  {viewingActivity.timeSpentMinutes} mins (
                  {(viewingActivity.timeSpentMinutes / 60).toFixed(1)}h)
                </span>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                Enhanced Description
              </h4>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                {viewingActivity.enhancedDescription}
              </p>
            </div>

            {/* Tasks */}
            {viewingActivity.tasks && viewingActivity.tasks.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                  Granular Tasks Completed
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                  {viewingActivity.tasks.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Technologies */}
            {viewingActivity.technologies && viewingActivity.technologies.length > 0 && (
              <div className="space-y-1.5">
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">
                  Technologies Recognized
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingActivity.technologies.map((t, idx) => (
                    <Badge key={idx} variant="info" size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Challenges & Next Steps */}
            {(viewingActivity.challenges?.length > 0 || viewingActivity.nextSteps?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {viewingActivity.challenges?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-amber-700 dark:text-amber-400">
                      Challenges / Blockers
                    </h4>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      {viewingActivity.challenges.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewingActivity.nextSteps?.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sky-700 dark:text-sky-400">Next Steps</h4>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-400">
                      {viewingActivity.nextSteps.map((ns, i) => (
                        <li key={i}>{ns}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Original Raw User Input (Full preservation) */}
            <div className="space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">
                Original User Input (Preserved Unmodified)
              </h4>
              <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800">
                "{viewingActivity.rawInput}"
              </p>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Activity Modal */}
      {editingActivity && (
        <Modal
          isOpen={!!editingActivity}
          onClose={() => setEditingActivity(null)}
          title="Edit Activity"
          description="Update details in local database."
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Activity Title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <Textarea
              label="Enhanced Description"
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Category"
                value={editType}
                onChange={(e) => setEditType(e.target.value as ActivityType)}
                options={[
                  { value: "DEVELOPMENT", label: "Development" },
                  { value: "BUG_FIXING", label: "Bug Fixing" },
                  { value: "RESEARCH_AND_TESTING", label: "Research & Testing" },
                  { value: "CODE_REVIEW", label: "Code Review" },
                  { value: "MEETING", label: "Meeting" },
                  { value: "DOCUMENTATION", label: "Documentation" },
                  { value: "DEPLOYMENT", label: "Deployment" },
                ]}
              />
              <Select
                label="Status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as ActivityStatus)}
                options={[
                  { value: "COMPLETED", label: "Completed" },
                  { value: "IN_PROGRESS", label: "In Progress" },
                  { value: "BLOCKED", label: "Blocked" },
                  { value: "PLANNED", label: "Planned" },
                ]}
              />
            </div>
            <Input
              label="Time Spent (minutes)"
              type="number"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
            />
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingActivity(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <Modal
          isOpen={!!deletingId}
          onClose={() => setDeletingId(null)}
          title="Confirm Deletion"
          description="Are you sure you want to delete this activity record from your local database? This action cannot be undone."
          size="sm"
        >
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeletingId(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete Activity
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
