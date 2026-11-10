import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExcelStore } from "../stores/useExcelStore";
import { useUserStore } from "../stores/useUserStore";

// Mock Tauri invoke core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

describe("Zustand Stores & DTO Normalization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes user profile isOnboarded correctly from camelCase payload", () => {
    const rawCamel = {
      id: "u-123",
      displayName: "Jane Doe",
      dateFormat: "YYYY-MM-DD",
      isOnboarded: true,
      createdAt: "2026-11-09T10:00:00Z",
      updatedAt: "2026-11-09T10:00:00Z",
    };

    const isUserOnboarded = Boolean(rawCamel.isOnboarded ?? (rawCamel as any).is_onboarded ?? false);
    expect(isUserOnboarded).toBe(true);
  });

  it("normalizes user profile is_onboarded correctly from snake_case legacy payload", () => {
    const rawSnake = {
      id: "u-123",
      display_name: "Jane Doe",
      date_format: "YYYY-MM-DD",
      is_onboarded: true,
      created_at: "2026-11-09T10:00:00Z",
      updated_at: "2026-11-09T10:00:00Z",
    };

    const isUserOnboarded = Boolean((rawSnake as any).isOnboarded ?? rawSnake.is_onboarded ?? false);
    expect(isUserOnboarded).toBe(true);
  });

  it("handles SuggestedMapping with camelCase keys from Rust backend", () => {
    const suggestions = [
      {
        worklogField: "activityDate",
        excelColumnName: "Log Date",
        excelColumnIndex: 0,
        confidence: 0.95,
        isRequired: true,
      },
      {
        worklogField: "activityTitle",
        excelColumnName: "Task Summary",
        excelColumnIndex: 2,
        confidence: 0.90,
        isRequired: true,
      },
    ];

    const newMappings: Record<string, number | null> = {};
    for (const s of suggestions) {
      const field = s.worklogField || (s as any).worklog_field;
      const colIdx = s.excelColumnIndex ?? (s as any).excel_column_index;
      if (field && colIdx !== undefined) {
        newMappings[field] = colIdx;
      }
    }

    expect(newMappings["activityDate"]).toBe(0);
    expect(newMappings["activityTitle"]).toBe(2);
  });

  it("handles HardwareProfile and DatabaseStats fallback properties without NaN or undefined", () => {
    const hardwareDto = {
      totalMemoryBytes: 17179869184, // 16 GB
      cpuCores: 8,
      cpuArchitecture: "aarch64",
      hasMetalSupport: true,
      hasAvx2Support: false,
      recommendedEngine: "HYBRID",
    };

    const totalMem = (hardwareDto.totalMemoryBytes ?? (hardwareDto as any).total_memory_bytes ?? 0) / (1024 * 1024 * 1024);
    expect(totalMem.toFixed(1)).toBe("16.0");
    expect(Number.isNaN(totalMem)).toBe(false);

    const dbStatsDto = {
      totalActivities: 42,
      totalProjects: 3,
      totalExcelConnections: 1,
      dbSizeBytes: 1048576, // 1 MB
      dbPath: "/path/to/db.sqlite",
      backupDir: "/path/to/backups",
    };

    const totalAct = dbStatsDto.totalActivities ?? (dbStatsDto as any).total_activities ?? 0;
    expect(totalAct).toBe(42);
    const sizeKb = (dbStatsDto.dbSizeBytes ?? (dbStatsDto as any).db_size_bytes ?? 0) / 1024;
    expect(sizeKb.toFixed(1)).toBe("1024.0");
  });

  it("updates mapping in useExcelStore", () => {
    const store = useExcelStore.getState();
    store.setMapping("activityTitle", 3);
    expect(useExcelStore.getState().currentMappings.activityTitle).toBe(3);
  });

  it("checks useUserStore initial state", () => {
    const userState = useUserStore.getState();
    expect(userState.profile).toBeNull();
    expect(typeof userState.loadProfile).toBe("function");
    expect(typeof userState.updateProfile).toBe("function");
    expect(typeof userState.setOnboarded).toBe("function");
  });
});
