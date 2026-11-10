import { create } from "zustand";
import { UserProfile } from "../types";
import { tauriApi } from "../services/tauriApi";

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  loadProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  setOnboarded: (status: boolean) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: true,
  error: null,

  loadProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const raw: any = await tauriApi.getUserProfile();
      if (!raw) {
        set({ profile: null, isLoading: false });
        return;
      }
      const profile: UserProfile = {
        id: raw.id,
        displayName: raw.displayName || raw.display_name || "Employee",
        dateFormat: raw.dateFormat || raw.date_format || "YYYY-MM-DD",
        defaultProjectId: raw.defaultProjectId || raw.default_project_id || undefined,
        defaultExcelConnectionId: raw.defaultExcelConnectionId || raw.default_excel_connection_id || undefined,
        isOnboarded: Boolean(raw.isOnboarded ?? raw.is_onboarded ?? false),
        createdAt: raw.createdAt || raw.created_at || "",
        updatedAt: raw.updatedAt || raw.updated_at || "",
      };
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to load user profile", isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const raw: any = await tauriApi.updateUserProfile({
        displayName: data.displayName,
        dateFormat: data.dateFormat,
        defaultProjectId: data.defaultProjectId,
        defaultExcelConnectionId: data.defaultExcelConnectionId,
      });
      const updated: UserProfile = {
        id: raw.id,
        displayName: raw.displayName || raw.display_name || "Employee",
        dateFormat: raw.dateFormat || raw.date_format || "YYYY-MM-DD",
        defaultProjectId: raw.defaultProjectId || raw.default_project_id || undefined,
        defaultExcelConnectionId: raw.defaultExcelConnectionId || raw.default_excel_connection_id || undefined,
        isOnboarded: Boolean(raw.isOnboarded ?? raw.is_onboarded ?? false),
        createdAt: raw.createdAt || raw.created_at || "",
        updatedAt: raw.updatedAt || raw.updated_at || "",
      };
      set({ profile: updated });
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to update profile" });
    }
  },

  setOnboarded: async (status: boolean) => {
    try {
      await tauriApi.setSetting("is_onboarded", status ? "true" : "false");
      set((state) => ({
        profile: state.profile ? { ...state.profile, isOnboarded: status } : null,
      }));
    } catch (err: any) {
      set({ error: err?.toString() });
    }
  },
}));
