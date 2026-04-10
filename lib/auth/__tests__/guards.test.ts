import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

const getCurrentCustomerMock = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getCurrentCustomer: () => getCurrentCustomerMock(),
}));

const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});
vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

import { requireAuth, requireGuest } from "@/lib/auth/guards";
import { mockCustomer } from "@/test/mocks/handlers";

describe("requireAuth", () => {
  beforeEach(() => {
    getCurrentCustomerMock.mockReset();
    redirectMock.mockClear();
  });

  it("returns the user when authenticated", async () => {
    getCurrentCustomerMock.mockResolvedValue(mockCustomer);
    await expect(requireAuth()).resolves.toEqual(mockCustomer);
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when unauthenticated", async () => {
    getCurrentCustomerMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow(/REDIRECT:\/login/);
    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});

describe("requireGuest", () => {
  beforeEach(() => {
    getCurrentCustomerMock.mockReset();
    redirectMock.mockClear();
  });

  it("allows through when no user", async () => {
    getCurrentCustomerMock.mockResolvedValue(null);
    await expect(requireGuest()).resolves.toBeUndefined();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects authenticated users to /dashboard", async () => {
    getCurrentCustomerMock.mockResolvedValue(mockCustomer);
    await expect(requireGuest()).rejects.toThrow(/REDIRECT:\/dashboard/);
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
