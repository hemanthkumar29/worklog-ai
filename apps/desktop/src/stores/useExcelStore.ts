import { create } from "zustand";
import { ExcelConnection, WorkbookInspection, ExcelTemplate, StandardWorkLogField, ExcelSheetInfo } from "../types";
import { tauriApi } from "../services/tauriApi";

interface ExcelState {
  connections: ExcelConnection[];
  activeInspection: WorkbookInspection | null;
  selectedSheetName: string | null;
  currentMappings: Record<StandardWorkLogField, number | null>; // field -> excelColumnIndex
  isInspecting: boolean;
  isSaving: boolean;
  error: string | null;

  loadConnections: () => Promise<void>;
  inspectFile: (filePath: string) => Promise<WorkbookInspection>;
  setSelectedSheet: (sheetName: string) => void;
  setMapping: (field: StandardWorkLogField, columnIndex: number | null) => void;
  applyAutoSuggestions: () => Promise<void>;
  saveTemplate: (params: {
    connectionId: string;
    templateName: string;
    sheetName: string;
    headerRowIndex: number;
  }) => Promise<ExcelTemplate>;
}

export const useExcelStore = create<ExcelState>((set, get) => ({
  connections: [],
  activeInspection: null,
  selectedSheetName: null,
  currentMappings: {
    activityDate: null,
    employeeName: null,
    projectName: null,
    activityTitle: null,
    description: null,
    activityType: null,
    technologies: null,
    timeSpentHours: null,
    timeSpentMinutes: null,
    status: null,
    challenges: null,
    nextSteps: null,
    detailedTasks: null,
  },
  isInspecting: false,
  isSaving: false,
  error: null,

  loadConnections: async () => {
    try {
      const connections = await tauriApi.listExcelConnections();
      set({ connections });
    } catch (err: any) {
      set({ error: err?.toString() || "Failed to load Excel connections" });
    }
  },

  inspectFile: async (filePath) => {
    set({ isInspecting: true, error: null });
    try {
      const inspection = await tauriApi.inspectWorkbook(filePath, true);
      const firstSheet = inspection.sheets[0]?.name || null;
      set({
        activeInspection: inspection,
        selectedSheetName: firstSheet,
        isInspecting: false,
      });

      // Reload connections list so saved connection is present
      get().loadConnections();

      // Automatically compute auto mappings for the first sheet
      if (firstSheet) {
        get().applyAutoSuggestions();
      }

      return inspection;
    } catch (err: any) {
      set({ isInspecting: false, error: err?.toString() || "Failed to inspect workbook" });
      throw err;
    }
  },

  setSelectedSheet: (sheetName) => {
    set({ selectedSheetName: sheetName });
    get().applyAutoSuggestions();
  },

  setMapping: (field, columnIndex) => {
    set((state) => ({
      currentMappings: { ...state.currentMappings, [field]: columnIndex },
    }));
  },

  applyAutoSuggestions: async () => {
    const { activeInspection, selectedSheetName } = get();
    if (!activeInspection || !selectedSheetName) return;

    const sheet = activeInspection.sheets.find((s: ExcelSheetInfo) => s.name === selectedSheetName);
    if (!sheet || sheet.headers.length === 0) return;

    try {
      const suggestions = await tauriApi.suggestColumnMappings(sheet.headers);
      const newMappings = { ...get().currentMappings };

      for (const s of suggestions) {
        const field = (s.worklogField || s.worklog_field) as StandardWorkLogField | undefined;
        const colIdx = s.excelColumnIndex ?? s.excel_column_index;
        if (field && colIdx !== undefined && colIdx !== null) {
          newMappings[field] = colIdx;
        }
      }

      set({ currentMappings: newMappings });
    } catch (err: any) {
      console.error("Auto suggestion failed", err);
    }
  },

  saveTemplate: async ({ connectionId, templateName, sheetName, headerRowIndex }) => {
    set({ isSaving: true, error: null });
    try {
      const { activeInspection, currentMappings } = get();
      const sheet = activeInspection?.sheets.find((s: ExcelSheetInfo) => s.name === sheetName);
      const headers = sheet?.headers || [];

      const mappingsPayload: Array<{
        worklog_field: string;
        excel_column_name: string;
        excel_column_index: number;
        is_required: boolean;
        default_value?: string;
      }> = [];

      for (const [field, colIdx] of Object.entries(currentMappings)) {
        if (colIdx !== null && colIdx >= 0 && colIdx < headers.length) {
          mappingsPayload.push({
            worklog_field: field,
            excel_column_name: headers[colIdx] || `Column ${colIdx + 1}`,
            excel_column_index: colIdx,
            is_required: ["activityDate", "projectName", "activityTitle", "description"].includes(field),
          });
        }
      }

      const template = await tauriApi.saveExcelTemplate({
        excelConnectionId: connectionId,
        name: templateName,
        worksheetName: sheetName,
        headerRowIndex,
        mappings: mappingsPayload,
      });

      set({ isSaving: false });
      get().loadConnections();
      return template;
    } catch (err: any) {
      set({ isSaving: false, error: err?.toString() || "Failed to save template" });
      throw err;
    }
  },
}));
