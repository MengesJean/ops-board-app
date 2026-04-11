import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ProjectTasksSection } from "@/components/projects/tasks/project-tasks-section";
import { mockMilestones } from "@/test/mocks/fixtures/milestones";
import { mockTasks } from "@/test/mocks/fixtures/tasks";

function renderSection(
  overrides: Partial<{
    projectId: number;
    initialTasks: typeof mockTasks;
    milestones: typeof mockMilestones;
  }> = {},
) {
  return render(
    <ProjectTasksSection
      projectId={overrides.projectId ?? 101}
      milestones={overrides.milestones ?? mockMilestones}
      initialTasks={overrides.initialTasks ?? mockTasks}
    />,
  );
}

describe("ProjectTasksSection", () => {
  it("renders the section header with the task count", () => {
    renderSection();
    expect(
      screen.getByRole("heading", { name: /^tasks$/i, level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/4 tasks on this project/i)).toBeInTheDocument();
  });

  it("shows the progress summary derived from the initial tasks", () => {
    renderSection();
    // mockTasks: 1 done, 1 in_progress, 2 todo → 4 total
    expect(screen.getByText(/1\/4 done/i)).toBeInTheDocument();
  });

  it("renders tasks in position order", () => {
    renderSection();
    const titles = screen
      .getAllByRole("heading", { level: 4 })
      .map((el) => el.textContent);
    expect(titles).toEqual([
      "Draft the technical brief",
      "Review wireframes with stakeholders",
      "Set up the project repository",
      "Schedule client UAT kickoff",
    ]);
  });

  it("shows the empty state when no tasks exist", () => {
    renderSection({ projectId: 999, initialTasks: [] });
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /add the first task/i }),
    ).toBeInTheDocument();
  });

  it("opens the create sheet when the Add button is clicked", async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole("button", { name: /add task/i }));
    expect(
      await screen.findByRole("form", { name: /create task/i }),
    ).toBeInTheDocument();
  });

  it("creates a task and adds it to the list", async () => {
    const user = userEvent.setup();
    renderSection();
    await user.click(screen.getByRole("button", { name: /add task/i }));
    await user.type(
      await screen.findByLabelText(/^title\s*\*?$/i),
      "Beta launch checklist",
    );
    await user.click(screen.getByRole("button", { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByText("Beta launch checklist")).toBeInTheDocument();
    });
    expect(screen.getByText(/5 tasks on this project/i)).toBeInTheDocument();
  });

  it("filters tasks by status when a filter chip is clicked", async () => {
    const user = userEvent.setup();
    renderSection();
    const group = screen.getByRole("group", { name: /filter by status/i });
    await user.click(within(group).getByRole("button", { name: /^done$/i }));
    await waitFor(() => {
      const titles = screen
        .getAllByRole("heading", { level: 4 })
        .map((el) => el.textContent);
      expect(titles).toEqual(["Set up the project repository"]);
    });
  });

  it("shows a filtered empty state when the search yields nothing", async () => {
    const user = userEvent.setup();
    renderSection();
    const search = screen.getByLabelText(/search tasks/i);
    await user.type(search, "zzzzzzznonexistent");
    expect(
      await screen.findByText(/no tasks match these filters/i),
    ).toBeInTheDocument();
  });
});
