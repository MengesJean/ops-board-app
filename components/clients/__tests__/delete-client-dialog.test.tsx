import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteClientDialog } from "@/components/clients/delete-client-dialog";
import { mockClients } from "@/test/mocks/fixtures/clients";

describe("DeleteClientDialog", () => {
  it("does not render when client is null", () => {
    render(
      <DeleteClientDialog
        client={null}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("displays the client name in the message", () => {
    render(
      <DeleteClientDialog
        client={mockClients[0]}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.getByText(/delete this client/i)).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  it("calls onDeleted after successful delete", async () => {
    const onDeleted = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteClientDialog
        client={mockClients[0]}
        onOpenChange={vi.fn()}
        onDeleted={onDeleted}
      />,
    );
    await user.click(screen.getByRole("button", { name: /delete client/i }));
    await waitFor(() =>
      expect(onDeleted).toHaveBeenCalledWith(mockClients[0]),
    );
  });

  it("invokes onOpenChange(false) when Cancel is clicked", async () => {
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DeleteClientDialog
        client={mockClients[0]}
        onOpenChange={onOpenChange}
        onDeleted={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
