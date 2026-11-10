import React, { useState } from "react";
import {
  FolderKanban,
  Plus,
  Search,
  Clock,
  ListTodo,
  Edit2,
  Trash2,
  Archive,
  Folder,
  Building,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useProjectStore } from "../../stores/useProjectStore";
import { useExcelStore } from "../../stores/useExcelStore";
import { Project, ProjectStatus } from "../../types";

export const ProjectListView: React.FC = () => {
  const { projects, createProject, updateProject, deleteProject } = useProjectStore();
  const { connections } = useExcelStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "archived">("active");

  // Create Project Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [excelConnectionId, setExcelConnectionId] = useState("");
  const [defaultWorksheet, setDefaultWorksheet] = useState("");

  // Edit Project Modal
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((p) => {
    if (filterMode === "active" && (p.isArchived || p.status === "ARCHIVED")) return false;
    if (filterMode === "archived" && !p.isArchived && p.status !== "ARCHIVED") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description?.toLowerCase().includes(q);
      const matchClient = p.clientName?.toLowerCase().includes(q);
      const matchTech = p.technologies?.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchDesc && !matchClient && !matchTech) return false;
    }
    return true;
  });

  const activeCount = projects.filter((p) => !p.isArchived && p.status !== "ARCHIVED").length;
  const archivedCount = projects.filter((p) => p.isArchived || p.status === "ARCHIVED").length;

  const handleCreate = async () => {
    if (!name.trim()) return;
    const techArray = technologies
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await createProject({
      name: name.trim(),
      description: description.trim(),
      clientName: clientName.trim() || undefined,
      technologies: techArray,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      excelConnectionId: excelConnectionId || undefined,
      defaultWorksheet: defaultWorksheet || undefined,
    });

    setIsCreateOpen(false);
    resetCreateForm();
  };

  const handleUpdate = async () => {
    if (!editingProject || !editingProject.name.trim()) return;
    await updateProject({
      id: editingProject.id,
      name: editingProject.name,
      description: editingProject.description,
      clientName: editingProject.clientName,
      technologies: editingProject.technologies,
      status: editingProject.status,
      excelConnectionId: editingProject.excelConnectionId,
      defaultWorksheet: editingProject.defaultWorksheet,
    });
    setEditingProject(null);
  };

  const handleToggleArchive = async (project: Project) => {
    await updateProject({
      id: project.id,
      isArchived: !project.isArchived,
    });
  };

  const resetCreateForm = () => {
    setName("");
    setDescription("");
    setClientName("");
    setTechnologies("");
    setStartDate("");
    setEndDate("");
    setExcelConnectionId("");
    setDefaultWorksheet("");
  };

  const folderColors = [
    "from-[#007AFF] to-[#5856D6]",
    "from-[#34C759] to-[#30B0C7]",
    "from-[#FF9500] to-[#FF3B30]",
    "from-[#AF52DE] to-[#5856D6]",
  ];

  return (
    <div className="space-y-6 pb-12 select-none animate-apple-in">
      {/* Native macOS Sub-Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-[#007AFF] dark:text-[#0A84FF]" />
              Projects
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-slate-500">
              {projects.length} Total
            </span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            Organize work contexts, associate Excel sheets, and track time allocations.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="macos-btn-primary self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter and Search Bar (macOS NSSearchField + NSSegmentedControl) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* macOS Search Field */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects, client, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-[12px] rounded-md border border-black/15 dark:border-white/15 bg-white/90 dark:bg-black/30 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#007AFF]/40 focus:border-[#007AFF] transition-all"
          />
        </div>

        {/* macOS Segmented Switcher */}
        <div className="macos-segmented self-start sm:self-auto">
          <button
            onClick={() => setFilterMode("active")}
            className={`macos-segmented-item ${
              filterMode === "active" ? "macos-segmented-item-active" : ""
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterMode("all")}
            className={`macos-segmented-item ${
              filterMode === "all" ? "macos-segmented-item-active" : ""
            }`}
          >
            All ({projects.length})
          </button>
          <button
            onClick={() => setFilterMode("archived")}
            className={`macos-segmented-item ${
              filterMode === "archived" ? "macos-segmented-item-active" : ""
            }`}
          >
            Archived ({archivedCount})
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="macos-card p-12 text-center space-y-3">
          <Folder className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No projects found
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "No projects match your current search query."
              : "Get started by creating your first project context."}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="macos-btn-primary mt-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj, idx) => (
            <div
              key={proj.id}
              className="macos-card p-4.5 flex flex-col justify-between hover:border-[#007AFF]/40 dark:hover:border-[#007AFF]/50 transition-all duration-150 group"
            >
              <div className="space-y-3">
                {/* Header: Folder Icon + Title + Status */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${
                        folderColors[idx % folderColors.length]
                      } text-white flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <Folder className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[13px] text-slate-900 dark:text-slate-100 leading-snug">
                        {proj.name}
                      </h3>
                      {proj.clientName && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3 text-slate-400" />
                          {proj.clientName}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      proj.status === "ACTIVE"
                        ? "bg-[#34C759]/15 text-[#34C759] dark:text-[#30D158]"
                        : proj.status === "COMPLETED"
                        ? "bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF]"
                        : "bg-slate-500/15 text-slate-500"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {proj.status}
                  </span>
                </div>

                {/* Description */}
                {proj.description && (
                  <p className="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}

                {/* Technologies */}
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.slice(0, 4).map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-black/[0.04] dark:border-white/[0.06]"
                      >
                        {tech}
                      </span>
                    ))}
                    {proj.technologies.length > 4 && (
                      <span className="text-[10px] text-slate-400 self-center">
                        +{proj.technologies.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Metrics & Action Bar Footer */}
              <div className="pt-3.5 mt-3.5 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1" title="Logged Activities">
                    <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                    {proj.activityCount || 0}
                  </span>
                  <span className="flex items-center gap-1" title="Total Logged Hours">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {((proj.totalTimeMinutes || 0) / 60).toFixed(1)}h
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingProject(proj)}
                    title="Edit Project"
                    className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors macos-button-press cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleArchive(proj)}
                    title={proj.isArchived ? "Unarchive" : "Archive"}
                    className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-500/10 transition-colors macos-button-press cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProject(proj.id)}
                    title="Delete Project"
                    className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors macos-button-press cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Sheet / Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New Project"
        description="Add a new project context for organizing activities and Excel sync."
        size="md"
      >
        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Project Name
            </label>
            <input
              type="text"
              placeholder="e.g. Mobile Banking App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="macos-input w-full"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief description of the project scope and deliverables..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="macos-input w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Client / Organization
              </label>
              <input
                type="text"
                placeholder="e.g. Acme FinTech"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="macos-input w-full"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Technologies
              </label>
              <input
                type="text"
                placeholder="React, Swift, AWS"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                className="macos-input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="macos-input w-full cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Target End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="macos-input w-full cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Associated Excel Connection (Optional)
            </label>
            <select
              value={excelConnectionId}
              onChange={(e) => setExcelConnectionId(e.target.value)}
              className="macos-input w-full cursor-pointer"
            >
              <option value="">-- None / Default --</option>
              {connections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-end gap-2">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="macos-btn-secondary cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="macos-btn-primary cursor-pointer disabled:opacity-40"
            >
              Create Project
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Sheet / Modal */}
      {editingProject && (
        <Modal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title="Edit Project"
          description={`Update details for ${editingProject.name}.`}
          size="md"
        >
          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={editingProject.name}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, name: e.target.value })
                }
                className="macos-input w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={editingProject.description || ""}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, description: e.target.value })
                }
                className="macos-input w-full resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  value={editingProject.clientName || ""}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, clientName: e.target.value })
                  }
                  className="macos-input w-full"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={editingProject.status}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      status: e.target.value as ProjectStatus,
                    })
                  }
                  className="macos-input w-full cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Technologies (comma-separated)
              </label>
              <input
                type="text"
                value={editingProject.technologies?.join(", ") || ""}
                onChange={(e) =>
                  setEditingProject({
                    ...editingProject,
                    technologies: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter((t) => t.length > 0),
                  })
                }
                className="macos-input w-full"
              />
            </div>

            <div className="pt-4 border-t border-black/[0.08] dark:border-white/[0.08] flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingProject(null)}
                className="macos-btn-secondary cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={!editingProject.name.trim()}
                className="macos-btn-primary cursor-pointer disabled:opacity-40"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
