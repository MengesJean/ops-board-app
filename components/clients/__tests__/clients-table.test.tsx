import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientsTable } from "@/components/clients/clients-table";
import { mockClients } from "@/test/mocks/fixtures/clients";

describe("ClientsTable", () => {
  it("renders one row per client with core fields", () => {
    render(
      <ClientsTable
        clients={mockClients}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const rows = screen.getAllByRole("row");
    // +1 for the header row
    expect(rows).toHaveLength(mockClients.length + 1);
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("Linus Torvalds")).toBeInTheDocument();
    expect(screen.getByText("Margaret Hamilton")).toBeInTheDocument();
  });

  it("renders a status badge for each row", () => {
    render(
      <ClientsTable
        clients={mockClients}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    const badges = document.querySelectorAll(
      "[data-slot=client-status-badge]",
    );
    expect(badges).toHaveLength(mockClients.length);
    expect(badges[0].getAttribute("data-status")).toBe("active");
  });

  it("shows '—' for nullable fields", () => {
    render(
      <ClientsTable
        clients={[mockClients[1]]}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    // Linus has no phone
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("invokes onEdit when the Edit action is clicked", async () => {
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(
      <ClientsTable
        clients={[mockClients[0]]}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />,
    );
    const row = screen.getByText("Grace Hopper").closest("tr");
    expect(row).not.toBeNull();
    const actionsButton = within(row as HTMLElement).getByRole("button", {
      name: /actions for grace hopper/i,
    });
    await user.click(actionsButton);
    const editItem = await screen.findByRole("menuitem", { name: /edit/i });
    await user.click(editItem);
    expect(onEdit).toHaveBeenCalledWith(mockClients[0]);
  });

  it("invokes onDelete when the Delete action is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <ClientsTable
        clients={[mockClients[0]]}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );
    const row = screen.getByText("Grace Hopper").closest("tr") as HTMLElement;
    await user.click(
      within(row).getByRole("button", { name: /actions for grace hopper/i }),
    );
    await user.click(
      await screen.findByRole("menuitem", { name: /delete/i }),
    );
    expect(onDelete).toHaveBeenCalledWith(mockClients[0]);
  });
});
