import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectProgressSection } from "@/components/projects/progress/project-progress-section";
import type {
  MilestoneProgress,
  ProjectProgress,
  ProjectProgressDetail,
} from "@/types/api";

const baseProgress: ProjectProgress = {
  total_tasks: 10,
  todo_tasks: 4,
  in_progress_tasks: 3,
  completed_tasks: 3,
  overdue_tasks: 0,
  completion_rate: 0.3,
  has_tasks: true,
  total_milestones: 2,
  completed_milestones: 1,
  next_due_task: { id: 1, title: "Validate hero copy", due_date: "2026-05-15" },
  next_due_milestone: { id: 2, title: "Design ready", due_date: "2026-06-20" },
  is_overdue: false,
};

const milestonesDetail: MilestoneProgress[] = [
  {
    id: 1,
    title: "Discovery",
    status: "done",
    position: 1,
    due_date: "2026-03-15",
    completed_at: "2026-03-14T16:30:00+00:00",
    total_tasks: 4,
    completed_tasks: 4,
    completion_rate: 1,
  },
  {
    id: 2,
    title: "Design ready",
    status: "in_progress",
    position: 2,
    due_date: "2026-06-20",
    completed_at: null,
    total_tasks: 6,
    completed_tasks: 1,
    completion_rate: 0.1667,
  },
];

const detail: ProjectProgressDetail = {
  project: baseProgress,
  milestones: milestonesDetail,
};

describe("ProjectProgressSection", () => {
  it("renders the global completion percent and KPI tiles", () => {
    render(
      <ProjectProgressSection progress={baseProgress} progressDetail={detail} />,
    );
    expect(screen.getByText("Project progression")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("Total tasks")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
    // "In progress" appears as KPI tile label AND as milestone status badge.
    expect(screen.getAllByText("In progress").length).toBeGreaterThan(0);
    expect(screen.getByText("To do")).toBeInTheDocument();
    expect(screen.getByText("Remaining")).toBeInTheDocument();
  });

  it("renders the next due task and next milestone", () => {
    render(
      <ProjectProgressSection progress={baseProgress} progressDetail={detail} />,
    );
    expect(screen.getByText(/next due task/i)).toBeInTheDocument();
    expect(screen.getByText("Validate hero copy")).toBeInTheDocument();
    expect(screen.getByText(/next milestone/i)).toBeInTheDocument();
    // "Design ready" appears in the next milestone block AND in the milestones list.
    expect(screen.getAllByText("Design ready").length).toBeGreaterThan(0);
  });

  it("shows the overdue alert when project is overdue", () => {
    render(
      <ProjectProgressSection
        progress={{ ...baseProgress, is_overdue: true }}
        progressDetail={null}
      />,
    );
    expect(screen.getByText(/project is overdue/i)).toBeInTheDocument();
  });

  it("renders an overdue KPI when there are overdue tasks", () => {
    render(
      <ProjectProgressSection
        progress={{ ...baseProgress, overdue_tasks: 2 }}
        progressDetail={null}
      />,
    );
    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("renders the milestone progress list when detail is provided", () => {
    render(
      <ProjectProgressSection progress={baseProgress} progressDetail={detail} />,
    );
    expect(screen.getByText("Milestones progress")).toBeInTheDocument();
    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getAllByText("Design ready").length).toBeGreaterThan(0);
  });

  it("renders an empty state when project has no tasks and no milestones", () => {
    render(
      <ProjectProgressSection
        progress={{
          ...baseProgress,
          total_tasks: 0,
          completed_tasks: 0,
          in_progress_tasks: 0,
          todo_tasks: 0,
          has_tasks: false,
          total_milestones: 0,
          completed_milestones: 0,
        }}
        progressDetail={null}
      />,
    );
    expect(
      screen.getByText(/no tasks or milestones yet/i),
    ).toBeInTheDocument();
  });

  it("renders an error alert when error prop is true", () => {
    render(
      <ProjectProgressSection
        progress={null}
        progressDetail={null}
        error
      />,
    );
    expect(screen.getByText(/couldn't load progression/i)).toBeInTheDocument();
  });
});
