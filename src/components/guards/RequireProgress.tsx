"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/stores/onboarding";
import { useIsOnboardingHydrated } from "@/stores/onboarding";
import { useAssetWizard } from "@/stores/assetWizard";
import { authService } from "@/services/auth";

type Step =
  | "activate"
  | "complete-profile"
  | "onboarding"
  | "assets-bangunan"
  | "assets-kendaraan";

type Props = {
  step: Step;
  subject?: "individu" | "lembaga";
  children: React.ReactNode;
};

export default function RequireProgress({ step, subject = "individu", children }: Props) {
  const router = useRouter();
  // wait until persisted onboarding store is rehydrated before making any redirect decisions
  const hydrated = useIsOnboardingHydrated();
  const { activated, profileCompleted, onboardingCompleted, assetsBuildingsCompleted } =
    useOnboarding();
  const buildingCount = useAssetWizard((s) => s.buildings.length);

  const redirectTo = useMemo(() => {
    // do not compute / redirect based on default store values before rehydration
    if (!hydrated) return null;
    // 1. Check authentication FIRST before checking onboarding progress
    const token = authService.getToken();
    if (!token) {
      return "/auth/login";
    }

    // 2. Then check onboarding progress
    switch (step) {
      case "activate":
        return null;
      case "complete-profile":
        if (!activated) return "/activate";
        return null;
      case "onboarding":
        if (!activated) return "/activate";
        if (!profileCompleted) return "/complete-profile";
        return null;
      case "assets-bangunan":
        if (!activated) return "/activate";
        if (!profileCompleted) return "/complete-profile";
        if (!onboardingCompleted) return `/onboarding?type=${subject}`;
        return null;
      case "assets-kendaraan":
        if (!activated) return "/activate";
        if (!profileCompleted) return "/complete-profile";
        if (!onboardingCompleted) return `/onboarding?type=${subject}`;
        if (!(assetsBuildingsCompleted || buildingCount > 0)) {
          return `/setup/${subject}/assets/bangunan`;
        }
        return null;
      default:
        return null;
    }
  }, [
    step,
    subject,
    activated,
    profileCompleted,
    onboardingCompleted,
    assetsBuildingsCompleted,
    buildingCount,
    hydrated,
  ]);

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  // show a small skeleton while the onboarding store is still rehydrating
  if (!hydrated) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="space-y-4">
          <div className="h-6 w-1/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-slate-200 rounded animate-pulse" />
          <div className="h-48 bg-slate-100 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-24 bg-slate-100 rounded animate-pulse" />
            <div className="h-24 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (redirectTo) return null;
  return <>{children}</>;
}
