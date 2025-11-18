"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORE_VERSION = 2;
const STORAGE_KEY = "onboarding-progress";

type State = {
  hydrated: boolean;
  activated: boolean;
  profileCompleted: boolean;
  onboardingCompleted: boolean;
  assetsBuildingsCompleted: boolean;
  assetsVehiclesCompleted: boolean;
  assetsCompleted: boolean;
  shortcutSeen: boolean;
};

type Actions = {
  setHydrated: () => void;
  markActivated: () => void;
  setActivated: (v: boolean) => void;
  markProfileCompleted: () => void;
  markOnboardingCompleted: () => void;
  markAssetsBuildingsCompleted: () => void;
  markAssetsVehiclesCompleted: () => void;
  markAssetsCompleted: () => void;
  markShortcutSeen: () => void;
  resetOnboarding: () => void;
  replayFirstShortcut: () => void;
  syncWithAuth: () => Promise<void>;
};

// ✅ FAST PATH: Baca langsung dari localStorage (synchronous!)
export function getOnboardingStateSync(): Partial<State> {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    const state = parsed?.state || {};

    return {
      activated: Boolean(state.activated),
      profileCompleted: Boolean(state.profileCompleted),
      onboardingCompleted: Boolean(state.onboardingCompleted),
      assetsBuildingsCompleted: Boolean(state.assetsBuildingsCompleted),
      assetsVehiclesCompleted: Boolean(state.assetsVehiclesCompleted),
      assetsCompleted: Boolean(state.assetsCompleted),
      shortcutSeen: Boolean(state.shortcutSeen),
    };
  } catch (error) {
    console.error("[Onboarding] Failed to read sync state:", error);
    return {};
  }
}

export const useOnboarding = create<State & Actions>()(
  persist(
    (set, get) => ({
      // ✅ Initialize dengan state dari localStorage (jika ada)
      ...(() => {
        const syncState = getOnboardingStateSync();
        return {
          hydrated: false,
          activated: syncState.activated ?? false,
          profileCompleted: syncState.profileCompleted ?? false,
          onboardingCompleted: syncState.onboardingCompleted ?? false,
          assetsBuildingsCompleted: syncState.assetsBuildingsCompleted ?? false,
          assetsVehiclesCompleted: syncState.assetsVehiclesCompleted ?? false,
          assetsCompleted: syncState.assetsCompleted ?? false,
          shortcutSeen: syncState.shortcutSeen ?? false,
        };
      })(),

      setHydrated: () => set({ hydrated: true }),
      markActivated: () => set({ activated: true }),
      setActivated: (v: boolean) => set({ activated: v }),
      markProfileCompleted: () => set({ profileCompleted: true }),
      markOnboardingCompleted: () => set({ onboardingCompleted: true }),

      markAssetsBuildingsCompleted: () =>
        set(() => ({
          assetsBuildingsCompleted: true,
          assetsCompleted: Boolean(get().assetsVehiclesCompleted),
        })),
      markAssetsVehiclesCompleted: () =>
        set(() => ({
          assetsVehiclesCompleted: true,
          assetsCompleted: Boolean(get().assetsBuildingsCompleted),
        })),
      markAssetsCompleted: () =>
        set({
          assetsBuildingsCompleted: true,
          assetsVehiclesCompleted: true,
          assetsCompleted: true,
        }),

      markShortcutSeen: () => set({ shortcutSeen: true }),

      syncWithAuth: async () => {
        try {
          const { authService } = await import("@/services/auth");
          const token = typeof authService?.getToken === "function" ? authService.getToken() : undefined;
          set({ activated: Boolean(token) });
        } catch {
          // ignore
        }
      },

      resetOnboarding: () =>
        set({
          activated: false,
          profileCompleted: false,
          onboardingCompleted: false,
          assetsBuildingsCompleted: false,
          assetsVehiclesCompleted: false,
          assetsCompleted: false,
          shortcutSeen: false,
        }),

      replayFirstShortcut: () =>
        set({
          assetsCompleted: true,
          shortcutSeen: false,
        }),
    }),
    {
      name: STORAGE_KEY,
      version: STORE_VERSION,
      migrate: (persisted: unknown, from) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const p = persisted as Record<string, unknown>;
        if (from === 0 || from === 1) {
          return {
            hydrated: false,
            activated: Boolean(p.activated ?? false),
            profileCompleted: Boolean(p.profileCompleted ?? false),
            onboardingCompleted: Boolean(p.onboardingCompleted ?? false),
            assetsBuildingsCompleted: Boolean(p.assetsBuildingsCompleted ?? false),
            assetsVehiclesCompleted: Boolean(p.assetsVehiclesCompleted ?? false),
            assetsCompleted: Boolean(
              (p.assetsBuildingsCompleted ?? false) && (p.assetsVehiclesCompleted ?? false)
            ),
            shortcutSeen: Boolean(p.shortcutSeen ?? false),
          } as State;
        }
        return persisted as State;
      },
      partialize: (s) => ({
        hydrated: s.hydrated,
        activated: s.activated,
        profileCompleted: s.profileCompleted,
        onboardingCompleted: s.onboardingCompleted,
        assetsBuildingsCompleted: s.assetsBuildingsCompleted,
        assetsVehiclesCompleted: s.assetsVehiclesCompleted,
        assetsCompleted: s.assetsCompleted,
        shortcutSeen: s.shortcutSeen,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated?.();
        }
      },
    }
  )
);

export const useShouldShowFirstShortcut = () =>
  useOnboarding((s) => s.assetsCompleted && !s.shortcutSeen);
export const useCanProceedVehicles = () =>
  useOnboarding((s) => s.assetsBuildingsCompleted);
export const useCanFinishAssets = () =>
  useOnboarding((s) => s.assetsVehiclesCompleted);
export const useIsOnboardingHydrated = () => useOnboarding((s) => s.hydrated);
