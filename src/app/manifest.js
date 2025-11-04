/** @returns {import('next').MetadataRoute.Manifest} */
export default function manifest() {
  return {
    name: "1000 Cahaya",
    short_name: "1000Cahaya",
    description: "A Progressive Web App for 1000 Cahaya",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#007AFF",
    icons: [
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
  }
}
