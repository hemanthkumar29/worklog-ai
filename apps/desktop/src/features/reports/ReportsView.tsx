import React, { useState } from "react";
import {
  BarChart3,
  Briefcase,
  Layers,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            Reports & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Summarize productivity, time distribution, and export formatted reports.
          </p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none cursor-pointer"
          />

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            icon={<FileText className="w-4 h-4 text-rose-600" />}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Activities
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {dailyActivities.length}
          </p>
          <span className="text-[10px] text-slate-500">logged on {selectedDate}</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Time Logged
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {(totalTimeMinutes / 60).toFixed(1)}h
          </p>
          <span className="text-[10px] text-slate-500">{totalTimeMinutes} minutes</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </p>
          <span className="text-[10px] text-slate-500">items finished</span>
        </Card>

        <Card className="space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            In Progress
          </span>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {inProgressCount}
          </p>
          <span className="text-[10px] text-slate-500">ongoing items</span>
        </Card>
      </div>

      {/* Breakdown by Project & Tech */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Project Breakdown */}
        <Card className="space-y-3">
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-brand-600" />
            Project Distribution
          </h3>
          {Object.keys(projectBreakdown).length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No activities recorded for this date.</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(projectBreakdown).map(([projName, count]) => (
                <div key={projName} className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {projName}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {count} {count === 1 ? "activity" : "activities"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Technologies Used */}
        <Card className="space-y-3">
          <h3 className="font-semibold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            Technologies Documented
          </h3>
          {techSet.size === 0 ? (
            <p className="text-xs text-slate-400 py-3">No technologies identified for this date.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {Array.from(techSet).map((tech) => (
                <Badge key={tech} variant="info" size="sm">
                  {tech}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Daily Work Activity Listing */}
      <Card className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
          Activity Summary for {selectedDate}
        </h3>

        {dailyActivities.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No activities logged on this date.
          </p>
        ) : (
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            {dailyActivities.map((act) => (
              <div key={act.id} className="pt-3 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                    {act.activityTitle}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {act.projectName || "General"}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {act.enhancedDescription}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
