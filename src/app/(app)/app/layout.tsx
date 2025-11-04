import dynamic from "next/dynamic";
import HideOnPaths from "@/components/nav/HideOnPaths";
import type { NavItem } from "@/components/nav/BottomNavIndividu";

const BottomNav = dynamic(() => import("@/components/nav/BottomNavIndividu"));

const HIDE_NAV_PATHS = [
  "/app/catat/transportasi",     
  "/app/catat/energi-listrik", 
  "/app/catat/konsumsi-makanan",  
  "/app/catat/riwayat",
  "/app/profile/manajemen-bangunan",
  "/app/profile/manajemen-bangunan/[id]/edit",
  "/app/profile/manajemen-kendaraan",
  "/app/profile/manajemen-kendaraan/[id]/edit",
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const items: NavItem[] = [
{ label: "Beranda",   href: "/app",            iconSrc: "/icons/home.svg",      match: "exact" },
    { label: "Tantangan", href: "/app/tantangan",  iconSrc: "/icons/challenge.svg", match: "exact" },
    { label: "Catat",     href: "/app/catat",      iconSrc: "/icons/add.svg",       match: "exact" },
    { label: "Analisis",  href: "/app/analisis",   iconSrc: "/icons/chart.svg",     match: "exact" },
    { label: "Profil",    href: "/app/profile",     iconSrc: "/icons/user.svg",      match: "exact" },
  ];

  return (
       <div className="min-h-dvh bg-white text-black">
      {/* mobile full; ≥md center */}
      <main className="w-full px-4 pt-4 pb-[88px] md:mx-auto md:max-w-[480px]">
        {children}
      </main>

      {/* ⬇️ navbar disembunyikan pada path tertentu */}
      <HideOnPaths paths={HIDE_NAV_PATHS}>
        <BottomNav items={items} />
      </HideOnPaths>
    </div>
  );
}
