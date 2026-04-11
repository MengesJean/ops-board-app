import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ClientsToolbar } from "@/components/clients/clients-toolbar";

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
    usePathname: () => "/clients",
    useSearchParams: () => new URLSearchParams(""),
  };
});

beforeEach(() => {
  replaceMock.mockClear();
});

describe("ClientsToolbar", () => {
  it("invokes onAdd when the Add button is clicked", async () => {
    const onAdd = vi.fn();
    const user = userEvent.setup();
    render(<ClientsToolbar search="" status={null} onAdd={onAdd} />);
    await user.click(screen.getByRole("button", { name: /add client/i }));
    expect(onAdd).toHaveBeenCalled();
  });

  it("pushes the URL with a debounced search query", async () => {
    const user = userEvent.setup();
    render(<ClientsToolbar search="" status={null} onAdd={vi.fn()} />);
    await user.type(screen.getByLabelText(/search clients/i), "grace");
    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalled();
      const lastCall = replaceMock.mock.calls.at(-1)?.[0] as string;
      expect(lastCall).toContain("search=grace");
    });
  });
});
