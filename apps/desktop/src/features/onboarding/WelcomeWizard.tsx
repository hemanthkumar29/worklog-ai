import React, { useState } from "react";
import { Sparkles, ArrowRight, CheckCircle2, FolderPlus, FileSpreadsheet } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { useUserStore } from "../../stores/useUserStore";
import { useProjectStore } from "../../stores/useProjectStore";
import { useExcelStore } from "../../stores/useExcelStore";

interface WelcomeWizardProps {
  onComplete: () => void;
}

export const WelcomeWizard: React.FC<WelcomeWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { profile, updateProfile, setOnboarded } = useUserStore();
  const { createProject } = useProjectStore();
  const { inspectFile } = useExcelStore();

  // Step 1: Profile
  const [displayName, setDisplayName] = useState(profile?.displayName || "Employee");
  const [dateFormat, setDateFormat] = useState(profile?.dateFormat || "YYYY-MM-DD");

  // Step 2: Project
  const [projectName, setProjectName] = useState("Core Platform Engineering");
  const [projectDesc, setProjectDesc] = useState("Primary client development and feature delivery");
  const [clientName, setClientName] = useState("");
  const [technologies, setTechnologies] = useState("React, TypeScript, Rust, SQLite");

  // Step 3: Excel File (Optional)
  const [excelPath, setExcelPath] = useState("");
  const [isInspecting, setIsInspecting] = useState(false);
  const [excelError, setExcelError] = useState<string | null>(null);

  const handleNextStep1 = async () => {
    await updateProfile({
      displayName: displayName.trim() || "Employee",
      dateFormat,
    });
    setStep(2);
  };

  const handleNextStep2 = async () => {
    const techArray = technologies
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    await createProject({
      name: projectName.trim() || "Core Engineering",
      description: projectDesc.trim(),
      clientName: clientName.trim() || undefined,
      technologies: techArray,
      status: "ACTIVE",
    });
    setStep(3);
  };

  const handleFinish = async () => {
    if (excelPath.trim()) {
      setIsInspecting(true);
      try {
        await inspectFile(excelPath.trim());
      } catch (err: any) {
        setExcelError(err?.toString() || "Failed to inspect file, continuing anyway");
      } finally {
        setIsInspecting(false);
      }
    }
    await setOnboarded(true);
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-8 overflow-hidden flex flex-col">
        {/* Progress Dots */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Welcome to WorkLog AI
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Offline AI-Powered Work Documentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  step === s
                    ? "bg-brand-600"
                    : step > s
                    ? "bg-emerald-500"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: User Profile */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Step 1: Set up your local profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All data is stored strictly on your local computer. No cloud or accounts needed.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Input
                label="Your Display Name"
                placeholder="e.g. Jane Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                helperText="Used when automatically logging the Associate/Employee column in Excel."
              />

              <Select
                label="Preferred Date Format"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                options={[
                  { value: "YYYY-MM-DD", label: "YYYY-MM-DD (e.g. 2026-11-09)" },
                  { value: "DD/MM/YYYY", label: "DD/MM/YYYY (e.g. 09/11/2026)" },
                  { value: "MM/DD/YYYY", label: "MM/DD/YYYY (e.g. 11/09/2026)" },
                ]}
              />
            </div>

            <div className="pt-6 flex justify-end">
              <Button onClick={handleNextStep1} icon={<ArrowRight className="w-4 h-4" />}>
                Continue to Projects
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: First Project */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-brand-600" />
                Step 2: Create your first project
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Work activities are organized by project for intelligent contextual AI enhancement.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Input
                label="Project Name"
                placeholder="e.g. Customer Portal Redesign"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
              />

              <Input
                label="Project Description"
                placeholder="e.g. Developing new portal features"
                value={projectDesc}
                onChange={(e) => setProjectDesc(e.target.value)}
              />

              <Input
                label="Client or Organization (Optional)"
                placeholder="e.g. Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />

              <Input
                label="Technologies (comma-separated)"
                placeholder="e.g. React, TypeScript, Salesforce, AWS"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                helperText="AI uses these to intelligently recognize technologies in your work logs."
              />
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleNextStep2} icon={<ArrowRight className="w-4 h-4" />}>
                Continue to Excel Setup
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Excel Connection (Optional) */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Step 3: Connect your Excel Workbook (Optional)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Provide the path to an existing .xlsx workbook to automatically append work logs. You can also configure this later.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Input
                label="Excel Workbook Path (.xlsx)"
                placeholder="/Users/username/Documents/Daily_Work_Log.xlsx"
                value={excelPath}
                onChange={(e) => {
                  setExcelPath(e.target.value);
                  setExcelError(null);
                }}
                helperText="Existing formatting, formulas, styles, and other sheets are 100% preserved."
                error={excelError || undefined}
              />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                🔒 Safe Synchronization Guarantee:
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Automated timestamped backup created before any file modification.</li>
                <li>Zero data loss: never overwrites existing rows or formulas.</li>
                <li>Safe atomic writes with lock protection.</li>
              </ul>
            </div>

            <div className="pt-6 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="primary"
                onClick={handleFinish}
                isLoading={isInspecting}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                {excelPath.trim() ? "Connect & Finish Setup" : "Skip & Finish Setup"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
