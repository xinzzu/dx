"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import HideOnPaths from "@/components/nav/HideOnPaths";
import type { NavItem } from "@/components/nav/BottomNavIndividu";
import useAuth from "@/hooks/useAuth";
import StickyScrollHeader from "@/components/nav/StickyScrollHeader";

const BottomNav = dynamic(() => import("@/components/nav/BottomNavIndividu"));

const HIDE_NAV_PATHS = [
  "/app/catat/transportasi",
  "/app/catat/energi-listrik",
  "/app/catat/konsumsi-makanan",
  "/app/catat/riwayat",
  "/app/profile/manajemen-bangunan",
  "/app/profile/manajemen-bangunan/new",
  "/app/profile/manajemen-bangunan/[id]/edit",
  "/app/profile/manajemen-kendaraan",
  "/app/profile/manajemen-kendaraan/new",
  "/app/profile/manajemen-kendaraan/[id]/edit",
  "/app/profile/edit-profile",
  "/app/tantangan/papan-peringkat",
  "/app/catat/laporan/transportasi",
  "/app/catat/laporan/energi-listrik",
  "/app/catat/laporan/konsumsi-makanan",
  "/app/catat/laporan/produksi-sampah",
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  // NOTE: auth-only guard
  // We keep an authentication guard here to ensure the app has a valid
  // backend token before rendering app pages, but we intentionally do NOT
  // perform user_type-based redirects here. Page-level layouts (catat,
  // analisis) will handle user-type specific UI and redirects.

  const router = useRouter();
  const { getIdToken } = useAuth();
  const [isValidating, setIsValidating] = useState(true);

  const items: NavItem[] = [
    { label: "Beranda", href: "/app", iconSrc: "/icons/home.svg", match: "exact" },
    { label: "Tantangan", href: "/app/tantangan", iconSrc: "/icons/challenge.svg", match: "exact" },
    { label: "Catat", href: "/app/catat", iconSrc: "/icons/add.svg", match: "exact" },
    { label: "Analisis", href: "/app/analisis", iconSrc: "/icons/chart.svg", match: "exact" },
    { label: "Profil", href: "/app/profile", iconSrc: "/icons/user.svg", match: "exact" },
  ];
  const containerRef = useRef<HTMLDivElement>(null);

  // Validate auth token before rendering children
  useEffect(() => {
    let mounted = true;

    async function validate() {
      try {
        const firebaseToken = await getIdToken();

        if (!firebaseToken) {
          console.warn("🚫 No Firebase token. Redirecting to login...");
          router.replace("/auth/login");
          return;
        }

        const { authService } = await import("@/services/auth");
        let backendToken = authService.getToken();

        if (!backendToken) {
          try {
            backendToken = await authService.loginWithGoogle(firebaseToken);
            authService.saveToken(backendToken);
            console.log("✅ Backend token obtained successfully");
          } catch (err) {
            console.error("❌ Failed to get backend token:", err);
            router.replace("/auth/login");
            return;
          }
        }

        // token exists, allow render
      } catch (err) {
        console.error("❌ Access validation failed:", err);
        router.replace("/auth/login");
      } finally {
        if (mounted) setIsValidating(false);
      }
    }

    validate();

    return () => {
      mounted = false;
    };
  }, [getIdToken, router]);

  if (isValidating) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Memvalidasi akses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh w-full flex flex-col bg-white mx-auto shadow-lg max-w-md max-width-container">

      {/* mobile full; ≥md center */}
      {/* 💡 Pastikan flex-1 + overflow-y-auto sudah benar */}
      <main
        ref={containerRef}
        className="flex-1 w-full md:mx-auto overflow-y-auto relative" // Tambahkan relative
      >
        {children}
      </main>

      {/* ⬇️ Bottom Nav Bar */}
      <footer className="text-center text-sm text-gray-600 w-full z-10"> {/* Tambahkan z-index agar di atas konten */}
        <HideOnPaths paths={HIDE_NAV_PATHS}>
          <BottomNav items={items} />
        </HideOnPaths>
      </footer>

    </div>
  );
}
