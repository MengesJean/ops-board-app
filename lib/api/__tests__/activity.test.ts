import { describe, expect, it } from "vitest";

import { fetchProjectActivity } from "@/lib/api/activity";

const PROJECT_ID = 101;

describe("project activity API service", () => {
  it("fetches a paginated list of activity entries for a project", async () => {
    const res = await fetchProjectActivity(PROJECT_ID, { per_page: 20 });
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data.every((e) => e.project_id === PROJECT_ID)).toBe(true);
    expect(res.meta.per_page).toBe(20);
  });

  it("returns entries with the expected shape", async () => {
    const res = await fetchProjectActivity(PROJECT_ID);
    const entry = res.data[0];
    expect(entry).toMatchObject({
      id: expect.any(Number),
      event: expect.any(String),
      subject: expect.objectContaining({
        type: expect.any(String),
        id: expect.any(Number),
      }),
      project_id: PROJECT_ID,
      created_at: expect.any(String),
    });
  });

  it("returns an empty list for a project that has no activity", async () => {
    const res = await fetchProjectActivity(102);
    expect(res.data).toEqual([]);
  });
});
