import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TaskForm } from "@/components/projects/tasks/task-form";
import { mockMilestones } from "@/test/mocks/fixtures/milestones";
import { mockTasks } from "@/test/mocks/fixtures/tasks";

describe("TaskForm (create mode)", () => {
  it("renders all fields and the Create button", () => {
    render(
      <TaskForm
        projectId={101}
        milestones={mockMilestones}
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/^title\s*\*?$/i)).toHaveValue("");
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create task/i }),
    ).toBeEnabled();
  });

  it("shows a zod error when the title is missing", async () => {
    const user = userEvent.setup();
    render(
      <TaskForm
        projectId={101}
        milestones={mockMilestones}
        onSuccess={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /create task/i }));
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });

  it("submits successfully and calls onSuccess with the created task", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskForm
        projectId={101}
        milestones={mockMilestones}
        onSuccess={onSuccess}
      />,
    );
    await user.type(
      screen.getByLabelText(/^title\s*\*?$/i),
      "Schedule sync",
    );
    await user.click(screen.getByRole("button", { name: /create task/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const created = onSuccess.mock.calls[0][0];
    expect(created.title).toBe("Schedule sync");
    expect(created.project_id).toBe(101);
    expect(created.position).toBeGreaterThan(0);
    expect(created.status).toBe("todo");
    expect(created.priority).toBe("medium");
  });
});

describe("TaskForm (edit mode)", () => {
  it("pre-fills fields from initialTask", () => {
    const target = mockTasks[0];
    render(
      <TaskForm
        projectId={101}
        milestones={mockMilestones}
        initialTask={target}
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/^title\s*\*?$/i)).toHaveValue(target.title);
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      target.description ?? "",
    );
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeEnabled();
  });

  it("submits the update and calls onSuccess", async () => {
    const target = mockTasks[1];
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <TaskForm
        projectId={101}
        milestones={mockMilestones}
        initialTask={target}
        onSuccess={onSuccess}
      />,
    );
    const titleInput = screen.getByLabelText(/^title\s*\*?$/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Wireframes refined");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const updated = onSuccess.mock.calls[0][0];
    expect(updated.id).toBe(target.id);
    expect(updated.title).toBe("Wireframes refined");
  });
});
