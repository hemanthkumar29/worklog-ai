import { invoke } from "@tauri-apps/api/core";
import {
  Activity,
  AIStructuredOutput,
  CreateActivityInput,
  UpdateActivityInput,
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  WorkbookInspection,
  SuggestedMapping,
  ExcelTemplate,
  ExcelConnection,
  AppendRowResult,
  HardwareProfile,
  UserProfile,
  DatabaseStats,
} from "../types";

export interface ActivityFilterParams {
  projectId?: string;
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  syncStatus?: string;
  limit?: number;
  offset?: number;
}

export const tauriApi = {
  // Activities
  createActivity: async (input: CreateActivityInput): Promise<Activity> => {
    return await invoke("create_activity", {
      input: {
        projectId: input.projectId,
        activityDate: input.activityDate,
        rawInput: input.rawInput,
        activityTitle: input.activityTitle,
        enhancedDescription: input.enhancedDescription,
        activityType: input.activityType,
        status: input.status,
        timeSpentMinutes: input.timeSpentMinutes ?? null,
        tasks: input.tasks,
        technologies: input.technologies,
        challenges: input.challenges,
        nextSteps: input.nextSteps,
      },
    });
  },

  getActivity: async (id: string): Promise<Activity | null> => {
    return await invoke("get_activity", { id });
  },

  listActivities: async (filter: ActivityFilterParams = {}): Promise<Activity[]> => {
    return await invoke("list_activities", {
      filter: {
        projectId: filter.projectId || null,
        searchQuery: filter.searchQuery || null,
        startDate: filter.startDate || null,
        endDate: filter.endDate || null,
        status: filter.status || null,
        syncStatus: filter.syncStatus || null,
        limit: filter.limit || null,
        offset: filter.offset || null,
      },
    });
  },

  updateActivity: async (input: UpdateActivityInput): Promise<Activity | null> => {
    return await invoke("update_activity", {
      input: {
        id: input.id,
        projectId: input.project_id || (input as any).projectId || null,
        activityDate: input.activity_date || (input as any).activityDate || null,
        activityTitle: input.activity_title || (input as any).activityTitle || null,
        enhancedDescription: input.enhanced_description || (input as any).enhancedDescription || null,
        activityType: input.activity_type || (input as any).activityType || null,
        status: input.status || null,
        timeSpentMinutes: input.time_spent_minutes ?? (input as any).timeSpentMinutes ?? null,
        reviewStatus: input.review_status || (input as any).reviewStatus || null,
        syncStatus: input.sync_status || (input as any).syncStatus || null,
        tasks: input.tasks || null,
        technologies: input.technologies || null,
        challenges: input.challenges || null,
        nextSteps: input.next_steps || (input as any).nextSteps || null,
      },
    });
  },

  deleteActivity: async (id: string): Promise<boolean> => {
    return await invoke("delete_activity", { id });
  },

  // Projects
  createProject: async (input: CreateProjectInput): Promise<Project> => {
    return await invoke("create_project", {
      input: {
        name: input.name,
        description: input.description,
        clientName: input.clientName || null,
        technologies: input.technologies,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        status: input.status || "ACTIVE",
        excelConnectionId: input.excelConnectionId || null,
        defaultWorksheet: input.defaultWorksheet || null,
      },
    });
  },

  getProject: async (id: string): Promise<Project | null> => {
    return await invoke("get_project", { id });
  },

  listProjects: async (includeArchived: boolean = false): Promise<Project[]> => {
    return await invoke("list_projects", { includeArchived });
  },

  updateProject: async (input: UpdateProjectInput): Promise<Project | null> => {
    return await invoke("update_project", {
      input: {
        id: input.id,
        name: input.name || null,
        description: input.description || null,
        clientName: input.clientName || null,
        technologies: input.technologies || null,
        startDate: input.startDate || null,
        endDate: input.endDate || null,
        status: input.status || null,
        excelConnectionId: input.excelConnectionId || null,
        defaultWorksheet: input.defaultWorksheet || null,
        isArchived: input.isArchived !== undefined ? input.isArchived : null,
      },
    });
  },

  deleteProject: async (id: string): Promise<boolean> => {
    return await invoke("delete_project", { id });
  },

  // Excel
  inspectWorkbook: async (filePath: string, saveConnection: boolean = true): Promise<WorkbookInspection> => {
    return await invoke("inspect_workbook", { filePath, saveConnection });
  },

  suggestColumnMappings: async (headers: string[]): Promise<SuggestedMapping[]> => {
    return await invoke("suggest_column_mappings", { headers });
  },

  saveExcelTemplate: async (params: {
    excelConnectionId: string;
    name: string;
    worksheetName: string;
    headerRowIndex: number;
    mappings: Array<{
      worklogField?: string;
      worklog_field?: string;
      excelColumnName?: string;
      excel_column_name?: string;
      excelColumnIndex?: number;
      excel_column_index?: number;
      isRequired?: boolean;
      is_required?: boolean;
      defaultValue?: string;
      default_value?: string;
    }>;
  }): Promise<ExcelTemplate> => {
    return await invoke("save_excel_template", {
      input: {
        excelConnectionId: params.excelConnectionId,
        name: params.name,
        worksheetName: params.worksheetName,
        headerRowIndex: params.headerRowIndex,
        mappings: params.mappings.map((m: any) => ({
          worklogField: m.worklogField || m.worklog_field,
          excelColumnName: m.excelColumnName || m.excel_column_name,
          excelColumnIndex: m.excelColumnIndex ?? m.excel_column_index,
          isRequired: Boolean(m.isRequired ?? m.is_required ?? false),
          defaultValue: m.defaultValue || m.default_value || null,
        })),
      },
    });
  },

  listExcelConnections: async (): Promise<ExcelConnection[]> => {
    return await invoke("list_excel_connections");
  },

  syncActivityToExcel: async (activityId: string, templateId: string): Promise<AppendRowResult> => {
    return await invoke("sync_activity_to_excel", {
      activityId,
      templateId,
    });
  },

  // AI
  getHardwareProfile: async (): Promise<HardwareProfile> => {
    return await invoke("get_hardware_profile");
  },

  enhanceActivityText: async (rawInput: string, projectId?: string): Promise<AIStructuredOutput> => {
    return await invoke("enhance_activity_text", {
      rawInput,
      projectId: projectId || null,
    });
  },

  // Settings & Profile
  getUserProfile: async (): Promise<UserProfile> => {
    return await invoke("get_user_profile");
  },

  updateUserProfile: async (input: {
    displayName?: string;
    dateFormat?: string;
    defaultProjectId?: string;
    defaultExcelConnectionId?: string;
  }): Promise<UserProfile> => {
    return await invoke("update_user_profile", {
      input: {
        displayName: input.displayName || null,
        dateFormat: input.dateFormat || null,
        defaultProjectId: input.defaultProjectId || null,
        defaultExcelConnectionId: input.defaultExcelConnectionId || null,
      },
    });
  },

  getDatabaseStats: async (): Promise<DatabaseStats> => {
    return await invoke("get_database_stats");
  },

  wipeAllData: async (): Promise<boolean> => {
    return await invoke("wipe_all_data");
  },

  getSetting: async (key: string): Promise<string | null> => {
    return await invoke("get_setting", { key });
  },

  setSetting: async (key: string, value: string): Promise<boolean> => {
    return await invoke("set_setting", { key, value });
  },
};
