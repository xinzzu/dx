// src/hooks/useAuthedFetch.ts
"use client";

import { useCallback } from "react";
import { getFirebaseIdToken } from "@/services/firebase";

type JsonBody = Record<string, unknown> | unknown[];

/**
 * Pakai seperti fetch biasa, tapi otomatis inject Authorization Bearer kalau ada token.
 * - `json` akan di-JSON.stringify dan diset header Content-Type.
 */
export function useAuthedFetch() {
  const withAuth = useCallback(
    async (
      input: RequestInfo | URL,
      init: RequestInit & { json?: JsonBody } = {}
    ) => {
      // 1) Coba ambil dari Firebase
      let token = await getFirebaseIdToken();

      // 2) Fallback: token lokal (ubah key kalau project-mu beda)
      if (!token && typeof window !== "undefined") {
        token = localStorage.getItem("access_token");
      }

      const headers = new Headers(init.headers as HeadersInit | undefined);

      if (init.json !== undefined) {
        headers.set("Content-Type", "application/json");
      }
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      const body =
        init.json !== undefined ? JSON.stringify(init.json) : init.body;

      return fetch(input, { ...init, headers, body });
    },
    []
  );

  return withAuth;
}
