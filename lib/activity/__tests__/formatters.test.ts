import { describe, expect, it } from "vitest";

import {
  formatRelativeTime,
  humanizeActivityEvent,
} from "@/lib/activity/formatters";
import type { ActivityLogEntry } from "@/types/api";

function makeEntry(partial: Partial<ActivityLogEntry>): ActivityLogEntry {
  return {
    id: 1,
    event: "task.created",
    subject: { type: "task", id: 1, label: "Sample" },
    project_id: 1,
    actor: { type: "customer", id: 1, name: "Ada" },
    properties: {},
    created_at: "2026-04-11T12:00:00+00:00",
    ...partial,
  };
}

describe("humanizeActivityEvent", () => {
  it("humanizes task.created", () => {
    const result = humanizeActivityEvent(
      makeEntry({
        event: "task.created",
        subject: { type: "task", id: 1, label: "Plan retro" },
      }),
    );
    expect(result.icon).toBe("created");
    expect(result.title).toContain("Plan retro");
  });

  it("humanizes task.completed", () => {
    const result = humanizeActivityEvent(
      makeEntry({
        event: "task.completed",
        subject: { type: "task", id: 1, label: "Ship docs" },
      }),
    );
    expect(result.icon).toBe("completed");
    expect(result.title).toContain("Ship docs");
  });

  it("humanizes task.status_changed with from/to detail", () => {
    const result = humanizeActivityEvent(
      makeEntry({
        event: "task.status_changed",
        subject: { type: "task", id: 1, label: "Draft brief" },
        properties: { from: "todo", to: "in_progress" },
      }),
    );
    expect(result.icon).toBe("status_changed");
    expect(result.detail).toBe("to do → in progress");
  });

  it("humanizes milestone.completed", () => {
    const result = humanizeActivityEvent(
      makeEntry({
        event: "milestone.completed",
        subject: { type: "milestone", id: 1, label: "Discovery" },
      }),
    );
    expect(result.icon).toBe("completed");
    expect(result.title).toContain("Discovery");
  });

  it("falls back to a generic title for unknown events", () => {
    const result = humanizeActivityEvent(
      makeEntry({
        event: "task.flagged_urgent",
        subject: { type: "task", id: 7, label: "Mystery" },
      }),
    );
    expect(result.icon).toBe("default");
    expect(result.title.toLowerCase()).toContain("flagged urgent");
  });

  it("uses the property label fallback when subject label is missing", () => {
    const result = humanizeActivityEvent(
      makeEntry({
        event: "task.created",
        subject: { type: "task", id: 1, label: null },
        properties: { label: "Snapshot label" },
      }),
    );
    expect(result.title).toContain("Snapshot label");
  });
});

describe("formatRelativeTime", () => {
  const NOW = new Date("2026-04-11T12:00:00+00:00").getTime();

  it("returns 'just now' under one minute", () => {
    expect(formatRelativeTime("2026-04-11T11:59:30+00:00", NOW)).toBe("just now");
  });

  it("returns minutes ago under one hour", () => {
    expect(formatRelativeTime("2026-04-11T11:45:00+00:00", NOW)).toBe("15m ago");
  });

  it("returns hours ago under one day", () => {
    expect(formatRelativeTime("2026-04-11T09:00:00+00:00", NOW)).toBe("3h ago");
  });

  it("returns days ago under one week", () => {
    expect(formatRelativeTime("2026-04-08T12:00:00+00:00", NOW)).toBe("3d ago");
  });

  it("returns an absolute date past 7 days", () => {
    const result = formatRelativeTime("2026-03-01T12:00:00+00:00", NOW);
    expect(result).toMatch(/Mar/);
  });
});
