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
      const profile = await tauriApi.getUserProfile();
      set({ profile, isLoading: false });
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to load user profile", isLoading: false });
    }
  },

  updateProfile: async (data) => {
    try {
      const updated = await tauriApi.updateUserProfile({
        displayName: data.displayName,
        dateFormat: data.dateFormat,
        defaultProjectId: data.defaultProjectId,
        defaultExcelConnectionId: data.defaultExcelConnectionId,
      });
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
