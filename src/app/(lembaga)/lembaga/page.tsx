"use client";

import { useEffect, useState } from "react";
import HeaderBar from "@/components/shared/home/HeaderBar";
import CarbonTotalCard from "@/components/shared/home/CarbonTotalCard";
import BadgeCard from "@/components/shared/home/BadgeCard";
import InspirationSection from "@/components/shared/home/InspirationSection";
import FirstShortcutCard from "@/components/shared/home/FirstShortcutCard";
import { useOnboarding } from "@/stores/onboarding";
export default function LembagaHomePage() {
  const [name, setName] = useState("Nama Lembaga");
  const [total, setTotal] = useState(0);
  
  const { replayFirstShortcut } = useOnboarding();
  useEffect(() => {
    const nm = localStorage.getItem("profile.name");
    if (nm) setName(nm);

    const sm = localStorage.getItem("summary:last");
    if (sm) {
      try {
        const p = JSON.parse(sm);
        if (typeof p?.totalKg === "number") setTotal(p.totalKg);
      } catch {}
    }
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

      <BadgeCard
        title='Lencana “Jalur Hijau”'
        subtitle="Menggunakan transportasi umum hari ini"
        footer={`Bulan ini: Total ${total} kg CO₂e`}
      />

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
