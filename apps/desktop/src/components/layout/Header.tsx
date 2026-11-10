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
      className="h-[52px] border-b border-black/[0.08] dark:border-white/[0.08] macos-toolbar px-5 flex items-center justify-between shrink-0 select-none z-20 cursor-default"
      data-tauri-drag-region
    >
      {/* Left: Active Project Selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.06] shadow-2xs">
          <FolderKanban className="w-3.5 h-3.5 text-[#007AFF] dark:text-[#0A84FF]" />
          <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">Project:</span>
          <select
            value={activeProjectId || ""}
            onChange={(e) => setActiveProject(e.target.value)}
            className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none cursor-pointer pr-1"
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
      <div className="flex items-center gap-2">
        {/* Global Shortcut Quick Capture Trigger Button */}
        <button
          onClick={() => tauriApi.showQuickCapture()}
          title="Open Floating Quick Capture Popup (⌘+Shift+Space)"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] dark:text-[#0A84FF] text-xs font-semibold border border-[#007AFF]/25 transition-all shadow-2xs cursor-pointer macos-button-press"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Quick Capture</span>
          <kbd className="px-1 py-0.2 rounded bg-white/80 dark:bg-black/40 border border-[#007AFF]/25 text-[10px] font-mono">
            ⌘⇧Space
          </kbd>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle Theme"
          className="w-7 h-7 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer macos-button-press flex items-center justify-center"
        >
          {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* User Profile Avatar Pill */}
        <div className="flex items-center gap-1.5 pl-2 border-l border-black/[0.08] dark:border-white/[0.08]">
          <div className="w-6 h-6 rounded-full bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF] flex items-center justify-center font-bold text-[11px] border border-[#007AFF]/25">
            {profile?.displayName?.charAt(0).toUpperCase() || "E"}
          </div>
          <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300 hidden md:inline">
            {profile?.displayName || "Employee"}
          </span>
        </div>
      </div>
    </header>
  );
};
