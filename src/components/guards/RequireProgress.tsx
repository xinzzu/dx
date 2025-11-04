"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/stores/onboarding";
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
  const { activated, profileCompleted, onboardingCompleted, assetsBuildingsCompleted } =
    useOnboarding();
  const buildingCount = useAssetWizard((s) => s.buildings.length);

  const redirectTo = useMemo(() => {
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
  ]);

  useEffect(() => {
    if (redirectTo) router.replace(redirectTo);
  }, [redirectTo, router]);

  if (redirectTo) return null;
  return <>{children}</>;
}
