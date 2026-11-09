export type AIEngineType = "LOCAL_GGUF" | "DETERMINISTIC_NLP" | "HYBRID";

export interface HardwareProfile {
  total_memory_bytes: number;
  available_memory_bytes: number;
  cpu_cores: number;
  cpu_architecture: string;
  has_metal_support: boolean;
  has_avx2_support: boolean;
  recommended_engine: string;
}

export interface AIModelStatus {
  activeEngine: AIEngineType;
  modelInstalled: boolean;
  modelFileName?: string;
  modelSizeBytes?: number;
  hardware: HardwareProfile;
  isReady: boolean;
}

export interface EnhancementContext {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  recentActivities: {
    title: string;
    description: string;
    date: string;
  }[];
}
