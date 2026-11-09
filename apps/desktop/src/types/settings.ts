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
  total_activities: number;
  total_projects: number;
  total_excel_connections: number;
  db_size_bytes: number;
  db_path: string;
  backup_dir: string;
}
