"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import HideOnPaths from "@/components/nav/HideOnPaths";
import type { NavItemLembaga } from "@/components/nav/BottomNavLembaga";
import useAuth from "@/hooks/useAuth";

const BottomNavLembaga = dynamic(() => import("@/components/nav/BottomNavLembaga"));

const HIDE_NAV_PATHS = [
  "/lembaga/catat/riwayat",
  "/lembaga/catat/transportasi",     
  "/lembaga/catat/energi-listrik", 
  "/lembaga/catat/produksi-sampah",  


];

export default function LembagaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  // Guard: Require backend token before accessing lembaga features
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
        
        // Check if user is lembaga type
        if (userData.user_type !== "lembaga") {
          console.warn("🚫 User is not lembaga type. Redirecting...");
          router.replace("/app"); // Redirect individu to their dashboard
          return;
        }

        console.log("✅ Access granted to lembaga features");
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

  const navItems: NavItemLembaga[] = [
    { label: "Beranda",   href: "/lembaga",           iconSrc: "/icons/home.svg",      match: "exact" },
    { label: "Tantangan", href: "/lembaga/tantangan",   iconSrc: "/icons/challenge.svg" },
    { label: "Catat",     href: "/lembaga/catat",     iconSrc: "/icons/add.svg" },
    { label: "Analisis",  href: "/lembaga/analisis",  iconSrc: "/icons/chart.svg" },
    { label: "Profil",    href: "/lembaga/profile",   iconSrc: "/icons/user.svg" },
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

      <HideOnPaths paths={HIDE_NAV_PATHS}>
        <BottomNavLembaga items={navItems} />
      </HideOnPaths>
    </div>
  );
}
