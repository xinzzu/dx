"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import HeaderBar from "@/components/shared/home/HeaderBar";
import CarbonTotalCard from "@/components/shared/home/CarbonTotalCard";
import FirstShortcutCard from "@/components/shared/home/FirstShortcutCard";
import InspirationSection from "@/components/shared/home/InspirationSection";
import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/auth";

export default function HomePage() {
  const router = useRouter();
  const { currentUser, logout, getIdToken } = useAuth();
  const [totalCarbonKg, setTotalCarbonKg] = useState(0);
  const [userName, setUserName] = useState("Pengguna");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const AFTER_LOGOUT_PATH = "/";

  const getBackendToken = useCallback(async () => {
    let backendToken = authService.getToken();
    if (!backendToken && currentUser) {
      const firebaseIdToken = await getIdToken();
      if (firebaseIdToken) {
        backendToken = await authService.loginWithGoogle(firebaseIdToken);
        authService.saveToken(backendToken);
      }
    }
    return backendToken;
  }, [currentUser, getIdToken]);

  // Fetch user data and carbon footprint
  useEffect(() => {
    async function loadData() {
      try {
        const token = await getBackendToken();
        if (!token) return;

        // Get user info
        const { userService } = await import("@/services/user");
        const userData = await userService.getMe(token);

        // Prefer institution name when user_type is 'lembaga', otherwise individual full name.
        const nameFromProfile = (userData?.user_type === "lembaga")
          ? (userData?.institution_profile?.name ?? userData?.email ?? "Pengguna")
          : (userData?.individual_profile?.full_name ?? userData?.email ?? "Pengguna");
        setUserName(nameFromProfile);

        // Get carbon footprint
        const { reportsService } = await import("@/services/reports");
        const carbonData = await reportsService.getCurrentCarbonFootprint(token);
        const current = Math.round(carbonData.current_month_total_kgco2e * 10) / 10;
        setTotalCarbonKg(current);
      } catch (error) {
        console.error("Failed to load home data:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);

        if (errorMessage.includes("401 Unauthorized")) {
          console.log("Unauthorized error detected. Clearing token and redirecting to login.");
          onLogout();
          return;
        }
      }
    }

    loadData();
  }, [getBackendToken]);

  function onLogout() {
    setIsLoggingOut(true);
    logout()
      .finally(() => {
        setIsLoggingOut(false);
        router.replace(AFTER_LOGOUT_PATH);
      });
  }

  const sampleArticles = [
    {
      id: 1,
      title: "5 Cara Mudah Mengurangi Jejak Karbon",
      description: "Tips praktis untuk hidup lebih ramah lingkungan",
      bannerSrc: "/images/banner.png",
    },
  ];

  return (
    <main className="min-h-dvh bg-white text-black">
      <div className="mx-auto max-w-lg px-4 pb-[88px] pt-4">
        <HeaderBar
          name={userName}
          onBellClick={() => console.log("Notifikasi clicked")}
        />

        <CarbonTotalCard totalKg={totalCarbonKg} />

        <FirstShortcutCard totalKg={totalCarbonKg} />

        <InspirationSection
          articles={sampleArticles}
          onSeeAll={() => router.push("/app/inspirasi")}
        />
      </div>
    </main>
  );
}
