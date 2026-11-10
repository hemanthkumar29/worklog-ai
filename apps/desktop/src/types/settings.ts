export interface UserProfile {
  id: string;
  displayName: string;
  dateFormat: string;
  defaultProjectId?: string;
  defaultExcelConnectionId?: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShortcutConfig {
  quickCapture: string; // e.g. "CommandOrControl+Shift+Space"
  inAppCapture: string;
}

export interface AppSettings {
  user: UserProfile;
  shortcuts: ShortcutConfig;
  theme: "light" | "dark" | "system";
  aiEngine: "HYBRID" | "LOCAL_GGUF" | "DETERMINISTIC_NLP";
  autoSyncExcel: boolean;
  backupRetentionCount: number;
}

export interface DatabaseStats {
  totalActivities?: number;
  total_activities?: number;
  totalProjects?: number;
  total_projects?: number;
  totalExcelConnections?: number;
  total_excel_connections?: number;
  dbSizeBytes?: number;
  db_size_bytes?: number;
  dbPath?: string;
  db_path?: string;
  backupDir?: string;
  backup_dir?: string;
}
