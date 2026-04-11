import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { isTaskOverdue, sortTasksByPosition } from "@/lib/tasks/formatters";
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

describe("isTaskOverdue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-11T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns false when there is no due date", () => {
    expect(isTaskOverdue(makeTask({ due_date: null }))).toBe(false);
  });

  it("returns false when the task is done", () => {
    expect(
      isTaskOverdue(makeTask({ due_date: "2026-01-01", status: "done" })),
    ).toBe(false);
  });

  it("returns true when the due date is in the past", () => {
    expect(
      isTaskOverdue(makeTask({ due_date: "2026-04-01", status: "todo" })),
    ).toBe(true);
  });

  it("returns false when the due date is in the future", () => {
    expect(
      isTaskOverdue(makeTask({ due_date: "2026-06-01", status: "todo" })),
    ).toBe(false);
  });
});

describe("sortTasksByPosition", () => {
  it("sorts tasks by ascending position without mutating the input", () => {
    const tasks = [
      makeTask({ id: 1, position: 3 }),
      makeTask({ id: 2, position: 1 }),
      makeTask({ id: 3, position: 2 }),
    ];
    const sorted = sortTasksByPosition(tasks);
    expect(sorted.map((t) => t.id)).toEqual([2, 3, 1]);
    expect(tasks.map((t) => t.id)).toEqual([1, 2, 3]);
  });
});
