import { describe, expect, it } from "vitest";

import {
  clampPercent,
  formatCompletionPercent,
  formatRemainingTasks,
  formatShortDate,
} from "@/lib/projects/progress-formatters";
import type { ProjectProgress } from "@/types/api";

const baseProgress: ProjectProgress = {
  total_tasks: 10,
  todo_tasks: 4,
  in_progress_tasks: 3,
  completed_tasks: 3,
  overdue_tasks: 0,
  completion_rate: 0.3,
  has_tasks: true,
  total_milestones: 0,
  completed_milestones: 0,
  next_due_task: null,
  next_due_milestone: null,
  is_overdue: false,
};

describe("progress formatters", () => {
  describe("formatCompletionPercent", () => {
    it("formats a number as percent", () => {
      expect(formatCompletionPercent(0.42)).toBe("42%");
    });

    it("rounds to the nearest integer", () => {
      expect(formatCompletionPercent(0.4167)).toBe("42%");
    });

    it("clamps above 100%", () => {
      expect(formatCompletionPercent(1.5)).toBe("100%");
    });

    it("clamps below 0%", () => {
      expect(formatCompletionPercent(-0.2)).toBe("0%");
    });

    it("returns an em-dash for null", () => {
      expect(formatCompletionPercent(null)).toBe("—");
    });
  });

  describe("clampPercent", () => {
    it("returns 0 for null", () => {
      expect(clampPercent(null)).toBe(0);
    });

    it("clamps to 100 max", () => {
      expect(clampPercent(2)).toBe(100);
    });

    it("rounds to the nearest integer", () => {
      expect(clampPercent(0.4167)).toBe(42);
    });
  });

  describe("formatRemainingTasks", () => {
    it("returns total minus completed", () => {
      expect(formatRemainingTasks(baseProgress)).toBe(7);
    });

    it("never goes below zero", () => {
      expect(
        formatRemainingTasks({
          ...baseProgress,
          completed_tasks: 99,
        }),
      ).toBe(0);
    });
  });

  describe("formatShortDate", () => {
    it("formats an ISO date", () => {
      expect(formatShortDate("2026-04-11")).toMatch(/Apr/);
    });

    it("returns em-dash for null", () => {
      expect(formatShortDate(null)).toBe("—");
    });
  });
});
