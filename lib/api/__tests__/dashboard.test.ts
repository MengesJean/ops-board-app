import { describe, expect, it } from "vitest";

import { fetchDashboard } from "@/lib/api/dashboard";

describe("dashboard API service", () => {
  it("fetches the dashboard payload", async () => {
    const res = await fetchDashboard();
    expect(res.data.stats.active_projects_count).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.data.priorities.overdue_tasks)).toBe(true);
    expect(Array.isArray(res.data.priorities.due_today_tasks)).toBe(true);
    expect(Array.isArray(res.data.priorities.upcoming_milestones)).toBe(true);
    expect(Array.isArray(res.data.priorities.at_risk_projects)).toBe(true);
    expect(Array.isArray(res.data.projects)).toBe(true);
    expect(Array.isArray(res.data.recent_activity)).toBe(true);
  });

  it("returns a global completion rate between 0 and 1", async () => {
    const res = await fetchDashboard();
    const rate = res.data.stats.global_completion_rate;
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(1);
  });
});
