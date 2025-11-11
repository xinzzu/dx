// useAuth.ts

"use client";

import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider } from "@/services/firebase";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
  getRedirectResult,
  type UserCredential,
} from "firebase/auth";
import { authService } from "@/services/auth";
import { useOnboarding } from "@/stores/onboarding";
import { useAssetWizard } from "@/stores/assetWizard";
import { userService } from "@/services/user";
import { useUsage } from "@/stores/catat/usage";

type IDBFactoryWithDatabases = IDBFactory & {
  databases?: () => Promise<Array<{ name?: string }>>;
};

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

async function processLoginSuccess(cred: UserCredential, backendAccessToken?: string) {
  const token = backendAccessToken || await cred.user.getIdToken(true);

  if (!token) {
    throw new Error("Firebase ID Token not available after successful login.");
  }

  const finalBackendAccessToken = await authService.loginWithGoogle(token);
  authService.saveToken(finalBackendAccessToken);

  useOnboarding.getState().resetOnboarding();
  useAssetWizard.getState().reset();
  useOnboarding.getState().markActivated();

  try {
    const profile = await userService.getMe(finalBackendAccessToken);

    if (profile.is_profile_complete) {
      useOnboarding.getState().markProfileCompleted();
    }

    if (profile.is_asset_buildings_completed) {
      useOnboarding.getState().markAssetsBuildingsCompleted();
    }

    if (profile.is_asset_vehicles_completed) {
      useOnboarding.getState().markAssetsVehiclesCompleted();
    }

    if (profile.is_asset_buildings_completed && profile.is_asset_vehicles_completed) {
      useOnboarding.getState().markAssetsCompleted();
    }

  } catch (e: unknown) {
    console.warn("Failed to sync profile after login. User will start onboarding locally.", getErrorMessage(e));
  }
}

type UseAuthReturn = {
  currentUser: User | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

export default function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirectResult = async () => {
      if (typeof window === "undefined") return;

      try {
        setLoading(true);
        const result = await getRedirectResult(auth);

        if (result?.user) {
          await processLoginSuccess(result);
        }
      } catch (error: unknown) {
        console.error("Redirect result error:", getErrorMessage(error));
        authService.removeToken();
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };

    void handleRedirectResult();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const googleLogin = useCallback(async () => {
    setLoading(true);
    try {
      if (typeof window === "undefined") return;
      sessionStorage.setItem("login_via", "google");

      const cred = await signInWithPopup(auth, googleProvider);

      await processLoginSuccess(cred);

    } catch (error: unknown) {
      const msg = getErrorMessage(error);

      if (msg.includes("popup-closed-by-user") || msg.includes("cancelled-popup-request")) {
        console.log("Login popup closed by user, login dibatalkan.");
        setLoading(false);
        return;
      }

      console.warn("Popup failed or blocked, attempting Redirect fallback. Error:", msg);

      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (e: unknown) {
        console.error("Fallback redirect failed:", getErrorMessage(e));
        authService.removeToken();
        setCurrentUser(null);
      }

    } finally {
      if (currentUser === null) {
        setLoading(false);
      }
    }
  }, [currentUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      try {
        await signOut(auth);
      } catch {
        /* ignore */
      }
      authService.removeToken();

      useOnboarding.getState().resetOnboarding();
      useAssetWizard.getState().reset();
      try {
        const state = (useUsage as unknown as { getState: () => { reset?: () => void } }).getState();
        state.reset?.();
      } catch {
        /* ignore missing reset */
      }

      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch { /* ignore */ }

        try {
          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((k) => caches.delete(k)));
          }
        } catch (e: unknown) { console.warn("Clear caches failed:", getErrorMessage(e)); }

        try {
          if ("serviceWorker" in navigator) {
            const regs = await navigator.serviceWorker.getRegistrations();
            await Promise.all(regs.map((r) => r.unregister()));
          }
        } catch (e: unknown) { console.warn("Unregister SW failed:", getErrorMessage(e)); }

        try {
          const idb = indexedDB as IDBFactoryWithDatabases;
          if (typeof idb.databases === "function") {
            const dbs = await idb.databases();
            await Promise.all(
              dbs.map(
                (db) =>
                  new Promise<void>((resolve) => {
                    if (!db?.name) return resolve();
                    const req = indexedDB.deleteDatabase(db.name);
                    req.onsuccess = () => resolve();
                    req.onerror = () => resolve();
                    req.onblocked = () => resolve();
                  }),
              ),
            );
          }
        } catch (e: unknown) { console.warn("IndexedDB wipe skipped:", getErrorMessage(e)); }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    // Prefer the canonical token stored by authService.saveToken()
    const backendToken = authService.getToken();
    if (backendToken) return backendToken;

    // Fallback: some flows (older code paths) may have saved the token under
    // a different key (e.g. 'backend_token') — check those as a fallback so
    // callers that rely on getIdToken() (profile save, area lookups) still
    // receive a usable token.
    if (typeof window !== "undefined") {
      const fallback = localStorage.getItem("backend_token") || localStorage.getItem("access_token");
      if (fallback) return fallback;
    }

    return null;
  }, []);

  return { currentUser, loading, googleLogin, logout, getIdToken };
}