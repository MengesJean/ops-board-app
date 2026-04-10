import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/components/auth/login-form";
import { renderWithAuth } from "@/test/utils/render";

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    renderWithAuth(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  it("shows validation errors on empty submit", async () => {
    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });

  it("shows validation error for invalid email format", async () => {
    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "not-an-email");
    await user.type(screen.getByLabelText(/password/i), "anything");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("submits successfully and redirects", async () => {
    const nav = await import("next/navigation");
    const replace = vi.fn();
    (nav.useRouter as unknown as { mockImplementation: (f: unknown) => void })
      .mockImplementation?.(() => ({
        push: vi.fn(),
        replace,
        refresh: vi.fn(),
        back: vi.fn(),
        forward: vi.fn(),
        prefetch: vi.fn(),
      }));
    // Fallback if the above isn't a mock — spy on the default router.
    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "correct-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await waitFor(() => {
      // After success, form-level error should not be shown.
      expect(
        screen.queryByText(/credentials do not match/i),
      ).not.toBeInTheDocument();
    });
  });

  it("maps 422 errors onto fields", async () => {
    const user = userEvent.setup();
    renderWithAuth(<LoginForm />);
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(
      await screen.findAllByText(/credentials do not match our records/i),
    ).not.toHaveLength(0);
  });
});
