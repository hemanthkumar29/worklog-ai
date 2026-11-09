export type ProjectStatus = "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  excelConnectionId?: string;
  defaultWorksheet?: string;
  isArchived: boolean;
  activityCount?: number;
  totalTimeMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  clientName?: string;
  technologies: string[];
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  excelConnectionId?: string;
  defaultWorksheet?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  clientName?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  status?: ProjectStatus;
  excelConnectionId?: string;
  defaultWorksheet?: string;
  isArchived?: boolean;
}
