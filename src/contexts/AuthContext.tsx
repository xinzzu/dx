"use client";

import React, { createContext, useEffect, useState } from "react";
import { auth } from "@/services/firebase";
import {
  onAuthStateChanged,
  signOut,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { userService } from "@/services/user";
import { useOnboarding } from "@/stores/onboarding";

export interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  googleLogin: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  getGoogleAccessToken: () => string | null;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const ACCESS_TOKEN_KEY = "google_access_token";
const ACCESS_TOKEN_EXP_KEY = "google_access_token_exp";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          const cred = GoogleAuthProvider.credentialFromResult(result);
          const at = cred?.accessToken;
          if (at) {
            const exp = Math.floor(Date.now() / 1000) + 3000;
            sessionStorage.setItem(ACCESS_TOKEN_KEY, at);
            sessionStorage.setItem(ACCESS_TOKEN_EXP_KEY, String(exp));
          }
        }
      } catch (e) {
        console.warn("[Auth] getRedirectResult error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setCurrentUser(u);
      
      // Sync onboarding state with backend when user is authenticated
      if (u) {
        // Get Firebase ID token first (needed for registration)
        const firebaseToken = await u.getIdToken(true);
        
        if (!firebaseToken) {
          console.warn("[Auth] No Firebase token available, skipping sync");
          setLoading(false);
          return;
        }

        try {
          // Try to get backend token from localStorage first
          const { authService } = await import("@/services/auth");
          let backendToken = authService.getToken();
          
          // If no backend token, register user first
          if (!backendToken) {
            console.log("[Auth] No backend token found, registering user...");
            backendToken = await authService.loginWithGoogle(firebaseToken);
            authService.saveToken(backendToken);
            console.log("[Auth] ✅ User registered successfully");
          }
          
          // Fetch user profile with backend token
          const profile = await userService.getMe(backendToken);
          
          // Sync backend flags to Zustand store
          const { 
            markActivated,
            markProfileCompleted, 
            markAssetsCompleted,
            markAssetsBuildingsCompleted,
            markAssetsVehiclesCompleted 
          } = useOnboarding.getState();
          
          // Sync activation status
          
          
          if (profile.is_profile_complete) {
            markProfileCompleted();
          }
          
          if (profile.is_asset_buildings_completed) {
            markAssetsBuildingsCompleted();
          }
          
          if (profile.is_asset_vehicles_completed) {
            markAssetsVehiclesCompleted();
          }
          
          // Mark all assets completed if both are done
          if (profile.is_asset_buildings_completed && profile.is_asset_vehicles_completed) {
            markAssetsCompleted();
          }
        } catch (error) {
          const err = error as { message?: string };
          
          // Check if backend token expired or invalid (401/403)
          if (err.message?.includes('401') || err.message?.includes('403')) {
            console.warn("[Auth] Backend token invalid or expired, re-registering...");
            
            try {
              // Re-register with Firebase token
              const { authService } = await import("@/services/auth");
              const newBackendToken = await authService.loginWithGoogle(firebaseToken);
              authService.saveToken(newBackendToken);
              console.log("[Auth] ✅ Re-registered successfully");
              
              // Retry fetching profile with new token
              const profile = await userService.getMe(newBackendToken);
              
              // Sync backend flags to Zustand store
              const { 
                
                markProfileCompleted, 
                markAssetsCompleted,
                markAssetsBuildingsCompleted,
                markAssetsVehiclesCompleted 
              } = useOnboarding.getState();
              
              
              
              if (profile.is_profile_complete) {
                markProfileCompleted();
              }
              
              if (profile.is_asset_buildings_completed) {
                markAssetsBuildingsCompleted();
              }
              
              if (profile.is_asset_vehicles_completed) {
                markAssetsVehiclesCompleted();
              }
              
              if (profile.is_asset_buildings_completed && profile.is_asset_vehicles_completed) {
                markAssetsCompleted();
              }
            } catch (retryError) {
              console.error("[Auth] Failed to re-register:", retryError);
            }
          } else {
            console.error("[Auth] Failed to sync onboarding state:", error);
          }
        }
      }
      
      setLoading(false);
    });
    return unsub;
  }, []);

  const googleLogin = async () => {
    setLoading(true);
    // buat provider LOKAL setiap kali login
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      await signInWithRedirect(auth, provider);
    } catch (e) {
      const warnObj = e as unknown as { code?: string };
      console.warn("[Auth] redirect failed, trying popup:", warnObj.code ?? e);
      try {
        await signInWithPopup(auth, provider);
      } catch (e2) {
        setLoading(false);
        const errObj = e2 as unknown as { code?: string; message?: string };
        console.error("[Auth] popup error:", errObj.code, errObj.message ?? e2);
        throw e2;
      }
    }
  };

  const logout = async () => {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_EXP_KEY);
    await signOut(auth);
  };

  const getIdToken = async (forceRefresh = false) => {
    const u = auth.currentUser;
    if (!u) return null;
    try { return await u.getIdToken(forceRefresh); } catch { return null; }
  };

  const getGoogleAccessToken = () => {
    const t = sessionStorage.getItem(ACCESS_TOKEN_KEY);
    const exp = Number(sessionStorage.getItem(ACCESS_TOKEN_EXP_KEY) || 0);
    if (!t) return null;
    if (exp && exp < Math.floor(Date.now() / 1000)) {
      sessionStorage.removeItem(ACCESS_TOKEN_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_EXP_KEY);
      return null;
    }
    return t;
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading, googleLogin, logout, getIdToken, getGoogleAccessToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
