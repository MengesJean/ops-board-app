import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { mockCustomer } from "@/test/mocks/handlers";
import type { Customer } from "@/types/api";

function wrapper({ children }: { children: React.ReactNode }) {
  return <AuthProvider initialUser={null}>{children}</AuthProvider>;
}

describe("useAuth", () => {
  it("starts with the provided initial user", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider initialUser={mockCustomer}>{children}</AuthProvider>
      ),
    });
    expect(result.current.user).toEqual(mockCustomer);
  });

  it("updates user after successful login", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login({
        email: "ada@example.com",
        password: "correct-password",
      });
    });
    await waitFor(() =>
      expect(result.current.user?.email).toBe(mockCustomer.email),
    );
  });

  it("syncs user when initialUser prop changes", () => {
    const state: { current: Customer | null } = { current: null };
    const SyncWrapper = ({ children }: { children: ReactNode }) => (
      <AuthProvider initialUser={state.current}>{children}</AuthProvider>
    );
    const { result, rerender } = renderHook(() => useAuth(), {
      wrapper: SyncWrapper,
    });
    expect(result.current.user).toBeNull();
    state.current = mockCustomer;
    rerender();
    expect(result.current.user).toEqual(mockCustomer);
  });

  it("clears user after logout", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <AuthProvider initialUser={mockCustomer}>{children}</AuthProvider>
      ),
    });
    await act(async () => {
      await result.current.logout();
    });
    await waitFor(() => expect(result.current.user).toBeNull());
  });
});
