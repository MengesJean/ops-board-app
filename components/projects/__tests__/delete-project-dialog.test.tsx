import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog";
import { mockProjects } from "@/test/mocks/fixtures/projects";

describe("DeleteProjectDialog", () => {
  it("does not render when project is null", () => {
    render(
      <DeleteProjectDialog
        project={null}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("displays the project name in the message", () => {
    render(
      <DeleteProjectDialog
        project={mockProjects[0]}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.getByText(/delete this project/i)).toBeInTheDocument();
    expect(screen.getByText("Naval retrofit dashboard")).toBeInTheDocument();
  });

  it("calls onDeleted after successful delete", async () => {
    const onDeleted = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteProjectDialog
        project={mockProjects[0]}
        onOpenChange={vi.fn()}
        onDeleted={onDeleted}
      />,
    );
    await user.click(screen.getByRole("button", { name: /delete project/i }));
    await waitFor(() =>
      expect(onDeleted).toHaveBeenCalledWith(mockProjects[0]),
    );
  });

  it("invokes onOpenChange(false) when Cancel is clicked", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteProjectDialog
        project={mockProjects[0]}
        onOpenChange={onOpenChange}
        onDeleted={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
