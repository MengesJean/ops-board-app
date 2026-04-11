import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ProjectsToolbar } from "@/components/projects/projects-toolbar";

const replaceMock = vi.fn();

vi.mock("next/navigation", async () => {
  return {
    useRouter: () => ({
      push: vi.fn(),
      replace: replaceMock,
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    }),
    usePathname: () => "/projects",
    useSearchParams: () => new URLSearchParams(""),
  };
});

beforeEach(() => {
  replaceMock.mockClear();
});

describe("ProjectsToolbar", () => {
  it("renders a link to the new project page", () => {
    render(
      <ProjectsToolbar
        search=""
        status={null}
        priority={null}
        health={null}
      />,
    );
    // Base UI Button keeps role="button" even when rendered as <a>; we just
    // verify the href is wired up to the create page.
    expect(
      screen.getByRole("button", { name: /new project/i }),
    ).toHaveAttribute("href", "/projects/new");
  });

  it("pushes the URL with a debounced search query", async () => {
    const user = userEvent.setup();
    render(
      <ProjectsToolbar
        search=""
        status={null}
        priority={null}
        health={null}
      />,
    );
    await user.type(screen.getByLabelText(/search projects/i), "naval");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled();
      const lastCall = replaceMock.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).toContain("search=naval");
    });
  });
});
