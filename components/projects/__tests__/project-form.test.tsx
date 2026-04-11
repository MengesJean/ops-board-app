import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ProjectForm } from "@/components/projects/project-form";
import { mockClients } from "@/test/mocks/fixtures/clients";
import { mockProjects } from "@/test/mocks/fixtures/projects";

describe("ProjectForm (create mode)", () => {
  it("renders all fields and a Create button", () => {
    render(
      <ProjectForm clients={mockClients} onSuccess={vi.fn()} />,
    );
    expect(screen.getByLabelText(/^name\s*\*?$/i)).toHaveValue("");
    expect(screen.getByLabelText(/reference/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/budget/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create project/i }),
    ).toBeEnabled();
  });

  it("shows zod errors when required fields are empty on submit", async () => {
    const user = userEvent.setup();
    render(<ProjectForm clients={mockClients} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/client is required/i)).toBeInTheDocument();
  });

  it("rejects a due date that is before the start date", async () => {
    const user = userEvent.setup();
    render(<ProjectForm clients={mockClients} onSuccess={vi.fn()} />);
    await user.type(screen.getByLabelText(/^name\s*\*?$/i), "My project");
    // selecting via the keyboard is unreliable on the headless Select; we
    // mainly want to verify the date validation, so set them directly.
    const start = screen.getByLabelText(/start date/i) as HTMLInputElement;
    const due = screen.getByLabelText(/due date/i) as HTMLInputElement;
    await user.type(start, "2026-05-10");
    await user.type(due, "2026-05-01");
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(
      await screen.findByText(/due date must be on or after the start date/i),
    ).toBeInTheDocument();
  });

  it("submits successfully and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(<ProjectForm clients={mockClients} onSuccess={onSuccess} />);
    // Pick the first client via the trigger
    await user.click(screen.getByLabelText(/client/i));
    await user.click(
      await screen.findByRole("option", {
        name: mockClients[0].company_name as string,
      }),
    );
    await user.type(
      screen.getByLabelText(/^name\s*\*?$/i),
      "Greenfield project",
    );
    await user.click(screen.getByRole("button", { name: /create project/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const created = onSuccess.mock.calls[0][0];
    expect(created.name).toBe("Greenfield project");
    expect(created.client_id).toBe(mockClients[0].id);
  });

  it("maps 422 backend errors onto fields", async () => {
    const user = userEvent.setup();
    render(<ProjectForm clients={mockClients} onSuccess={vi.fn()} />);
    await user.click(screen.getByLabelText(/client/i));
    await user.click(
      await screen.findByRole("option", {
        name: mockClients[0].company_name as string,
      }),
    );
    await user.type(screen.getByLabelText(/^name\s*\*?$/i), "Conflict");
    await user.click(screen.getByRole("button", { name: /create project/i }));
    expect(
      await screen.findByText(/name has already been taken/i),
    ).toBeInTheDocument();
  });
});

describe("ProjectForm (edit mode)", () => {
  it("pre-fills fields from initialProject", () => {
    render(
      <ProjectForm
        clients={mockClients}
        initialProject={mockProjects[0]}
        onSuccess={vi.fn()}
      />,
    );
    expect(screen.getByLabelText(/^name\s*\*?$/i)).toHaveValue(
      mockProjects[0].name,
    );
    expect(screen.getByLabelText(/reference/i)).toHaveValue(
      mockProjects[0].reference ?? "",
    );
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeEnabled();
  });

  it("submits updates and calls onSuccess", async () => {
    const onSuccess = vi.fn();
    const user = userEvent.setup();
    render(
      <ProjectForm
        clients={mockClients}
        initialProject={mockProjects[0]}
        onSuccess={onSuccess}
      />,
    );
    const nameInput = screen.getByLabelText(/^name\s*\*?$/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Renamed project");
    await user.click(screen.getByRole("button", { name: /save changes/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    const updated = onSuccess.mock.calls[0][0];
    expect(updated.id).toBe(mockProjects[0].id);
    expect(updated.name).toBe("Renamed project");
  });
});
