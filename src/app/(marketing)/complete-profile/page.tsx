"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import RequireProgress from "@/components/guards/RequireProgress";
import { useOnboarding } from "@/stores/onboarding";

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

  // Redirect if profile is already completed
  useEffect(() => {
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
  }, [profileCompleted, onboardingCompleted, router]);

  return (
    <RequireProgress step="complete-profile">
      <CompleteProfileContent />
    </RequireProgress>
  );
}
