import React from "react";
import {
  Sparkles,
  History,
  FolderKanban,
  FileSpreadsheet,
  BarChart3,
  Settings,
} from "lucide-react";
import { clsx } from "clsx";

export type NavTab = "capture" | "activities" | "projects" | "excel" | "reports" | "settings";

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const sections: Array<{
    title: string;
    items: Array<{ id: NavTab; label: string; icon: React.FC<{ className?: string }>; shortcut?: string }>;
  }> = [
    {
      title: "WORKLOGS",
      items: [
        { id: "capture", label: "Quick Capture", icon: Sparkles, shortcut: "⌘1" },
        { id: "activities", label: "Activity History", icon: History, shortcut: "⌘2" },
      ],
    },
    {
      title: "ORGANIZATION",
      items: [
        { id: "projects", label: "Projects", icon: FolderKanban, shortcut: "⌘3" },
        { id: "excel", label: "Excel Integration", icon: FileSpreadsheet, shortcut: "⌘4" },
        { id: "reports", label: "Reports & Analytics", icon: BarChart3, shortcut: "⌘5" },
      ],
    },
    {
      title: "PREFERENCES",
      items: [
        { id: "settings", label: "Settings", icon: Settings, shortcut: "⌘6" },
      ],
    },
  ];

  return (
    <aside className="w-60 border-r border-black/[0.08] dark:border-white/[0.08] macos-sidebar flex flex-col shrink-0 select-none">
      {/* Native macOS Titlebar / Traffic Light Drag Region */}
      <div
        className="pt-8 pb-3 px-4 flex items-center gap-2.5 cursor-default"
        data-tauri-drag-region
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
        <div className="leading-tight">
          <h1 className="font-bold text-[13px] tracking-tight text-slate-900 dark:text-slate-100">
            WorkLog AI
          </h1>
          <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-400">
            macOS Edition
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2.5 py-1 space-y-3.5 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-0.5">
            <span className="text-[10px] font-semibold text-slate-400/90 dark:text-slate-400 uppercase tracking-wider px-2.5">
              {section.title}
            </span>
            <div className="space-y-0.5 pt-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={clsx(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all duration-100 cursor-pointer macos-button-press",
                      isActive
                        ? "bg-[#007AFF] text-white font-semibold shadow-xs dark:bg-[#007AFF]/25 dark:text-[#0A84FF] dark:border dark:border-[#007AFF]/35"
                        : "text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Icon
                        className={clsx(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive
                            ? "text-white dark:text-[#0A84FF]"
                            : "text-slate-400 dark:text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span
                        className={clsx(
                          "text-[10px] font-mono",
                          isActive
                            ? "text-white/80 dark:text-[#0A84FF]/80"
                            : "text-slate-400 dark:text-slate-400 opacity-60"
                        )}
                      >
                        {item.shortcut}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Privacy Guarantee Pill */}
      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.05] dark:border-white/[0.06] text-slate-600 dark:text-slate-300">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <div className="text-[11px] leading-tight">
            <span className="font-semibold text-slate-800 dark:text-slate-200">100% Offline</span>
            <span className="text-slate-400 dark:text-slate-400 block text-[10px]">Zero Cloud Telemetry</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
