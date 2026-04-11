import { describe, expect, it } from "vitest";

import {
  createProjectMilestone,
  fetchProjectMilestones,
  reorderProjectMilestones,
  updateProjectMilestone,
} from "@/lib/api/milestones";

const PROJECT_ID = 101;

describe("milestones API service (status + reorder)", () => {
  it("stamps completed_at when transitioning a milestone to done", async () => {
    // Pick the in_progress milestone (id 502 in the fixture).
    const before = await fetchProjectMilestones(PROJECT_ID);
    const target = before.data.find((m) => m.status === "in_progress");
    expect(target).toBeDefined();
    expect(target!.completed_at).toBeNull();

    const res = await updateProjectMilestone(PROJECT_ID, target!.id, {
      status: "done",
    });
    expect(res.data.status).toBe("done");
    expect(res.data.completed_at).not.toBeNull();
  });

  it("clears completed_at when leaving the done status", async () => {
    // The fixture milestone 501 is already done with a completed_at.
    const before = await fetchProjectMilestones(PROJECT_ID);
    const done = before.data.find((m) => m.status === "done");
    expect(done?.completed_at).not.toBeNull();

    const res = await updateProjectMilestone(PROJECT_ID, done!.id, {
      status: "in_progress",
    });
    expect(res.data.status).toBe("in_progress");
    expect(res.data.completed_at).toBeNull();
  });

  it("auto-assigns the next position when creating a new milestone", async () => {
    const created = await createProjectMilestone(PROJECT_ID, {
      title: "QA hardening",
      status: "pending",
    });
    expect(created.data.position).toBe(4);
  });

  it("reorders milestones and reassigns positions in order", async () => {
    const before = await fetchProjectMilestones(PROJECT_ID);
    const ids = before.data.map((m) => m.id);
    const reversed = [...ids].reverse();

    const res = await reorderProjectMilestones(PROJECT_ID, reversed);
    expect(res.data.map((m) => m.id)).toEqual(reversed);
    res.data.forEach((m, index) => {
      expect(m.position).toBe(index + 1);
    });

    // Confirm the change persists in the mock store.
    const after = await fetchProjectMilestones(PROJECT_ID);
    expect(after.data.map((m) => m.id)).toEqual(reversed);
  });

  it("rejects a reorder payload that does not contain every milestone", async () => {
    const before = await fetchProjectMilestones(PROJECT_ID);
    const partial = before.data.slice(1).map((m) => m.id);
    await expect(
      reorderProjectMilestones(PROJECT_ID, partial),
    ).rejects.toMatchObject({
      status: 422,
    });
  });
});
