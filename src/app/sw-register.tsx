"use client";
import { useEffect } from "react";

declare global {
  interface Window {
    clearUserData?: () => Promise<void>;
  }
}

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const enablePWA = process.env.NEXT_PUBLIC_ENABLE_PWA === "true";
      if (enablePWA) {
        // PWA explicitly enabled: register and attach helpful logging / update hooks
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((reg) => {
            // basic visibility for debugging registration on devices
            console.log("[SW] registered:", reg);
            reg.addEventListener("updatefound", () => {
              const newWorker = reg.installing;
              if (!newWorker) return;
              console.log("[SW] update found, installing...");
              newWorker.addEventListener("statechange", () => {
                console.log("[SW] new worker state:", newWorker.state);
              });
            });
          })
          .catch((err) => console.warn("[SW] register failed:", err));

        // Report when the active controller changes (helpful on Android)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("[SW] controller changed");
        });
      } else {
        // PWA disabled: unregister all SW + clear caches to avoid stale caching.
        navigator.serviceWorker.getRegistrations().then((r) => r.forEach((x) => x.unregister()));
        caches?.keys?.().then((keys) => keys.forEach((k) => caches.delete(k)));
      }
    }

    // Expose a simple page -> worker helper to request clearing user-scoped data.
    // Call window.clearUserData() from logout to ask the SW to remove
    // per-user caches without unregistering the worker itself.
    window.clearUserData = async () => {
      if (!("serviceWorker" in navigator)) return;
      try {
        const reg = await navigator.serviceWorker.ready;
        if (reg.active) reg.active.postMessage({ type: "CLEAR_USER_DATA" });
      } catch {
        // ignore
      }
    };
  }, []);

  return null;
}