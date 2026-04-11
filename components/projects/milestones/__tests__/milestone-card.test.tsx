import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MilestoneCard } from "@/components/projects/milestones/milestone-card";
import type { Milestone } from "@/types/api";

const baseCallbacks = {
  onEdit: vi.fn(),
  onDelete: vi.fn(),
  onChangeStatus: vi.fn(),
  onMoveUp: vi.fn(),
  onMoveDown: vi.fn(),
};

const baseMilestone: Milestone = {
  id: 700,
  project_id: 101,
  title: "Beta launch",
  description: "Ship the beta to early adopters.",
  status: "in_progress",
  position: 2,
  due_date: "2026-05-15",
  completed_at: null,
  created_at: "2026-04-01T00:00:00+00:00",
  updated_at: "2026-04-08T00:00:00+00:00",
};

describe("MilestoneCard", () => {
  it("renders title, position index, status badge and description", () => {
    render(
      <MilestoneCard
        milestone={baseMilestone}
        index={1}
        total={3}
        {...baseCallbacks}
      />,
    );
    expect(screen.getByText("Beta launch")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(
      screen.getByText("Ship the beta to early adopters."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("In progress", { selector: "span" }),
    ).toBeInTheDocument();
  });

  it("flags overdue when due date is in the past and status is not done", () => {
    const overdue: Milestone = {
      ...baseMilestone,
      due_date: "2025-01-01",
      status: "in_progress",
    };
    render(
      <MilestoneCard
        milestone={overdue}
        index={0}
        total={1}
        {...baseCallbacks}
      />,
    );
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it("does not show overdue when status is done", () => {
    const done: Milestone = {
      ...baseMilestone,
      due_date: "2025-01-01",
      status: "done",
      completed_at: "2025-01-02T10:00:00+00:00",
    };
    render(
      <MilestoneCard
        milestone={done}
        index={0}
        total={1}
        {...baseCallbacks}
      />,
    );
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it("exposes an actions button labelled with the milestone title", () => {
    render(
      <MilestoneCard
        milestone={baseMilestone}
        index={1}
        total={3}
        {...baseCallbacks}
      />,
    );
    expect(
      screen.getByRole("button", { name: /actions for beta launch/i }),
    ).toBeInTheDocument();
  });
});
