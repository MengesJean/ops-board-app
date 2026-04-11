import { describe, expect, it } from "vitest";

import {
  computeProjectTaskProgress,
  countTasksByStatus,
} from "@/lib/tasks/progress";
import type { Task } from "@/types/api";

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 1,
    project_id: 1,
    project_milestone_id: null,
    title: "Task",
    description: null,
    status: "todo",
    priority: "medium",
    position: 1,
    due_date: null,
    completed_at: null,
    created_at: "2026-04-01T00:00:00+00:00",
    updated_at: "2026-04-01T00:00:00+00:00",
    ...overrides,
  };
}

describe("countTasksByStatus", () => {
  it("returns zeros for an empty list", () => {
    expect(countTasksByStatus([])).toEqual({
      todo: 0,
      in_progress: 0,
      done: 0,
      total: 0,
    });
  });

  it("counts each status and the total", () => {
    const tasks = [
      makeTask({ id: 1, status: "todo" }),
      makeTask({ id: 2, status: "todo" }),
      makeTask({ id: 3, status: "in_progress" }),
      makeTask({ id: 4, status: "done" }),
    ];
    expect(countTasksByStatus(tasks)).toEqual({
      todo: 2,
      in_progress: 1,
      done: 1,
      total: 4,
    });
  });
});

describe("computeProjectTaskProgress", () => {
  it("returns a zero ratio for an empty list", () => {
    expect(computeProjectTaskProgress([])).toEqual({
      done: 0,
      total: 0,
      ratio: 0,
    });
  });

  it("computes the ratio of done tasks", () => {
    const tasks = [
      makeTask({ id: 1, status: "done" }),
      makeTask({ id: 2, status: "done" }),
      makeTask({ id: 3, status: "in_progress" }),
      makeTask({ id: 4, status: "todo" }),
    ];
    expect(computeProjectTaskProgress(tasks)).toEqual({
      done: 2,
      total: 4,
      ratio: 0.5,
    });
  });

  it("returns 1 when every task is done", () => {
    const tasks = [
      makeTask({ id: 1, status: "done" }),
      makeTask({ id: 2, status: "done" }),
    ];
    expect(computeProjectTaskProgress(tasks).ratio).toBe(1);
  });
});
