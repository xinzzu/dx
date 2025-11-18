// next.config.ts
import type { NextConfig } from "next";
import withPWA from "next-pwa";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

const baseConfig = {
  reactStrictMode: true,
  output: 'standalone',
  turbopack: {
    // Paksa root ke folder proyek ini (atasi “inferred workspace root”)
    root: path.resolve(__dirname),
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
} satisfies NextConfig;


// Konfigurasi PWA
const enablePWA = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_PWA === "true";
export default withPWA({
  dest: "public",
  // Only register the service worker when PWA is explicitly enabled
  register: enablePWA,
  skipWaiting: true,
  disable: !enablePWA,
  buildExcludes: [/middleware-manifest\.json$/],

  // --- ⬇ KONFIGURASI PENTING UNTUK MAGIC LINK ⬇ ---
  runtimeCaching: [
    {
      // Cocokkan semua URL yang dimulai dengan /auth/
      // Termasuk /auth/verify?token=...
      urlPattern: /^\/auth\/.*/,
      // SELALU gunakan jaringan. JANGAN PERNAH cache rute-rute ini.
      handler: "NetworkOnly",
    },
    // (Best Practice) Cache font Google
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-cache",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 Tahun
        },
      },
    },
    // (Best Practice) Cache gambar lokal
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|ico)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "images-cache",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Hari
        },
      },
    },
    // (Default) Untuk halaman dan request API, coba jaringan dulu
    // baru fallback ke cache.
    {
      urlPattern: /.*/, // Cocokkan sisanya
      handler: "NetworkFirst",
      options: {
        cacheName: "network-first-cache",
        networkTimeoutSeconds: 3, // Timeout 3 detik
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 1 Hari
        },
      },
    },
  ],
  // --- ⬆ AKHIR BLOK KONFIGURASI ⬆ ---

})(baseConfig);