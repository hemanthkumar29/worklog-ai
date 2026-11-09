import { create } from "zustand";
import { Activity, AIStructuredOutput, CreateActivityInput, UpdateActivityInput } from "../types";
import { tauriApi, ActivityFilterParams } from "../services/tauriApi";

interface ActivityState {
  activities: Activity[];
  selectedActivity: Activity | null;
  filters: ActivityFilterParams;
  isLoading: boolean;
  isEnhancing: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncResult: any | null;

  // Actions
  loadActivities: (filters?: ActivityFilterParams) => Promise<void>;
  setFilters: (filters: Partial<ActivityFilterParams>) => void;
  selectActivity: (activity: Activity | null) => void;
  enhanceInput: (rawInput: string, projectId?: string) => Promise<AIStructuredOutput>;
  saveActivity: (input: CreateActivityInput) => Promise<Activity>;
  updateActivity: (input: UpdateActivityInput) => Promise<Activity | null>;
  deleteActivity: (id: string) => Promise<boolean>;
  syncToExcel: (activityId: string, templateId: string) => Promise<any>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  selectedActivity: null,
  filters: {},
  isLoading: false,
  isEnhancing: false,
  isSyncing: false,
  error: null,
  lastSyncResult: null,

  loadActivities: async (overrideFilters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = overrideFilters || get().filters;
      const activities = await tauriApi.listActivities(activeFilters);
      set({ activities, isLoading: false });
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to load activities", isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().loadActivities();
  },

  selectActivity: (activity) => {
    set({ selectedActivity: activity });
  },

  enhanceInput: async (rawInput, projectId) => {
    set({ isEnhancing: true, error: null });
    try {
      const output = await tauriApi.enhanceActivityText(rawInput, projectId);
      set({ isEnhancing: false });
      return output;
    } catch (err: any) {
      set({ isEnhancing: false, error: err?.toString() || "AI enhancement failed" });
      throw err;
    }
  },

  saveActivity: async (input) => {
    set({ isLoading: true, error: null });
    try {
      const created = await tauriApi.createActivity(input);
      set((state) => ({
        activities: [created, ...state.activities],
        isLoading: false,
      }));
      return created;
    } catch (err: any) {
      set({ isLoading: false, error: err?.toString() || "Failed to save activity" });
      throw err;
    }
  },

  updateActivity: async (input) => {
    try {
      const updated = await tauriApi.updateActivity(input);
      if (updated) {
        set((state) => ({
          activities: state.activities.map((a) => (a.id === updated.id ? updated : a)),
          selectedActivity: state.selectedActivity?.id === updated.id ? updated : state.selectedActivity,
        }));
      }
      return updated;
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to update activity" });
      throw err;
    }
  },

  deleteActivity: async (id) => {
    try {
      const success = await tauriApi.deleteActivity(id);
      if (success) {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
          selectedActivity: state.selectedActivity?.id === id ? null : state.selectedActivity,
        }));
      }
      return success;
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to delete activity" });
      throw err;
    }
  },

  syncToExcel: async (activityId, templateId) => {
    set({ isSyncing: true, error: null });
    try {
      const res = await tauriApi.syncActivityToExcel(activityId, templateId);
      set({ isSyncing: false, lastSyncResult: res });

      // Update local activity sync status
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === activityId ? { ...a, syncStatus: "SYNCED" } : a
        ),
      }));

      return res;
    } catch (err: any) {
      set({ isSyncing: false, error: err?.toString() || "Excel sync failed" });
      // Update local activity sync status to FAILED
      set((state) => ({
        activities: state.activities.map((a) =>
          a.id === activityId ? { ...a, syncStatus: "FAILED" } : a
        ),
      }));
      throw err;
    }
  },
}));
