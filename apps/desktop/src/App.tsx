import React, { useState, useEffect } from "react";
import { Sidebar, NavTab } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { WelcomeWizard } from "./features/onboarding/WelcomeWizard";
import { QuickCaptureView } from "./features/capture/QuickCaptureView";
import { ActivityHistoryView } from "./features/activities/ActivityHistoryView";
import { ProjectListView } from "./features/projects/ProjectListView";
import { ExcelIntegrationView } from "./features/excel/ExcelIntegrationView";
import { ReportsView } from "./features/reports/ReportsView";
import { SettingsView } from "./features/settings/SettingsView";
import { useUserStore } from "./stores/useUserStore";
import { useProjectStore } from "./stores/useProjectStore";
import { useActivityStore } from "./stores/useActivityStore";
import { useExcelStore } from "./stores/useExcelStore";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>("capture");
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  const { profile, loadProfile, isLoading: isUserLoading } = useUserStore();
  const { loadProjects } = useProjectStore();
  const { loadActivities } = useActivityStore();
  const { loadConnections } = useExcelStore();

  useEffect(() => {
    // Initial data hydration
    loadProfile();
    loadProjects();
    loadActivities();
    loadConnections();

    // Theme initialization
    const savedTheme = localStorage.getItem("worklog_theme") as "light" | "dark" | null;
    const initialTheme = savedTheme || "dark";
    setTheme(initialTheme);
    if (initialTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [loadProfile, loadProjects, loadActivities, loadConnections]);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("worklog_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Loading WorkLog AI...</span>
        </div>
      </div>
    );
  }

  // Show Welcome Wizard on first launch
  const isUserOnboarded = Boolean(profile?.isOnboarded ?? (profile as any)?.is_onboarded ?? false);
  if (profile && !isUserOnboarded) {
    return <WelcomeWizard onComplete={() => loadProfile()} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header theme={theme} onToggleTheme={handleToggleTheme} />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === "capture" && <QuickCaptureView />}
          {activeTab === "activities" && <ActivityHistoryView />}
          {activeTab === "projects" && <ProjectListView />}
          {activeTab === "excel" && <ExcelIntegrationView />}
          {activeTab === "reports" && <ReportsView />}
          {activeTab === "settings" && <SettingsView />}
        </main>
      </div>
    </div>
  );
};
