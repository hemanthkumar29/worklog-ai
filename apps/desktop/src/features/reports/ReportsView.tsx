import React, { useState } from "react";
import {
  BarChart3,
  Briefcase,
  Layers,
  FileSpreadsheet,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  Hourglass,
  Tag,
} from "lucide-react";
import { useActivityStore } from "../../stores/useActivityStore";
import Papa from "papaparse";
import jsPDF from "jspdf";

export const ReportsView: React.FC = () => {
  const { activities } = useActivityStore();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Compute metrics
  const dailyActivities = activities.filter((a) => a.activityDate === selectedDate);

  const totalTimeMinutes = dailyActivities.reduce(
    (acc, a) => acc + (a.timeSpentMinutes || 0),
    0
  );

  const completedCount = dailyActivities.filter((a) => a.status === "COMPLETED").length;
  const inProgressCount = dailyActivities.filter((a) => a.status === "IN_PROGRESS").length;

  // Project breakdown
  const projectBreakdown: Record<string, number> = {};
  dailyActivities.forEach((a) => {
    const pName = a.projectName || "General";
    projectBreakdown[pName] = (projectBreakdown[pName] || 0) + 1;
  });

  // Unique Technologies used
  const techSet = new Set<string>();
  dailyActivities.forEach((a) => {
    a.technologies?.forEach((t) => techSet.add(t));
  });

  // Export to CSV
  const handleExportCSV = () => {
    const csvData = dailyActivities.map((a) => ({
      Date: a.activityDate,
      Project: a.projectName || "General",
      Title: a.activityTitle,
      Description: a.enhancedDescription,
      Category: a.activityType,
      Status: a.status,
      "Time (Minutes)": a.timeSpentMinutes || "",
      "Time (Hours)": a.timeSpentMinutes ? (a.timeSpentMinutes / 60).toFixed(2) : "",
      Technologies: a.technologies?.join(", ") || "",
      Tasks: a.tasks?.join("; ") || "",
      Challenges: a.challenges?.join("; ") || "",
      NextSteps: a.nextSteps?.join("; ") || "",
    }));

    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `WorkLog_Report_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("WorkLog AI — Daily Productivity Report", 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Report Date: ${selectedDate}`, 14, 28);
    doc.text(`Total Activities: ${dailyActivities.length} | Completed: ${completedCount} | Hours: ${(totalTimeMinutes / 60).toFixed(1)}h`, 14, 34);

    doc.line(14, 38, 196, 38);

    let y = 46;
    doc.setFontSize(12);
    doc.setTextColor(0);

    dailyActivities.forEach((a, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.setFont("helvetica", "bold");
      doc.text(`${idx + 1}. ${a.activityTitle}`, 14, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.text(`[${a.projectName || "General"}] • ${a.activityType} • Status: ${a.status}`, 14, y);
      y += 5;

      const splitDesc = doc.splitTextToSize(a.enhancedDescription, 175);
      doc.setTextColor(40);
      doc.text(splitDesc, 14, y);
      y += splitDesc.length * 5 + 4;
    });

    doc.save(`WorkLog_Report_${selectedDate}.pdf`);
  };

  const setPresetToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const setPresetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none animate-apple-in">
      {/* Native macOS Sub-Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#007AFF] dark:text-[#0A84FF]" />
              Reports & Analytics
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-slate-500">
              {dailyActivities.length} Activities Today
            </span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            Summarize productivity, time distribution, and export formatted reports.
          </p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 macos-segmented">
            <button
              onClick={setPresetToday}
              className={`macos-segmented-item ${
                selectedDate === new Date().toISOString().split("T")[0]
                  ? "macos-segmented-item-active"
                  : ""
              }`}
            >
              Today
            </button>
            <button
              onClick={setPresetYesterday}
              className="macos-segmented-item"
            >
              Yesterday
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="macos-input py-1 text-[12px] cursor-pointer"
          />

          <button
            onClick={handleExportCSV}
            disabled={dailyActivities.length === 0}
            className="macos-btn-secondary cursor-pointer disabled:opacity-40"
            title="Export CSV Report"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={dailyActivities.length === 0}
            className="macos-btn-secondary cursor-pointer disabled:opacity-40"
            title="Export PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Total Activities */}
        <div className="macos-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Activities
          </span>
          <p className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
            {dailyActivities.length}
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            {selectedDate}
          </span>
        </div>

        {/* Time Logged */}
        <div className="macos-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Time Logged
          </span>
          <p className="text-[26px] font-bold tracking-tight text-[#007AFF] dark:text-[#0A84FF] font-mono">
            {(totalTimeMinutes / 60).toFixed(1)}h
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {totalTimeMinutes} minutes
          </span>
        </div>

        {/* Completed */}
        <div className="macos-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-[26px] font-bold tracking-tight text-[#34C759] dark:text-[#30D158] font-mono">
            {completedCount}
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            tasks finished
          </span>
        </div>

        {/* In Progress */}
        <div className="macos-card p-4 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            In Progress
          </span>
          <p className="text-[26px] font-bold tracking-tight text-[#FF9500] dark:text-[#FF9F0A] font-mono">
            {inProgressCount}
          </p>
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <Hourglass className="w-3 h-3 text-amber-500" />
            ongoing items
          </span>
        </div>
      </div>

      {/* Breakdown by Project & Technologies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Breakdown */}
        <div className="macos-card p-4.5 space-y-3">
          <h3 className="font-semibold text-[12px] text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#007AFF] dark:text-[#0A84FF]" />
            Project Distribution
          </h3>
          {Object.keys(projectBreakdown).length === 0 ? (
            <p className="text-[12px] text-slate-400 py-4 text-center">No activities recorded for this date.</p>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(projectBreakdown).map(([projName, count]) => {
                const percentage = Math.round((count / dailyActivities.length) * 100);
                return (
                  <div key={projName} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {projName}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#007AFF]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Technologies Used */}
        <div className="macos-card p-4.5 space-y-3">
          <h3 className="font-semibold text-[12px] text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#34C759] dark:text-[#30D158]" />
            Technologies Documented
          </h3>
          {techSet.size === 0 ? (
            <p className="text-[12px] text-slate-400 py-4 text-center">No technologies identified for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {Array.from(techSet).map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#007AFF]/10 text-[#007AFF] dark:text-[#0A84FF] border border-[#007AFF]/20 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 opacity-60" />
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Work Activity Listing */}
      <div className="macos-card overflow-hidden border border-black/[0.08] dark:border-white/[0.08]">
        <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
          <h3 className="font-bold text-[13px] text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Activities on {selectedDate}
          </h3>
          <span className="text-[11px] font-medium text-slate-400">
            {dailyActivities.length} items logged
          </span>
        </div>

        {dailyActivities.length === 0 ? (
          <div className="p-8 text-center text-[12px] text-slate-400">
            No work logs recorded for this day. Use Quick Capture (⌘⇧Space) to log activities.
          </div>
        ) : (
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.05]">
            {dailyActivities.map((a) => (
              <div key={a.id} className="p-4 hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-[13px] text-slate-900 dark:text-slate-100">
                      {a.activityTitle}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {a.projectName || "General"} • {a.activityType}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        a.status === "COMPLETED"
                          ? "bg-[#34C759]/15 text-[#34C759] dark:text-[#30D158]"
                          : a.status === "IN_PROGRESS"
                          ? "bg-[#007AFF]/15 text-[#007AFF] dark:text-[#0A84FF]"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {a.status}
                    </span>
                    {a.timeSpentMinutes && (
                      <span className="px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.08] text-[11px] font-mono text-slate-600 dark:text-slate-300">
                        {(a.timeSpentMinutes / 60).toFixed(1)}h
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {a.enhancedDescription}
                </p>

                {a.technologies && a.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {a.technologies.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-black/[0.03] dark:bg-white/[0.05] text-slate-500"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
