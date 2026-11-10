import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Cpu,
  Database,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Keyboard,
  User,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
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
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Application Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure profile, AI inference engine, keyboard shortcuts, and local storage.
        </p>
      </div>

      {saveFeedback && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* User Profile */}
      <Card className="space-y-4">
        <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" />
          User Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            helperText="Written to the Associate/Employee column in synchronized Excel sheets."
          />
          <Select
            label="Date Format"
            value={dateFormat}
            onChange={(e) => setDateFormat(e.target.value)}
            options={[
              { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
              { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
              { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
            ]}
          />
        </div>
        <div className="flex justify-end pt-1">
          <Button size="sm" onClick={handleSaveProfile}>
            Save Profile
          </Button>
        </div>
      </Card>

      {/* AI Model & Hardware Profiler */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-brand-600" />
            Local AI Hardware Profiler
          </h3>
          <Badge variant="success" size="sm">
            100% Offline Active
          </Badge>
        </div>

        {hardware && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                System RAM
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {(((hardware.totalMemoryBytes ?? hardware.total_memory_bytes ?? 0) / (1024 * 1024 * 1024))).toFixed(1)} GB
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                CPU Cores
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {hardware.cpuCores ?? hardware.cpu_cores ?? 0} Cores ({hardware.cpuArchitecture ?? hardware.cpu_architecture ?? "Unknown"})
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Hardware Acceleration
              </span>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {(hardware.hasMetalSupport ?? hardware.has_metal_support)
                  ? "Apple Metal GPU"
                  : (hardware.hasAvx2Support ?? hardware.has_avx2_support)
                  ? "AVX2 SIMD"
                  : "Standard CPU"}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">
                Inference Mode
              </span>
              <p className="text-sm font-bold text-brand-600 dark:text-brand-400 mt-0.5">
                Hybrid (NLP + Model)
              </p>
            </div>
          </div>
        )}

        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            Hardware-Aware AI Guarantee:
          </p>
          <p>
            WorkLog AI utilizes a dual-tier offline inference engine. The high-precision deterministic NLP parser executes instantaneously on any CPU with zero memory overhead, ensuring seamless operation even under constrained resources.
          </p>
        </div>
      </Card>

      {/* Global Shortcut Configuration */}
      <Card className="space-y-3">
        <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-brand-600" />
          Global Desktop Shortcuts
        </h3>
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Floating Quick Capture Trigger
            </p>
            <p className="text-slate-500">Opens the capture window anywhere in macOS or Windows.</p>
          </div>
          <kbd className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold shadow-sm">
            ⌘+Shift+Space / Ctrl+Shift+Space
          </kbd>
        </div>
      </Card>

      {/* Database Information */}
      <Card className="space-y-4">
        <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-600" />
          Local Database & Storage
        </h3>

        {dbStats && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 font-mono text-[11px]">
              <div>
                <span className="text-slate-400">Database Path: </span>
                <span className="text-slate-800 dark:text-slate-200 select-all">
                  {dbStats.dbPath ?? dbStats.db_path}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Backups Directory: </span>
                <span className="text-slate-800 dark:text-slate-200 select-all">
                  {dbStats.backupDir ?? dbStats.backup_dir}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase">Activities</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {dbStats.totalActivities ?? dbStats.total_activities ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase">Projects</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {dbStats.totalProjects ?? dbStats.total_projects ?? 0}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase">File Size</span>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {(((dbStats.dbSizeBytes ?? dbStats.db_size_bytes ?? 0) / 1024)).toFixed(1)} KB
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Danger Zone: Wipe All Data */}
      <Card className="border-rose-200 dark:border-rose-950/60 space-y-3">
        <h3 className="font-semibold text-xs text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-600" />
          Danger Zone
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
              Clear All Stored Application Data
            </p>
            <p className="text-[11px] text-slate-500">
              Permanently removes all local projects, activity logs, mappings, and restarts setup.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsWipeOpen(true)}
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
          >
            Clear All Data
          </Button>
        </div>
      </Card>

      {/* Wipe Confirmation Modal */}
      {isWipeOpen && (
        <Modal
          isOpen={isWipeOpen}
          onClose={() => setIsWipeOpen(false)}
          title="Permanently Delete All Data?"
          description="This action will delete all recorded activities, projects, and templates stored in your local SQLite database. External Excel files will not be touched."
          size="sm"
        >
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsWipeOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleWipeData}>
              Yes, Delete Everything
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
