import React from "react";
import {
  Sparkles,
  History,
  FolderKanban,
  FileSpreadsheet,
  BarChart3,
  Settings,
  ShieldCheck,
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
    <aside className="w-64 border-r border-slate-200/70 dark:border-slate-800/80 macos-sidebar flex flex-col shrink-0 select-none">
      {/* Native macOS Titlebar / Traffic Light Drag Region */}
      <div
        className="pt-9 pb-3 px-5 flex items-center gap-3 cursor-default"
        data-tauri-drag-region
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-sky-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="leading-tight">
          <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
            WorkLog AI
          </h1>
          <span className="text-[10px] font-semibold tracking-wider text-brand-600 dark:text-brand-400">
            Offline Edition
          </span>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400/90 dark:text-slate-500 uppercase tracking-widest px-3">
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
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer macos-button-press",
                      isActive
                        ? "bg-brand-500/15 dark:bg-brand-400/20 text-brand-700 dark:text-brand-300 font-semibold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={clsx(
                          "w-4 h-4 shrink-0 transition-colors",
                          isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 opacity-60">
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
      <div className="p-3.5 border-t border-slate-200/60 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold">Local Privacy Active</p>
            <p className="text-emerald-600/90 dark:text-emerald-400/90 text-[10px]">
              Zero telemetry • 100% Offline
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
