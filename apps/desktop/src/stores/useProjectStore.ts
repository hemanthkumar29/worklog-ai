import { create } from "zustand";
import { Project, CreateProjectInput, UpdateProjectInput } from "../types";
import { tauriApi } from "../services/tauriApi";

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  isLoading: boolean;
  error: string | null;
  loadProjects: (includeArchived?: boolean) => Promise<void>;
  setActiveProject: (id: string) => void;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  updateProject: (input: UpdateProjectInput) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  isLoading: false,
  error: null,

  loadProjects: async (includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const projects = await tauriApi.listProjects(includeArchived);
      set({
        projects,
        isLoading: false,
        activeProjectId: get().activeProjectId || (projects.length > 0 ? projects[0].id : null),
      });
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to load projects", isLoading: false });
    }
  },

  setActiveProject: (id: string) => {
    set({ activeProjectId: id });
  },

  createProject: async (input) => {
    set({ isLoading: true });
    try {
      const created = await tauriApi.createProject(input);
      set((state) => ({
        projects: [...state.projects, created],
        activeProjectId: created.id,
        isLoading: false,
      }));
      return created;
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to create project", isLoading: false });
      throw err;
    }
  },

  updateProject: async (input) => {
    try {
      const updated = await tauriApi.updateProject(input);
      if (updated) {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === updated.id ? updated : p)),
        }));
      }
      return updated;
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to update project" });
      throw err;
    }
  },

  deleteProject: async (id) => {
    try {
      const success = await tauriApi.deleteProject(id);
      if (success) {
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== id);
          return {
            projects: remaining,
            activeProjectId: state.activeProjectId === id ? (remaining[0]?.id || null) : state.activeProjectId,
          };
        });
      }
      return success;
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to delete project" });
      throw err;
    }
  },
}));
