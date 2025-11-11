"use client";

import { createContext, useContext } from "react";
import type { CategoryConfig } from "@/lib/catatConfig";

type UserType = "individu" | "lembaga";

export type CatatContextValue = {
  userType: UserType;
  categories: CategoryConfig[];
};

export const CatatContext = createContext<CatatContextValue | null>(null);

export function useCatatContext() {
  const ctx = useContext(CatatContext);
  if (!ctx) {
    throw new Error("useCatatContext must be used within CatatContext.Provider");
  }
  return ctx;
}
