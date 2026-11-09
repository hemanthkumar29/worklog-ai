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
    return await invoke("create_activity", { input });
  },

  getActivity: async (id: string): Promise<Activity | null> => {
    return await invoke("get_activity", { id });
  },

  listActivities: async (filter: ActivityFilterParams = {}): Promise<Activity[]> => {
    return await invoke("list_activities", {
      filter: {
        project_id: filter.projectId || null,
        search_query: filter.searchQuery || null,
        start_date: filter.startDate || null,
        end_date: filter.endDate || null,
        status: filter.status || null,
        sync_status: filter.syncStatus || null,
        limit: filter.limit || null,
        offset: filter.offset || null,
      },
    });
  },

  updateActivity: async (input: UpdateActivityInput): Promise<Activity | null> => {
    return await invoke("update_activity", { input });
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
        client_name: input.clientName || null,
        technologies: input.technologies,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        status: input.status || "ACTIVE",
        excel_connection_id: input.excelConnectionId || null,
        default_worksheet: input.defaultWorksheet || null,
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
        client_name: input.clientName || null,
        technologies: input.technologies || null,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        status: input.status || null,
        excel_connection_id: input.excelConnectionId || null,
        default_worksheet: input.defaultWorksheet || null,
        is_archived: input.isArchived !== undefined ? input.isArchived : null,
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
      worklog_field: string;
      excel_column_name: string;
      excel_column_index: number;
      is_required: boolean;
      default_value?: string;
    }>;
  }): Promise<ExcelTemplate> => {
    return await invoke("save_excel_template", {
      input: {
        excel_connection_id: params.excelConnectionId,
        name: params.name,
        worksheet_name: params.worksheetName,
        header_row_index: params.headerRowIndex,
        mappings: params.mappings,
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
        display_name: input.displayName || null,
        date_format: input.dateFormat || null,
        default_project_id: input.defaultProjectId || null,
        default_excel_connection_id: input.defaultExcelConnectionId || null,
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
