import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { RegisterForm } from "@/components/auth/register-form";
import { renderWithAuth } from "@/test/utils/render";

describe("RegisterForm", () => {
  it("renders all fields", () => {
    renderWithAuth(<RegisterForm />);
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderWithAuth(<RegisterForm />);
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it("enforces matching password confirmation", async () => {
    const user = userEvent.setup();
    renderWithAuth(<RegisterForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/^email$/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "supersecret1");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "different-pass",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(
      await screen.findByText(/passwords do not match/i),
    ).toBeInTheDocument();
  });

  it("maps backend 422 onto the email field", async () => {
    const user = userEvent.setup();
    renderWithAuth(<RegisterForm />);
    await user.type(screen.getByLabelText(/^name$/i), "Taken User");
    await user.type(screen.getByLabelText(/^email$/i), "taken@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "supersecret1");
    await user.type(
      screen.getByLabelText(/confirm password/i),
      "supersecret1",
    );
    await user.click(screen.getByRole("button", { name: /create account/i }));
    expect(
      await screen.findAllByText(/email has already been taken/i),
    ).not.toHaveLength(0);
  });
});
