import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardView } from "@/components/dashboard/dashboard-view";
import { mockDashboard } from "@/test/mocks/fixtures/dashboard";
import type { Customer } from "@/types/api";

const customer: Customer = {
  id: 1,
  name: "Ada Lovelace",
  email: "ada@example.com",
  email_verified_at: null,
  created_at: "2026-04-10T12:00:00+00:00",
};

describe("DashboardView", () => {
  it("renders a personalised greeting", () => {
    render(<DashboardView data={mockDashboard} customer={customer} />);
    expect(screen.getByText(/welcome back, ada/i)).toBeInTheDocument();
  });

  it("renders all four KPI cards", () => {
    render(<DashboardView data={mockDashboard} customer={customer} />);
    expect(screen.getByText("Active projects")).toBeInTheDocument();
    // "Projects at risk" / "Due today" appear both in stats card and priorities block.
    expect(screen.getAllByText("Projects at risk").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Overdue tasks").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Due today").length).toBeGreaterThan(0);
  });

  it("renders the four priority blocks", () => {
    render(<DashboardView data={mockDashboard} customer={customer} />);
    expect(screen.getAllByText(/overdue tasks/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/due today/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/upcoming milestones/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/projects at risk/i).length).toBeGreaterThan(0);
  });

  it("renders the projects to watch section with project names", () => {
    render(<DashboardView data={mockDashboard} customer={customer} />);
    expect(screen.getByText("Projects to watch")).toBeInTheDocument();
    expect(
      screen.getAllByText("Naval retrofit dashboard").length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("Kernel telemetry").length).toBeGreaterThan(0);
  });

  it("renders the recent activity timeline with humanized events", () => {
    render(<DashboardView data={mockDashboard} customer={customer} />);
    expect(screen.getAllByText(/recent activity/i).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/task completed: set up the project repository/i),
    ).toBeInTheDocument();
  });

  it("renders empty states when there are no priority items", () => {
    const empty = {
      ...mockDashboard,
      priorities: {
        overdue_tasks: [],
        due_today_tasks: [],
        upcoming_milestones: [],
        at_risk_projects: [],
      },
    };
    render(<DashboardView data={empty} customer={customer} />);
    expect(screen.getByText(/nothing overdue/i)).toBeInTheDocument();
    expect(screen.getByText(/clear for today/i)).toBeInTheDocument();
    expect(
      screen.getByText(/no milestones in the next 7 days/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/no project flagged/i)).toBeInTheDocument();
  });
});
