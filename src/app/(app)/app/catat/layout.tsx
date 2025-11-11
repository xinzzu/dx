"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CATEGORIES_BY_USER from "@/lib/catatConfig";
import useAuth from "@/hooks/useAuth";
import { CatatContext } from "./catat-context";

type UserType = "individu" | "lembaga";

// Halaman transportasi butuh tampilan full tanpa BottomNav
export default function CatatAdvanceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [userType, setUserType] = useState<UserType>("individu");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUserType() {
      try {
        const firebaseToken = await getIdToken();

        if (!firebaseToken) {
          // No token - redirect to login (app layout guard should normally prevent this)
          router.replace("/auth/login");
          return;
        }

        const { authService } = await import("@/services/auth");
        let backendToken = authService.getToken();

        if (!backendToken) {
          // If no backend token, attempt exchange
          try {
            backendToken = await authService.loginWithGoogle(firebaseToken);
            authService.saveToken(backendToken);
          } catch (err) {
            console.error("Failed to exchange token in catat layout:", err);
            router.replace("/auth/login");
            return;
          }
        }

        const { userService } = await import("@/services/user");
        const me = await userService.getMe(backendToken);

        if (!mounted) return;

        const ut: UserType = me?.user_type === "lembaga" ? "lembaga" : "individu";
        setUserType(ut);
      } catch (err) {
        console.error("Error loading user type for catat layout:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadUserType();

    return () => {
      mounted = false;
    };
  }, [getIdToken, router]);

  const categories = CATEGORIES_BY_USER[userType];

  if (isLoading) {
    return (
      <div className="min-h-dvh bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Memuat kategori...</p>
        </div>
      </div>
    );
  }

  return (
    <CatatContext.Provider value={{ userType, categories }}>
      <div className="min-h-dvh bg-white text-black">
        <main className="w-full px-auto pt-auto md:mx-auto md:max-w-[480px]">{children}</main>
      </div>
    </CatatContext.Provider>
  );
}
