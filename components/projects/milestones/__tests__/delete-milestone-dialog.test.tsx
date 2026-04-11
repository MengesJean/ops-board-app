import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteMilestoneDialog } from "@/components/projects/milestones/delete-milestone-dialog";
import { mockMilestones } from "@/test/mocks/fixtures/milestones";

describe("DeleteMilestoneDialog", () => {
  it("does not render when milestone is null", () => {
    render(
      <DeleteMilestoneDialog
        projectId={101}
        milestone={null}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("displays the milestone title in the message", () => {
    render(
      <DeleteMilestoneDialog
        projectId={101}
        milestone={mockMilestones[0]}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.getByText(/delete this milestone/i)).toBeInTheDocument();
    expect(screen.getByText(mockMilestones[0].title)).toBeInTheDocument();
  });

  it("calls onDeleted after successful delete", async () => {
    const onDeleted = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteMilestoneDialog
        projectId={101}
        milestone={mockMilestones[0]}
        onOpenChange={vi.fn()}
        onDeleted={onDeleted}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: /delete milestone/i }),
    );
    await waitFor(() =>
      expect(onDeleted).toHaveBeenCalledWith(mockMilestones[0]),
    );
  });

  it("invokes onOpenChange(false) when Cancel is clicked", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteMilestoneDialog
        projectId={101}
        milestone={mockMilestones[0]}
        onOpenChange={onOpenChange}
        onDeleted={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
