export type AIEngineType = "LOCAL_GGUF" | "DETERMINISTIC_NLP" | "HYBRID";

export interface HardwareProfile {
  totalMemoryBytes?: number;
  total_memory_bytes?: number;
  availableMemoryBytes?: number;
  available_memory_bytes?: number;
  cpuCores?: number;
  cpu_cores?: number;
  cpuArchitecture?: string;
  cpu_architecture?: string;
  hasMetalSupport?: boolean;
  has_metal_support?: boolean;
  hasAvx2Support?: boolean;
  has_avx2_support?: boolean;
  recommendedEngine?: string;
  recommended_engine?: string;
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
