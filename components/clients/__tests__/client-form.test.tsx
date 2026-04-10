import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ClientForm } from "@/components/clients/client-form";
import { mockClients } from "@/test/mocks/fixtures/clients";

describe("ClientForm (create mode)", () => {
  it("renders empty fields and a Create button", () => {
    render(<ClientForm onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/^name$/i)).toHaveValue("");
    expect(screen.getByLabelText(/^email$/i)).toHaveValue("");
    expect(
      screen.getByRole("button", { name: /create client/i }),
    ).toBeEnabled();
  });

  it("shows a Zod error when Name is empty on submit", async () => {
    const user = userEvent.setup();
    render(<ClientForm onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /create client/i }));
    expect(
      await screen.findByText(/name is required/i),
    ).toBeInTheDocument();
  });

  it("submits successfully and calls onSuccess with the created client", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<ClientForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText(/^name$/i), "Brand New Client");
    await user.type(screen.getByLabelText(/^email$/i), "brand@example.com");
    await user.click(screen.getByRole("button", { name: /create client/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const created = onSuccess.mock.calls[0][0];
    expect(created.name).toBe("Brand New Client");
    expect(created.email).toBe("brand@example.com");
  });

  it("maps 422 backend errors onto fields", async () => {
    const user = userEvent.setup();
    render(<ClientForm onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText(/^name$/i), "Duplicate");
    await user.type(screen.getByLabelText(/^email$/i), "taken@example.com");
    await user.click(screen.getByRole("button", { name: /create client/i }));
    expect(
      await screen.findByText(/email has already been taken/i),
    ).toBeInTheDocument();
  });
});

describe("ClientForm (edit mode)", () => {
  it("pre-fills fields from initialClient", () => {
    render(<ClientForm initialClient={mockClients[0]} onSuccess={vi.fn()} />);
    expect(screen.getByLabelText(/^name$/i)).toHaveValue(mockClients[0].name);
    expect(screen.getByLabelText(/^email$/i)).toHaveValue(
      mockClients[0].email ?? "",
    );
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeEnabled();
  });

  it("submits updates and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <ClientForm initialClient={mockClients[0]} onSuccess={onSuccess} />,
    );
    const nameInput = screen.getByLabelText(/^name$/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Grace Hopper Jr.");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const updated = onSuccess.mock.calls[0][0];
    expect(updated.id).toBe(mockClients[0].id);
    expect(updated.name).toBe("Grace Hopper Jr.");
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const onCancel = vi.fn();
    const user = userEvent.setup();
    render(
      <ClientForm
        initialClient={mockClients[0]}
        onSuccess={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });
});
