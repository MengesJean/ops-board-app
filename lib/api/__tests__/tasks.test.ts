import { describe, expect, it } from "vitest";

import {
  createProjectTask,
  deleteProjectTask,
  fetchProjectTasks,
  reorderProjectTasks,
  updateProjectTask,
} from "@/lib/api/tasks";

const PROJECT_ID = 101;

describe("tasks API service", () => {
  it("fetches the tasks of a project, ordered by position", async () => {
    const res = await fetchProjectTasks(PROJECT_ID);
    expect(res.data.length).toBeGreaterThan(0);
    const positions = res.data.map((t) => t.position);
    const sorted = [...positions].sort((a, b) => a - b);
    expect(positions).toEqual(sorted);
  });

  it("filters tasks by status", async () => {
    const res = await fetchProjectTasks(PROJECT_ID, { status: "done" });
    expect(res.data.every((t) => t.status === "done")).toBe(true);
  });

  it("filters tasks by priority", async () => {
    const res = await fetchProjectTasks(PROJECT_ID, { priority: "high" });
    expect(res.data.every((t) => t.priority === "high")).toBe(true);
  });

  it("filters tasks by milestone", async () => {
    const res = await fetchProjectTasks(PROJECT_ID, {
      project_milestone_id: 502,
    });
    expect(res.data.every((t) => t.project_milestone_id === 502)).toBe(true);
  });

  it("searches tasks by title (case-insensitive)", async () => {
    const res = await fetchProjectTasks(PROJECT_ID, { search: "TECHNICAL" });
    expect(res.data.length).toBeGreaterThan(0);
    expect(
      res.data.every((t) => t.title.toLowerCase().includes("technical")),
    ).toBe(true);
  });

  it("creates a task with auto-assigned position", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const expectedPosition =
      before.data.reduce((max, t) => Math.max(max, t.position), 0) + 1;
    const created = await createProjectTask(PROJECT_ID, {
      title: "Plan retro",
      status: "todo",
      priority: "medium",
    });
    expect(created.data.title).toBe("Plan retro");
    expect(created.data.project_id).toBe(PROJECT_ID);
    expect(created.data.position).toBe(expectedPosition);
    expect(created.data.completed_at).toBeNull();
  });

  it("stamps completed_at when creating a task as done", async () => {
    const created = await createProjectTask(PROJECT_ID, {
      title: "Already shipped",
      status: "done",
      priority: "low",
    });
    expect(created.data.completed_at).not.toBeNull();
  });

  it("rejects creation with a missing title (422)", async () => {
    await expect(
      createProjectTask(PROJECT_ID, {
        title: "   ",
        status: "todo",
        priority: "medium",
      }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("rejects creation with a milestone from another project (422)", async () => {
    await expect(
      createProjectTask(PROJECT_ID, {
        title: "Cross-project",
        status: "todo",
        priority: "medium",
        project_milestone_id: 999_999,
      }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("stamps completed_at when transitioning a task to done", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const target = before.data.find((t) => t.status === "in_progress");
    expect(target).toBeDefined();
    const res = await updateProjectTask(PROJECT_ID, target!.id, {
      status: "done",
    });
    expect(res.data.status).toBe("done");
    expect(res.data.completed_at).not.toBeNull();
  });

  it("clears completed_at when leaving the done status", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const done = before.data.find((t) => t.status === "done");
    expect(done?.completed_at).not.toBeNull();
    const res = await updateProjectTask(PROJECT_ID, done!.id, {
      status: "in_progress",
    });
    expect(res.data.status).toBe("in_progress");
    expect(res.data.completed_at).toBeNull();
  });

  it("rejects an update with an empty title (422)", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const first = before.data[0];
    await expect(
      updateProjectTask(PROJECT_ID, first.id, { title: "  " }),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("reorders tasks and reassigns positions", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const ids = before.data.map((t) => t.id);
    const reversed = [...ids].reverse();
    const res = await reorderProjectTasks(PROJECT_ID, reversed);
    expect(res.data.map((t) => t.id)).toEqual(reversed);
    res.data.forEach((t, index) => {
      expect(t.position).toBe(index + 1);
    });
  });

  it("rejects a partial reorder payload (422)", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const partial = before.data.slice(1).map((t) => t.id);
    await expect(
      reorderProjectTasks(PROJECT_ID, partial),
    ).rejects.toMatchObject({ status: 422 });
  });

  it("deletes a task", async () => {
    const before = await fetchProjectTasks(PROJECT_ID);
    const first = before.data[0];
    await deleteProjectTask(PROJECT_ID, first.id);
    const after = await fetchProjectTasks(PROJECT_ID);
    expect(after.data.find((t) => t.id === first.id)).toBeUndefined();
  });
});
