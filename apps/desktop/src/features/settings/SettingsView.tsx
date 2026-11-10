import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Trash2,
  CheckCircle2,
  Keyboard,
  User,
  ShieldCheck,
  HardDrive,
  FileSpreadsheet,
} from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { useUserStore } from "../../stores/useUserStore";
import { tauriApi } from "../../services/tauriApi";
import { HardwareProfile, DatabaseStats } from "../../types";

export const SettingsView: React.FC = () => {
  const { profile, updateProfile } = useUserStore();

  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [dateFormat, setDateFormat] = useState(profile?.dateFormat || "YYYY-MM-DD");
  const [hardware, setHardware] = useState<HardwareProfile | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isWipeOpen, setIsWipeOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    tauriApi.getHardwareProfile().then(setHardware).catch(console.error);
    tauriApi.getDatabaseStats().then(setDbStats).catch(console.error);
  }, []);

  const handleSaveProfile = async () => {
    await updateProfile({
      displayName: displayName.trim(),
      dateFormat,
    });
    setSaveFeedback("Profile updated successfully!");
    setTimeout(() => setSaveFeedback(null), 3000);
  };

  const handleWipeData = async () => {
    try {
      await tauriApi.wipeAllData();
      setIsWipeOpen(false);
      window.location.reload();
    } catch (err) {
      console.error("Wipe failed", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 select-none animate-apple-in">
      {/* View Header */}
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold text-slate-900 dark:text-white tracking-tight">
              Preferences & Settings
            </h2>
            <span className="macos-kbd">⌘,</span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure user identity, system hotkeys, hardware acceleration, and local data storage.
          </p>
        </div>

        {saveFeedback && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-semibold animate-apple-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Group 1: User Profile (macOS System Settings Grouped Inset) */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2">
          User Account & Regional Formats
        </span>
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-black/25 divide-y divide-black/[0.05] dark:divide-white/[0.05] overflow-hidden shadow-xs">
          {/* Display Name Row */}
          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#007AFF] text-white flex items-center justify-center shadow-2xs">
                <User className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Associate / Employee Name
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Appended into the Resource Name column of synchronized timesheets.
                </p>
              </div>
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="macos-input w-48 text-[12px]"
              placeholder="e.g. Jane Doe"
            />
          </div>

          {/* Date Format Row */}
          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#5856D6] text-white flex items-center justify-center shadow-2xs">
                <SettingsIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Date Format Standard
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Formatting convention applied during Excel row synchronization.
                </p>
              </div>
            </div>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="macos-input w-48 text-[12px] cursor-pointer"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (UK/EU)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
            </select>
          </div>

          {/* Save Button Row */}
          <div className="p-3 bg-black/[0.01] dark:bg-white/[0.01] flex justify-end">
            <button
              onClick={handleSaveProfile}
              className="macos-btn-primary"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>

      {/* Group 2: System Shortcuts */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2">
          System Shortcuts & Quick Capture
        </span>
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-black/25 divide-y divide-black/[0.05] dark:divide-white/[0.05] overflow-hidden shadow-xs">
          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#AF52DE] text-white flex items-center justify-center shadow-2xs">
                <Keyboard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Spotlight Quick Capture Hotkey
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Opens the floating capture card globally from any running app.
                </p>
              </div>
            </div>
            <kbd className="px-2.5 py-1 rounded-md bg-black/[0.04] dark:bg-white/[0.08] border border-black/10 dark:border-white/10 text-[12px] font-mono font-bold">
              ⌘ + Shift + Space
            </kbd>
          </div>

          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#34C759] text-white flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Native macOS System Tray
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Menu bar item active for background capture and dashboard toggling.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active in Menu Bar
            </span>
          </div>
        </div>
      </div>

      {/* Group 3: Hardware Acceleration & Local AI Engine */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2">
          Apple Silicon & Inference Acceleration
        </span>
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-black/25 divide-y divide-black/[0.05] dark:divide-white/[0.05] overflow-hidden shadow-xs">
          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#FF9500] text-white flex items-center justify-center shadow-2xs">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Hardware Acceleration Architecture
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  {hardware?.cpuArchitecture || "ARM64"} • {hardware?.cpuCores || 8} CPU Cores • Apple Metal GPU
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#FF9500]/10 text-[#FF9500] text-[11px] font-bold border border-[#FF9500]/25">
              Apple Silicon Metal
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#30B0C7] text-white flex items-center justify-center shadow-2xs">
                <HardDrive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Available Unified Memory
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Fast unified RAM allocated for zero-latency NLP heuristic parsing.
                </p>
              </div>
            </div>
            <span className="text-[12px] font-bold font-mono text-slate-700 dark:text-slate-300">
              {(((hardware?.totalMemoryBytes ?? hardware?.total_memory_bytes ?? 0) / (1024 * 1024 * 1024))).toFixed(1)} GB
            </span>
          </div>
        </div>
      </div>

      {/* Group 4: Local SQLite Database Storage */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider px-2">
          Local Storage & Enterprise Safety
        </span>
        <div className="rounded-xl border border-black/[0.08] dark:border-white/[0.08] bg-white/70 dark:bg-black/25 divide-y divide-black/[0.05] dark:divide-white/[0.05] overflow-hidden shadow-xs">
          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#34C759] text-white flex items-center justify-center shadow-2xs">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  SQLite Database (WAL Mode)
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  {dbStats?.totalActivities ?? dbStats?.total_activities ?? 0} activities • {dbStats?.totalProjects ?? dbStats?.total_projects ?? 0} projects • {dbStats?.totalExcelConnections ?? dbStats?.total_excel_connections ?? 0} connections
                </p>
              </div>
            </div>
            <span className="text-[12px] font-mono text-slate-500">
              {(((dbStats?.dbSizeBytes ?? dbStats?.db_size_bytes ?? 0)) / 1024).toFixed(1)} KB
            </span>
          </div>

          <div className="p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#007AFF] text-white flex items-center justify-center shadow-2xs">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                  Excel Pre-Write Backup Engine
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-400">
                  Timestamped .bak.xlsx copies created automatically before every write.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Group 5: Danger Zone */}
      <div className="space-y-1.5 pt-2">
        <span className="text-[11px] font-semibold text-rose-500 uppercase tracking-wider px-2">
          Maintenance & Reset
        </span>
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-4 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#FF3B30] text-white flex items-center justify-center shadow-2xs">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-rose-900 dark:text-rose-200">
                Purge All Local Records
              </p>
              <p className="text-[11px] text-rose-700 dark:text-rose-400">
                Permanently wipes all activities, projects, and templates from SQLite.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWipeOpen(true)}
            className="px-3 py-1.5 rounded-md text-[12px] font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer macos-button-press"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Wipe Confirmation Modal */}
      <Modal
        isOpen={isWipeOpen}
        onClose={() => setIsWipeOpen(false)}
        title="Reset All Local Data"
        description="This action will permanently delete all logged activities, projects, and custom Excel column templates."
        size="sm"
      >
        <div className="space-y-4 text-xs pt-1">
          <p className="text-slate-700 dark:text-slate-300">
            Are you sure you want to proceed? Your external Excel spreadsheets will <strong>not</strong> be deleted, but your local WorkLog AI history will be reset to zero.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
            <button
              onClick={() => setIsWipeOpen(false)}
              className="macos-btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleWipeData}
              className="px-3 py-1.5 rounded-md text-[12px] font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer macos-button-press"
            >
              Confirm Wipe
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
