"use client";

import dynamic from "next/dynamic";
import HideOnPaths from "@/components/nav/HideOnPaths";
import type { NavItemLembaga } from "@/components/nav/BottomNavLembaga";

const BottomNavLembaga = dynamic(() => import("@/components/nav/BottomNavLembaga"));

const HIDE_NAV_PATHS = [
  "/lembaga/catat/riwayat",
  "/lembaga/catat/transportasi",     
  "/lembaga/catat/energi-listrik", 
  "/lembaga/catat/produksi-sampah",  


];

export default function LembagaLayout({ children }: { children: React.ReactNode }) {
  const navItems: NavItemLembaga[] = [
    { label: "Beranda",   href: "/lembaga",           iconSrc: "/icons/home.svg",      match: "exact" },
    { label: "Tantangan", href: "/lembaga/tantangan",   iconSrc: "/icons/challenge.svg" },
    { label: "Catat",     href: "/lembaga/catat",     iconSrc: "/icons/add.svg" },
    { label: "Analisis",  href: "/lembaga/analisis",  iconSrc: "/icons/chart.svg" },
    { label: "Profil",    href: "/lembaga/profile",   iconSrc: "/icons/user.svg" },
  ];

  return (
    <div className="min-h-dvh bg-white text-black">
      {/* mobile full; ≥md center */}
      <main className="w-full px-4 pt-4 pb-[88px] md:mx-auto md:max-w-[480px]">
        {children}
      </main>

      <HideOnPaths paths={HIDE_NAV_PATHS}>
        <BottomNavLembaga items={navItems} />
      </HideOnPaths>
    </div>
  );
}
