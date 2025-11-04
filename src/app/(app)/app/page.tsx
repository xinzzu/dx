"use client";

import { useEffect, useState } from "react";
import HeaderBar from "@/components/shared/home/HeaderBar";
import CarbonTotalCard from "@/components/shared/home/CarbonTotalCard";
import BadgeCard from "@/components/shared/home/BadgeCard";
import InspirationSection from "@/components/shared/home/InspirationSection";
import FirstShortcutCard from "@/components/shared/home/FirstShortcutCard";
import { useOnboarding } from "@/stores/onboarding";
import { authService } from "@/services/auth";

export default function HomePage() {
  const [name, setName] = useState("John Doe");
  const [total, setTotal] = useState(0);
  const [loadingCarbon, setLoadingCarbon] = useState(true);
  
  const { replayFirstShortcut } = useOnboarding();

  // Fetch user name from backend
  useEffect(() => {
    async function fetchUserName() {
      try {
        const token = authService.getToken();
        if (!token) return;

        const { userService } = await import("@/services/user");
        const userData = await userService.getMe(token!);
        
        // For individu: use individual_profile.full_name
        // For lembaga: use institution_profile.name
        let displayName = ""; // fallback
        
        if (userData.user_type === "individu" && userData.individual_profile?.full_name) {
          displayName = userData.individual_profile.full_name;
        } else if (userData.user_type === "lembaga" && userData.institution_profile?.name) {
          displayName = userData.institution_profile.name;
        }
        
        setName(displayName);
        
        // Save to localStorage for faster load next time
        localStorage.setItem("profile.name", displayName);
      } catch (error) {
        console.error("❌ Failed to fetch user name:", error);
        // Try to load from localStorage as fallback
        const nm = localStorage.getItem("profile.name");
        if (nm) setName(nm);
      }
    }

    fetchUserName();
  }, []);

  // Fetch carbon footprint from backend
  useEffect(() => {
    async function fetchCarbonFootprint() {
      // First, load from localStorage immediately
      const sm = localStorage.getItem("summary:last");
      if (sm) {
        try {
          const p = JSON.parse(sm);
          if (typeof p?.totalKg === "number") setTotal(p.totalKg);
        } catch {}
      }

      // Then fetch from backend to update
      try {
        setLoadingCarbon(true);
        const token = authService.getToken();
        if (!token) return;

        const { reportsService } = await import("@/services/reports");
        const data = await reportsService.getCurrentCarbonFootprint(token!);
        
        console.log("📊 Carbon footprint data:", data);
        
        // Format: ambil 4 digit dari depan (pembulatan ke 4 digit signifikan)
        const rawTotal = data.current_month_total_kgco2e;
        const formattedTotal = Math.round(rawTotal * 10) / 10; // 1 decimal place
        
        setTotal(formattedTotal);

        // Save to localStorage for next time
        localStorage.setItem("summary:last", JSON.stringify({
          totalKg: formattedTotal,
          previousKg: data.previous_month_total_kgco2e,
          comparison: data.comparison,
        }));
      } catch (error) {
        const err = error as { message?: string };
        
        // Jika 404, kemungkinan endpoint belum tersedia atau belum ada data
        if (err.message?.includes("404")) {
          console.warn("⚠️ Carbon footprint endpoint not found (404). This is normal if you haven't submitted any reports yet.");
        } else {
          console.error("❌ Failed to fetch carbon footprint:", error);
        }
        
        // Keep using localStorage data (already loaded above)
      } finally {
        setLoadingCarbon(false);
      }
    }

    fetchCarbonFootprint();
  }, []);

  const articles = [
    {
      id: 1,
      title: "5 Cara Jitu Hemat Listrik Saat WFH",
      description: "Tips mudah agar tagihan listrikmu aman selama kerja dari rumah.",
      bannerSrc: "/images/banner.png",
    },
  ];

  return (
    <main>
      <HeaderBar name={name} onBellClick={() => { /* TODO: open notifications */ }} />

      <CarbonTotalCard totalKg={total} />

      {/* <BadgeCard
        title='Lencana “Jalur Hijau”'
        subtitle="Menggunakan transportasi umum hari ini"
        footer={`Bulan ini: Total ${total} kg CO₂e`}
      /> */}

      {/* Muncul sekali setelah aset selesai */}
      <FirstShortcutCard/>
      {/* <button onClick={replayFirstShortcut}>Replay First Shortcut</button> */}

      <InspirationSection
        articles={articles}
        onSeeAll={() => { /* TODO: route to /app/inspirasi */ }}
      />
    </main>
  );
}
