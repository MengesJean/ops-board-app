import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "next-themes";
import { describe, expect, it } from "vitest";

import { ThemeToggle } from "@/components/theme/theme-toggle";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      {children}
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  it("renders a toggle button", () => {
    render(<ThemeToggle />, { wrapper: Wrapper });
    expect(
      screen.getByRole("button", { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it("opens the menu and exposes theme options", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />, { wrapper: Wrapper });
    await user.click(screen.getByRole("button", { name: /toggle theme/i }));
    expect(await screen.findByText(/light/i)).toBeInTheDocument();
    expect(screen.getByText(/dark/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
  });
});
