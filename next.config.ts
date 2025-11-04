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

// 👉 Band-aid untuk DEV: abaikan mismatch tipe next-pwa
//    (Nanti bereskan dependency supaya tanpa ts-expect-error)

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: isDev, // SW dimatikan saat DEV
  buildExcludes: [/middleware-manifest\.json$/],
})(baseConfig);
