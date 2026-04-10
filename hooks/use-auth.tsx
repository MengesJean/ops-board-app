"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  loginCustomer,
  logoutCustomer,
  registerCustomer,
} from "@/lib/api/auth";
import type { Customer, LoginPayload, RegisterPayload } from "@/types/api";

type AuthContextValue = {
  user: Customer | null;
  login: (payload: LoginPayload) => Promise<Customer>;
  register: (payload: RegisterPayload) => Promise<Customer>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type AuthProviderProps = {
  initialUser: Customer | null;
  children: ReactNode;
};

export function AuthProvider({ initialUser, children }: AuthProviderProps) {
  const router = useRouter();
  const [user, setUser] = useState<Customer | null>(initialUser);

  // Keep the client state in sync with the server-resolved user after every
  // RSC refresh (login/logout mutations, cookie expiry, external navigation).
  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const res = await loginCustomer(payload);
      setUser(res.data);
      router.refresh();
      return res.data;
    },
    [router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const res = await registerCustomer(payload);
      setUser(res.data);
      router.refresh();
      return res.data;
    },
    [router],
  );

  const logout = useCallback(async () => {
    await logoutCustomer();
    setUser(null);
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
