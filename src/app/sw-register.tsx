// "use client";
// import { useEffect } from "react";

// export default function SWRegister() {
//   useEffect(() => {
//     if ("serviceWorker" in navigator) {
//       navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(console.error);

//       // optional: log ketika terpasang
//       window.addEventListener("appinstalled", () => {
//         console.log("PWA installed");
//       });
//     }
//   }, []);
//   return null;
// }

// src/app/sw-register.tsx
"use client";
import { useEffect } from "react";

export default function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      if (process.env.NODE_ENV === "production") {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      } else {
        // DEV: cabut semua SW + bersihkan cache
        navigator.serviceWorker.getRegistrations().then(r => r.forEach(x => x.unregister()));
        caches?.keys?.().then(keys => keys.forEach(k => caches.delete(k)));
      }
    }
  }, []);
  return null;
}
