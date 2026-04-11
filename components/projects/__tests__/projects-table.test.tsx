import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectsTable } from "@/components/projects/projects-table";
import { mockProjects } from "@/test/mocks/fixtures/projects";

describe("ProjectsTable", () => {
  it("renders one row per project with name, reference, and client", () => {
    render(<ProjectsTable projects={mockProjects} onDelete={vi.fn()} />);
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(mockProjects.length + 1);
    expect(screen.getByText("Naval retrofit dashboard")).toBeInTheDocument();
    expect(screen.getByText("PRJ-2026-001")).toBeInTheDocument();
    expect(screen.getByText("Naval Mechanics Ltd.")).toBeInTheDocument();
  });

  it("renders status, priority, and health indicators for each row", () => {
    render(<ProjectsTable projects={mockProjects} onDelete={vi.fn()} />);
    expect(
      document.querySelectorAll("[data-slot=project-status-badge]"),
    ).toHaveLength(mockProjects.length);
    expect(
      document.querySelectorAll("[data-slot=project-priority-badge]"),
    ).toHaveLength(mockProjects.length);
    expect(
      document.querySelectorAll("[data-slot=project-health-indicator]"),
    ).toHaveLength(mockProjects.length);
  });

  it("links each name to the project detail page", () => {
    render(<ProjectsTable projects={[mockProjects[0]]} onDelete={vi.fn()} />);
    const link = screen.getByRole("link", {
      name: "Naval retrofit dashboard",
    });
    expect(link).toHaveAttribute("href", "/projects/101");
  });

  it("invokes onDelete from the row actions menu", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <ProjectsTable projects={[mockProjects[0]]} onDelete={onDelete} />,
    );
    const row = screen
      .getByText("Naval retrofit dashboard")
      .closest("tr") as HTMLElement;
    await user.click(
      within(row).getByRole("button", {
        name: /actions for naval retrofit dashboard/i,
      }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: /delete/i }),
    );
    expect(onDelete).toHaveBeenCalledWith(mockProjects[0]);
  });
});
