"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const STORE_VERSION = 2;

type State = {
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
  markActivated: () => void;
  markProfileCompleted: () => void;
  markOnboardingCompleted: () => void;

  markAssetsBuildingsCompleted: () => void;
  markAssetsVehiclesCompleted: () => void;
  markAssetsCompleted: () => void;

  markShortcutSeen: () => void;

  resetOnboarding: () => void;
  replayFirstShortcut: () => void;

};

export const useOnboarding = create<State & Actions>()(
  persist(
    (set, get) => ({
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
        set((s) => ({
          assetsBuildingsCompleted: true,
          assetsCompleted: true && s.assetsVehiclesCompleted,
        })),
      markAssetsVehiclesCompleted: () =>
        set((s) => ({
          assetsVehiclesCompleted: true,
          assetsCompleted: s.assetsBuildingsCompleted && true,
        })),
      markAssetsCompleted: () =>
        set({
          assetsBuildingsCompleted: true,
          assetsVehiclesCompleted: true,
          assetsCompleted: true,
        }),

      markShortcutSeen: () => set({ shortcutSeen: true }),

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
  set((s) => ({
    assetsCompleted: true,  // pastikan kondisi pemicu terpenuhi
    shortcutSeen: false,    // tampilkan lagi
    // biarkan assetsBuildingsCompleted / assetsVehiclesCompleted apa adanya
  })),

    }),
    {
      name: "onboarding-progress",
      version: STORE_VERSION,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      migrate: (persisted: any, from) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        if (from === 0 || from === 1) {
          return {
            activated: !!persisted.activated,
            profileCompleted: !!persisted.profileCompleted,
            onboardingCompleted: !!persisted.onboardingCompleted,

            assetsBuildingsCompleted: !!persisted.assetsBuildingsCompleted,
            assetsVehiclesCompleted: Boolean(persisted.assetsVehiclesCompleted ?? false),
            assetsCompleted: Boolean(
              (persisted.assetsBuildingsCompleted ?? false) &&
                (persisted.assetsVehiclesCompleted ?? false)
            ),

            shortcutSeen: Boolean(persisted.shortcutSeen ?? false),
          } as State;
        }
        return persisted as State;
      },
      partialize: (s) => ({
        activated: s.activated,
        profileCompleted: s.profileCompleted,
        onboardingCompleted: s.onboardingCompleted,
        assetsBuildingsCompleted: s.assetsBuildingsCompleted,
        assetsVehiclesCompleted: s.assetsVehiclesCompleted,
        assetsCompleted: s.assetsCompleted,
        shortcutSeen: s.shortcutSeen,
      }),
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
