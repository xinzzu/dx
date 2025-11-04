"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RequireProgress  from "@/components/guards/RequireProgress";
import OnboardingIndividu from "@/components/onboarding/OnboardingIndividu";
import OnboardingLembaga from "@/components/onboarding/OnboardingLembaga";
import { useOnboarding } from "@/stores/onboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const q = useSearchParams();
  const type = q?.get("type") === "lembaga" ? "lembaga" : "individu";
  const { assetsCompleted, markOnboardingCompleted } = useOnboarding();

  // Redirect if assets are already completed (user finished the full flow)
  useEffect(() => {
    if (assetsCompleted) {
      // Auto-mark onboarding as completed if not already
      markOnboardingCompleted();
      router.replace(type === "lembaga" ? "/lembaga" : "/app");
    }
  }, [assetsCompleted, type, router, markOnboardingCompleted]);

  return (
    <RequireProgress step="onboarding">
      <main className="min-h-dvh bg-white text-black px-5 py-8">
        <div className="mx-auto w-full max-w-lg">
          {type === "lembaga" ? <OnboardingLembaga /> : <OnboardingIndividu />}
        </div>
      </main>
    </RequireProgress>
  );
}
