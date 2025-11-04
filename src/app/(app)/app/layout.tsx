"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HideOnPaths from "@/components/nav/HideOnPaths";
import type { NavItem } from "@/components/nav/BottomNavIndividu";
import useAuth from "@/hooks/useAuth";

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
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Guard: Require backend token before accessing app features
  useEffect(() => {
    async function validateAccess() {
      try {
        // Try to get Firebase token first
        const firebaseToken = await getIdToken();
        
        if (!firebaseToken) {
          console.warn("🚫 No Firebase token. Redirecting to login...");
          router.replace("/auth/login");
          return;
        }

        // Try to get or exchange for backend token
        const { authService } = await import("@/services/auth");
        let backendToken = authService.getToken();
        
        if (!backendToken) {
          console.log("🔄 Exchanging Firebase token for backend token...");
          try {
            backendToken = await authService.loginWithGoogle(firebaseToken);
            authService.saveToken(backendToken);
            console.log("✅ Backend token obtained successfully");
          } catch (error) {
            console.error("❌ Failed to get backend token:", error);
            router.replace("/auth/login");
            return;
          }
        }

        // Validate backend token by checking user profile
        const { userService } = await import("@/services/user");
        const userData = await userService.getMe(backendToken);
        
        // Check if user is individu type
        if (userData.user_type !== "individu") {
          console.warn("🚫 User is not individu type. Redirecting...");
          router.replace("/lembaga"); // Redirect lembaga to their dashboard
          return;
        }

        console.log("✅ Access granted to app features");
        setHasAccess(true);
      } catch (error) {
        console.error("❌ Access validation failed:", error);
        router.replace("/auth/login");
      } finally {
        setIsValidating(false);
      }
    }

    validateAccess();
  }, [getIdToken, router]);

  const items: NavItem[] = [
    { label: "Beranda",   href: "/app",            iconSrc: "/icons/home.svg",      match: "exact" },
    { label: "Tantangan", href: "/app/tantangan",  iconSrc: "/icons/challenge.svg", match: "exact" },
    { label: "Catat",     href: "/app/catat",      iconSrc: "/icons/add.svg",       match: "exact" },
    { label: "Analisis",  href: "/app/analisis",   iconSrc: "/icons/chart.svg",     match: "exact" },
    { label: "Profil",    href: "/app/profile",     iconSrc: "/icons/user.svg",      match: "exact" },
  ];

  // Show loading state while validating
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

  // Only render if access is granted
  if (!hasAccess) {
    return null;
  }

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
