import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectActivitySection } from "@/components/projects/activity/project-activity-section";
import type { ActivityLogEntry } from "@/types/api";

const sampleEntries: ActivityLogEntry[] = [
  {
    id: 1,
    event: "task.completed",
    subject: { type: "task", id: 11, label: "Set up the project repository" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: { label: "Set up the project repository" },
    created_at: "2026-04-10T15:30:00+00:00",
  },
  {
    id: 2,
    event: "task.status_changed",
    subject: { type: "task", id: 12, label: "Draft the technical brief" },
    project_id: 101,
    actor: { type: "customer", id: 1, name: "Ada Lovelace" },
    properties: { from: "todo", to: "in_progress" },
    created_at: "2026-04-09T11:00:00+00:00",
  },
];

describe("ProjectActivitySection", () => {
  it("renders the section title", () => {
    render(<ProjectActivitySection entries={sampleEntries} />);
    expect(screen.getByText("Recent activity")).toBeInTheDocument();
  });

  it("renders each humanized activity entry", () => {
    render(<ProjectActivitySection entries={sampleEntries} />);
    expect(
      screen.getByText(/Task completed: Set up the project repository/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Task moved: Draft the technical brief/i),
    ).toBeInTheDocument();
  });

  it("renders the from → to detail for status_changed", () => {
    render(<ProjectActivitySection entries={sampleEntries} />);
    expect(screen.getByText("to do → in progress")).toBeInTheDocument();
  });

  it("renders the actor name", () => {
    render(<ProjectActivitySection entries={sampleEntries} />);
    expect(screen.getAllByText("Ada Lovelace").length).toBeGreaterThan(0);
  });

  it("renders an empty state when there are no entries", () => {
    render(<ProjectActivitySection entries={[]} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("renders an error state when error prop is true", () => {
    render(<ProjectActivitySection entries={[]} error />);
    expect(screen.getByText(/couldn't load activity/i)).toBeInTheDocument();
  });
});
