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
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Textarea } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useProjectStore } from "../../stores/useProjectStore";
import { useExcelStore } from "../../stores/useExcelStore";
import { Project, ProjectStatus } from "../../types";

export const ProjectListView: React.FC = () => {
  const { projects, createProject, updateProject, deleteProject } = useProjectStore();
  const { connections } = useExcelStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

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
    if (!showArchived && p.isArchived) return false;
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

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Projects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage projects, associate Excel templates, and organize work contexts.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search projects, clients, tech..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded text-brand-600 focus:ring-brand-500"
          />
          Show archived projects
        </label>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((proj) => (
          <Card
            key={proj.id}
            className="flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                    {proj.name}
                  </h3>
                  {proj.clientName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Client: {proj.clientName}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    proj.status === "ACTIVE"
                      ? "success"
                      : proj.status === "COMPLETED"
                      ? "info"
                      : "neutral"
                  }
                  size="sm"
                >
                  {proj.status}
                </Badge>
              </div>

              {proj.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {proj.description}
                </p>
              )}

              {/* Technologies */}
              {proj.technologies && proj.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.slice(0, 4).map((tech, idx) => (
                    <Badge key={idx} variant="neutral" size="sm">
                      {tech}
                    </Badge>
                  ))}
                  {proj.technologies.length > 4 && (
                    <span className="text-[10px] text-slate-400 self-center">
                      +{proj.technologies.length - 4} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Metrics & Actions Footer */}
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1" title="Total Activities Logged">
                  <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                  {proj.activityCount || 0}
                </span>
                <span className="flex items-center gap-1" title="Total Time Logged">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {((proj.totalTimeMinutes || 0) / 60).toFixed(1)}h
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingProject(proj)}
                  title="Edit Project"
                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleArchive(proj)}
                  title={proj.isArchived ? "Unarchive" : "Archive"}
                  className="p-1 rounded text-slate-400 hover:text-amber-600"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteProject(proj.id)}
                  title="Delete Project"
                  className="p-1 rounded text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Project"
        description="Add a new project context for your work logs."
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Mobile Banking App"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Textarea
            label="Description"
            placeholder="Brief description of project scope..."
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Input
            label="Client or Organization (Optional)"
            placeholder="e.g. Acme FinTech"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />
          <Input
            label="Technologies (comma-separated)"
            placeholder="e.g. React Native, TypeScript, Node.js, AWS"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <Select
            label="Associated Excel Connection (Optional)"
            value={excelConnectionId}
            onChange={(e) => setExcelConnectionId(e.target.value)}
            options={[
              { value: "", label: "-- None / Default --" },
              ...connections.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Project</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      {editingProject && (
        <Modal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title="Edit Project"
          description="Update project information."
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Project Name"
              value={editingProject.name}
              onChange={(e) =>
                setEditingProject({ ...editingProject, name: e.target.value })
              }
            />
            <Textarea
              label="Description"
              rows={2}
              value={editingProject.description}
              onChange={(e) =>
                setEditingProject({ ...editingProject, description: e.target.value })
              }
            />
            <Input
              label="Client Name"
              value={editingProject.clientName || ""}
              onChange={(e) =>
                setEditingProject({ ...editingProject, clientName: e.target.value })
              }
            />
            <Input
              label="Technologies (comma-separated)"
              value={editingProject.technologies?.join(", ") || ""}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  technologies: e.target.value.split(",").map((t) => t.trim()).filter((t) => t.length > 0),
                })
              }
            />
            <Select
              label="Status"
              value={editingProject.status}
              onChange={(e) =>
                setEditingProject({
                  ...editingProject,
                  status: e.target.value as ProjectStatus,
                })
              }
              options={[
                { value: "ACTIVE", label: "Active" },
                { value: "ON_HOLD", label: "On Hold" },
                { value: "COMPLETED", label: "Completed" },
                { value: "ARCHIVED", label: "Archived" },
              ]}
            />
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingProject(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
