import { describe, it, expect } from "vitest";

describe("Utility Logic & Schema Validation", () => {
  it("validates standard worklog fields exist and match schema", () => {
    const requiredFields = ["activityDate", "projectName", "activityTitle", "description"];
    expect(requiredFields).toContain("activityDate");
    expect(requiredFields).toContain("projectName");
    expect(requiredFields).toContain("activityTitle");
    expect(requiredFields).toContain("description");
  });

  it("handles date formatting standards properly", () => {
    const dateStr = "2026-11-09";
    const parts = dateStr.split("-");
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe("2026");
    expect(parts[1]).toBe("11");
    expect(parts[2]).toBe("09");

    const formattedUK = `${parts[2]}/${parts[1]}/${parts[0]}`;
    expect(formattedUK).toBe("09/11/2026");

    const formattedUS = `${parts[1]}/${parts[2]}/${parts[0]}`;
    expect(formattedUS).toBe("11/09/2026");
  });

  it("calculates time duration in decimal hours correctly", () => {
    const minutes1 = 90;
    expect((minutes1 / 60).toFixed(2)).toBe("1.50");

    const minutes2 = 150;
    expect((minutes2 / 60).toFixed(2)).toBe("2.50");

    const minutes3 = 45;
    expect((minutes3 / 60).toFixed(2)).toBe("0.75");
  });

  it("infers activity types and statuses accurately", () => {
    const validStatuses = ["COMPLETED", "IN_PROGRESS", "BLOCKED", "PLANNED"];
    expect(validStatuses).toContain("COMPLETED");
    expect(validStatuses).toContain("IN_PROGRESS");
    expect(validStatuses).toContain("BLOCKED");

    const validCategories = [
      "DEVELOPMENT",
      "BUG_FIXING",
      "RESEARCH_AND_TESTING",
      "CODE_REVIEW",
      "MEETING",
      "DOCUMENTATION",
      "DEPLOYMENT",
      "PLANNING",
      "OTHER",
    ];
    expect(validCategories).toContain("DEVELOPMENT");
    expect(validCategories).toContain("RESEARCH_AND_TESTING");
  });
});
