"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import RequireProgress from "@/components/guards/RequireProgress";
import { useOnboarding, useIsOnboardingHydrated } from "@/stores/onboarding";

const CompleteProfileContent = dynamic(
  () => import("@/components/auth/CompleteProfileContent"),
  {
    ssr: false,
    loading: () => (
      <main className="min-h-dvh grid place-items-center bg-white">
        <div className="text-center text-black/60">Memuat...</div>
      </main>
    ),
  }
);

export default function CompleteProfilePage() {
  const router = useRouter();
  const { profileCompleted, onboardingCompleted } = useOnboarding();
  const hydrated = useIsOnboardingHydrated();

  // Redirect if profile is already completed
  useEffect(() => {
    if (!hydrated) return; // wait until store rehydrated to make redirect decisions

    if (profileCompleted) {
      // If onboarding is also complete, go to appropriate dashboard
      if (onboardingCompleted) {
        // Determine user type from URL params or default to individu
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type") || "individu";
        router.replace(type === "lembaga" ? "/lembaga" : "/app");
      } else {
        // Profile complete but onboarding not done, go to onboarding
        const params = new URLSearchParams(window.location.search);
        const type = params.get("type") || "individu";
        router.replace(`/onboarding?type=${type}`);
      }
    }
  }, [hydrated, profileCompleted, onboardingCompleted, router]);

  // while store is rehydrating, show a simple full-page loading skeleton
  if (!hydrated) {
    return (
      <main className="min-h-dvh grid place-items-center bg-white">
        <div className="text-center text-black/60">Memuat...</div>
      </main>
    );
  }
  return (
    <RequireProgress step="complete-profile">
      <CompleteProfileContent />
    </RequireProgress>
  );
}
