import React from "react";
import { FolderKanban, Moon, Sun, Sparkles } from "lucide-react";
import { useProjectStore } from "../../stores/useProjectStore";
import { useUserStore } from "../../stores/useUserStore";
import { tauriApi } from "../../services/tauriApi";

interface HeaderProps {
  onOpenQuickCapture?: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme }) => {
  const { projects, activeProjectId, setActiveProject } = useProjectStore();
  const { profile } = useUserStore();

  return (
    <header
      className="h-14 border-b border-slate-200/60 dark:border-slate-800/80 macos-glass px-6 flex items-center justify-between shrink-0 select-none z-20 cursor-default"
      data-tauri-drag-region
    >
      {/* Left: Active Project Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1.2 rounded-lg border border-slate-200/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 shadow-sm">
          <FolderKanban className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Project:</span>
          <select
            value={activeProjectId || ""}
            onChange={(e) => setActiveProject(e.target.value)}
            className="text-xs font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer pr-1"
          >
            {projects.length === 0 ? (
              <option value="">No projects</option>
            ) : (
              projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-slate-900">
                  {p.name}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Global Shortcut Quick Capture Trigger Button */}
        <button
          onClick={() => tauriApi.showQuickCapture()}
          title="Open Floating Quick Capture Popup (⌘+Shift+Space)"
          className="flex items-center gap-1.5 px-3 py-1.2 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-semibold border border-brand-500/20 transition-all shadow-sm cursor-pointer macos-button-press"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Capture</span>
          <kbd className="px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800 border border-brand-500/20 text-[10px] font-mono">
            ⌘⇧Space
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Theme"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer macos-button-press"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200/60 dark:border-slate-800/80">
          <div className="w-6 h-6 rounded-full bg-brand-500/15 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-xs border border-brand-500/25">
            {profile?.displayName?.charAt(0).toUpperCase() || "E"}
          </div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
            {profile?.displayName || "Employee"}
          </span>
        </div>
      </div>
    </header>
  );
};
