"use client";

import { createContext, useContext } from "react";
import type { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";

export type TravelShellContextValue = {
  user: GoogleUser | null;
  authLoading: boolean;
  openSignIn: (beforeRedirect?: () => void) => void;
  registerSearchAction: (action: () => void) => () => void;
};

export const TravelShellContext = createContext<TravelShellContextValue | null>(null);

export function useTravelShell() {
  const shell = useContext(TravelShellContext);
  if (!shell) throw new Error("useTravelShell requires TravelAppShell");
  return shell;
}
