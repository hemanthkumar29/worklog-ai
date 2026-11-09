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
  const navItems = [
    { id: "capture" as NavTab, label: "Quick Capture", icon: Sparkles },
    { id: "activities" as NavTab, label: "Activity History", icon: History },
    { id: "projects" as NavTab, label: "Projects", icon: FolderKanban },
    { id: "excel" as NavTab, label: "Excel Integration", icon: FileSpreadsheet },
    { id: "reports" as NavTab, label: "Reports & Analytics", icon: BarChart3 },
    { id: "settings" as NavTab, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 select-none">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
            WorkLog AI
          </h1>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            100% Offline
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                isActive
                  ? "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
              )}
            >
              <Icon
                className={clsx(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"
                )}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Privacy guarantee pill */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="text-[11px] leading-tight">
            <p className="font-semibold">Local Privacy Active</p>
            <p className="text-emerald-600/80 dark:text-emerald-400/80 text-[10px]">
              No data leaves your computer.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
