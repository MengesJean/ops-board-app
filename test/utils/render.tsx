import { render as rtlRender, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

import { AuthProvider } from "@/hooks/use-auth";
import type { Customer } from "@/types/api";

type Options = Omit<RenderOptions, "wrapper"> & {
  initialUser?: Customer | null;
};

export function renderWithAuth(ui: ReactElement, options: Options = {}) {
  const { initialUser = null, ...rest } = options;
  function Wrapper({ children }: { children: ReactNode }) {
    return <AuthProvider initialUser={initialUser}>{children}</AuthProvider>;
  }
  return rtlRender(ui, { wrapper: Wrapper, ...rest });
}
