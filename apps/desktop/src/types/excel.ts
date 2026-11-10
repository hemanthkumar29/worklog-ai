export interface ExcelSheetInfo {
  name: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
  headerRowIndex: number;
  sampleRows: Record<string, string>[];
}

export interface ExcelWorkbookInspection {
  filePath: string;
  fileName: string;
  sheets: ExcelSheetInfo[];
  defaultSheet?: string;
  isLocked: boolean;
  fileSizeBytes: number;
  lastModified: string;
}

export type WorkbookInspection = ExcelWorkbookInspection;

export interface SuggestedMapping {
  worklogField?: string;
  worklog_field?: string;
  excelColumnName?: string;
  excel_column_name?: string;
  excelColumnIndex?: number;
  excel_column_index?: number;
  confidence: number;
  isRequired?: boolean;
  is_required?: boolean;
}

export type StandardWorkLogField =
  | "activityDate"
  | "employeeName"
  | "projectName"
  | "activityTitle"
  | "description"
  | "activityType"
  | "technologies"
  | "timeSpentMinutes"
  | "timeSpentHours"
  | "status"
  | "challenges"
  | "nextSteps"
  | "detailedTasks";

export interface FieldMappingEntry {
  worklogField: StandardWorkLogField;
  excelColumnName: string;
  excelColumnIndex: number; // 0-based
  isRequired: boolean;
  defaultValue?: string;
}

export interface ExcelTemplate {
  id: string;
  excelConnectionId: string;
  name: string;
  worksheetName: string;
  headerRowIndex: number; // 1-based in Excel convention
  mappings: FieldMappingEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface ExcelConnection {
  id: string;
  name: string;
  filePath: string;
  fileExists: boolean;
  lastInspectedAt?: string;
  templates?: ExcelTemplate[];
  createdAt: string;
  updatedAt: string;
}

export interface SyncJobRecord {
  id: string;
  activityId: string;
  excelConnectionId: string;
  templateId: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  errorMessage?: string;
  rowAppendedIndex?: number;
  syncedAt?: string;
  retryCount: number;
}

export interface AppendRowResult {
  success: boolean;
  filePath: string;
  sheetName: string;
  rowNumber: number;
  backupPath: string;
  message?: string;
}
