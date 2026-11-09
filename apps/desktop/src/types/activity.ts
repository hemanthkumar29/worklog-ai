export type ActivityType =
  | "DEVELOPMENT"
  | "BUG_FIXING"
  | "RESEARCH_AND_TESTING"
  | "CODE_REVIEW"
  | "MEETING"
  | "DOCUMENTATION"
  | "DEPLOYMENT"
  | "PLANNING"
  | "OTHER";

export type ActivityStatus =
  | "COMPLETED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "PLANNED";

export type ReviewStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED";

export type SyncStatus = "PENDING" | "SYNCED" | "FAILED" | "SKIPPED";

export interface ActivityTask {
  id?: string;
  activityId?: string;
  taskDescription: string;
  orderIndex: number;
  isCompleted: boolean;
}

export interface Activity {
  id: string;
  projectId: string;
  projectName?: string;
  activityDate: string; // YYYY-MM-DD
  rawInput: string;
  activityTitle: string;
  enhancedDescription: string;
  activityType: ActivityType;
  status: ActivityStatus;
  timeSpentMinutes: number | null;
  reviewStatus: ReviewStatus;
  syncStatus: SyncStatus;
  tasks: string[];
  technologies: string[];
  challenges: string[];
  nextSteps: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AIStructuredOutput {
  activityTitle: string;
  description: string;
  detailedTasks: string[];
  activityType: ActivityType;
  technologies: string[];
  status: ActivityStatus;
  timeSpentMinutes: number | null;
  challenges: string[];
  nextSteps: string[];
}

export interface CreateActivityInput {
  projectId: string;
  activityDate: string;
  rawInput: string;
  activityTitle: string;
  enhancedDescription: string;
  activityType: string;
  status: string;
  timeSpentMinutes?: number | null;
  tasks: string[];
  technologies: string[];
  challenges: string[];
  nextSteps: string[];
}

export interface UpdateActivityInput {
  id: string;
  project_id?: string;
  activity_date?: string;
  activity_title?: string;
  enhanced_description?: string;
  activity_type?: string;
  status?: string;
  time_spent_minutes?: number | null;
  review_status?: string;
  sync_status?: string;
  tasks?: string[];
  technologies?: string[];
  challenges?: string[];
  next_steps?: string[];
}

export interface CaptureInput {
  projectId: string;
  rawInput: string;
  activityDate?: string;
  timeSpentMinutes?: number | null;
}
