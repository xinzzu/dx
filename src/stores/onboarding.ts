"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORE_VERSION = 2;

type State = {
  // hydration flag supaya UI bisa tunjukkan skeleton sampai store restore selesai
  hydrated: boolean;
  activated: boolean;
  profileCompleted: boolean;
  onboardingCompleted: boolean;

  // progres aset
  assetsBuildingsCompleted: boolean;
  assetsVehiclesCompleted: boolean;
  assetsCompleted: boolean;

  // ui first-time card di beranda
  shortcutSeen: boolean;
};

type Actions = {
  setHydrated: () => void;
  markActivated: () => void;
  // explicit setter so external flows (e.g. magic-link exchange) can mark activated
  setActivated: (v: boolean) => void;
  markProfileCompleted: () => void;
  markOnboardingCompleted: () => void;

  markAssetsBuildingsCompleted: () => void;
  markAssetsVehiclesCompleted: () => void;
  markAssetsCompleted: () => void;

  markShortcutSeen: () => void;

  resetOnboarding: () => void;
  replayFirstShortcut: () => void;

  // sync onboarding state with auth layer (checks backend JWT presence)
  syncWithAuth: () => Promise<void>;

};

export const useOnboarding = create<State & Actions>()(
  persist(
  (set, get) => ({
  // hydration flag: false sampai persist selesai rehydrate
  hydrated: false,
      activated: false,
      profileCompleted: false,
      onboardingCompleted: false,

      assetsBuildingsCompleted: false,
      assetsVehiclesCompleted: false,
      assetsCompleted: false,

      shortcutSeen: false,

      markActivated: () => set({ activated: true }),
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

  setHydrated: () => set({ hydrated: true }),

      setActivated: (v: boolean) => set({ activated: v }),

      // check if there's a backend token saved and update 'activated' accordingly
      syncWithAuth: async () => {
        try {
          const { authService } = await import("@/services/auth");
          const token = typeof authService?.getToken === "function" ? authService.getToken() : undefined;
          set({ activated: Boolean(token) });
        } catch {
          // ignore failures; do not crash app if auth service import fails
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
          // keep hydrated as-is; rehydration state is orthogonal to resetting onboarding
        }),
      replayFirstShortcut: () =>
        set({
          assetsCompleted: true, // pastikan kondisi pemicu terpenuhi
          shortcutSeen: false, // tampilkan lagi
          // biarkan assetsBuildingsCompleted / assetsVehiclesCompleted apa adanya
        }),

    }),
    {
      name: "onboarding-progress",
      version: STORE_VERSION,
      migrate: (persisted: unknown, from) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        const p = persisted as Record<string, unknown>;
        if (from === 0 || from === 1) {
          return {
            // hydrated tetap false saat migrasi; onRehydrateStorage akan menandainya
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
      // when persist finishes rehydration, flip hydrated flag so UI can stop showing skeleton
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.setHydrated?.();
        }
      },
    }
  )
);

// helper selectors (opsional tapi enak dipakai)
export const useShouldShowFirstShortcut = () =>
  useOnboarding((s) => s.assetsCompleted && !s.shortcutSeen);
export const useCanProceedVehicles = () =>
  useOnboarding((s) => s.assetsBuildingsCompleted);
export const useCanFinishAssets = () =>
  useOnboarding((s) => s.assetsVehiclesCompleted);

// helper to check rehydration status from components
export const useIsOnboardingHydrated = () => useOnboarding((s) => s.hydrated);
