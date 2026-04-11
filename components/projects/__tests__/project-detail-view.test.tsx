import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProjectDetailView } from "@/components/projects/project-detail-view";
import { mockProjects } from "@/test/mocks/fixtures/projects";

describe("ProjectDetailView", () => {
  it("renders the project name, reference, and client", () => {
    render(<ProjectDetailView project={mockProjects[0]} />);
    expect(
      screen.getByRole("heading", { name: "Naval retrofit dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("PRJ-2026-001")).toBeInTheDocument();
    // The client name appears in both the header and the overview card.
    expect(screen.getAllByText("Naval Mechanics Ltd.").length).toBeGreaterThan(
      0,
    );
  });

  it("renders status, priority and health indicators in the header", () => {
    render(<ProjectDetailView project={mockProjects[0]} />);
    expect(
      document.querySelectorAll("[data-slot=project-status-badge]").length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll("[data-slot=project-priority-badge]").length,
    ).toBeGreaterThan(0);
    expect(
      document.querySelectorAll("[data-slot=project-health-indicator]")
        .length,
    ).toBeGreaterThan(0);
  });

  it("renders description and notes when present", () => {
    render(<ProjectDetailView project={mockProjects[0]} />);
    expect(
      screen.getByText("Operational dashboard for the retrofit program."),
    ).toBeInTheDocument();
    expect(screen.getByText("Kickoff completed.")).toBeInTheDocument();
  });

  it("formats the budget", () => {
    render(<ProjectDetailView project={mockProjects[0]} />);
    // 45000.00 EUR formatted in fr-FR uses non-breaking spaces, so just match
    // the digits + currency symbol partially.
    const card = screen
      .getByText("Budget")
      .closest("[data-slot=card]") as HTMLElement | null;
    expect(card).not.toBeNull();
    expect(card!.textContent).toMatch(/45[\s\u00a0\u202f]?000/);
  });

  it("shows the overdue alert for an overdue, non-terminal project", () => {
    render(<ProjectDetailView project={mockProjects[2]} />);
    expect(
      screen.getByText(/past its due date/i),
    ).toBeInTheDocument();
  });

  it("hides the overdue alert when status is terminal", () => {
    const completed = {
      ...mockProjects[2],
      status: "completed" as const,
    };
    render(<ProjectDetailView project={completed} />);
    expect(screen.queryByText(/past its due date/i)).not.toBeInTheDocument();
  });
});
