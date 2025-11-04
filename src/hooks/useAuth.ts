// src/hooks/useAuth.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { auth, googleProvider } from "@/services/firebase";
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, User, getRedirectResult } from "firebase/auth";
import { authService } from "@/services/auth";
import { useOnboarding } from "@/stores/onboarding";

type UseAuthReturn = {
  currentUser: User | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
};

export default function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle redirect result from Google OAuth
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          // User just came back from redirect
          const firebaseIdToken = await result.user.getIdToken(true);
          
          // Send to backend & save token
          const backendAccessToken = await authService.loginWithGoogle(firebaseIdToken);
          authService.saveToken(backendAccessToken);
          
          // Mark as activated for Google login
          useOnboarding.getState().markActivated();
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };

    handleRedirectResult();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const googleLogin = useCallback(async () => {
    setLoading(true);
    try {
      // tandai provider agar routing tahu ini via Google
      if (typeof window !== "undefined") {
        sessionStorage.setItem("login_via", "google");
      }

      // jika environment ter-isolate (COOP/COEP), pakai redirect
      const canUsePopup = typeof window !== "undefined" && !window.crossOriginIsolated;

      if (canUsePopup) {
        try {
          // 1. Login via Firebase
          const cred = await signInWithPopup(auth, googleProvider);
          
          // 2. Mark activated IMMEDIATELY (BEFORE exchange token)
          // Prevent race condition dengan RequireProgress guard
          if (typeof window !== "undefined") {
            sessionStorage.setItem("login_via", "google");
          }
          useOnboarding.getState().markActivated();
          
          // 3. Get Firebase ID Token
          const firebaseIdToken = await cred.user.getIdToken(true);

          // 4. Send Firebase ID Token to backend → get access_token
          const backendAccessToken = await authService.loginWithGoogle(firebaseIdToken);
          
          // 5. Save backend access token
          authService.saveToken(backendAccessToken);
        } catch (error) {
          console.error("Google login error:", error);
          
          // Check if user cancelled the popup
          if (error instanceof Error && 
              (error.message.includes("popup-closed-by-user") || 
               error.message.includes("cancelled-popup-request"))) {
            console.log("User cancelled Google login popup");
            // Redirect back to login page
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
            return; // Exit early, don't fallback to redirect
          }
          
          // For other errors, fallback to redirect
          await signInWithRedirect(auth, googleProvider);
        }
      } else {
        await signInWithRedirect(auth, googleProvider);
      }
    } finally {
      // biarkan loading dirilis oleh onAuthStateChanged setelah login selesai
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Remove backend access token
      authService.removeToken();
      
      // Reset onboarding store (clear activated, profileCompleted, etc)
      useOnboarding.getState().resetOnboarding();
      
      // Clear session storage
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("login_via");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Access Token for backend API authentication
   * @returns Backend access token or null if not authenticated
   */
  const getIdToken = useCallback(async (): Promise<string | null> => {
    // ONLY return backend access token from localStorage
    // DO NOT try to exchange Firebase token automatically
    // That should only happen during explicit login flow
    const backendToken = authService.getToken();
    return backendToken;
  }, []);

  return { currentUser, loading, googleLogin, logout, getIdToken };
}
