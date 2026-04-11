import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MilestoneForm } from "@/components/projects/milestones/milestone-form";
import { mockMilestones } from "@/test/mocks/fixtures/milestones";

describe("MilestoneForm (create mode)", () => {
  it("renders all fields and the Create button", () => {
    render(<MilestoneForm projectId={101} onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/^title\s*\*?$/i)).toHaveValue("");
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create milestone/i }),
    ).toBeEnabled();
  });

  it("shows a zod error when the title is missing", async () => {
    const user = userEvent.setup();
    render(<MilestoneForm projectId={101} onSuccess={vi.fn()} />);
    await user.click(
      screen.getByRole("button", { name: /create milestone/i }),
    );
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
  });

  it("submits successfully and calls onSuccess with the created milestone", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<MilestoneForm projectId={101} onSuccess={onSuccess} />);
    await user.type(
      screen.getByLabelText(/^title\s*\*?$/i),
      "Public release",
    );
    await user.click(
      screen.getByRole("button", { name: /create milestone/i }),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const created = onSuccess.mock.calls[0][0];
    expect(created.title).toBe("Public release");
    expect(created.project_id).toBe(101);
    expect(created.position).toBeGreaterThan(0);
  });
});

describe("MilestoneForm (edit mode)", () => {
  it("pre-fills fields from initialMilestone", () => {
    render(
      <MilestoneForm
        projectId={101}
        initialMilestone={mockMilestones[1]}
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/^title\s*\*?$/i)).toHaveValue(
      mockMilestones[1].title,
    );
    expect(screen.getByLabelText(/description/i)).toHaveValue(
      mockMilestones[1].description ?? "",
    );
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeEnabled();
  });

  it("submits the update and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <MilestoneForm
        projectId={101}
        initialMilestone={mockMilestones[1]}
        onSuccess={onSuccess}
      />,
    );
    const titleInput = screen.getByLabelText(/^title\s*\*?$/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Design polished");
    await user.click(
      screen.getByRole("button", { name: /save changes/i }),
    );
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const updated = onSuccess.mock.calls[0][0];
    expect(updated.id).toBe(mockMilestones[1].id);
    expect(updated.title).toBe("Design polished");
  });
});
