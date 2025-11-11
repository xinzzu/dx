import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import SWRegister from "./sw-register";

// 1. Impor AuthProvider Anda
import { AuthProvider } from "@/contexts/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

// (Metadata Anda sudah bagus, tidak perlu diubah)
export const metadata: Metadata = {
  title: "1000 Cahaya",
  description: "Platform jejak karbon untuk personal dan organisasi",
  manifest: "/manifest.json",
  // ... (sisa metadata)
};

// (Viewport Anda sudah bagus, tidak perlu diubah)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // ... (sisa viewport)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={poppins.variable}>
      {/* 💡 Hapus overflow-hidden dari body */}
      <body>
        <AuthProvider>
          {/* 💡 Ubah h-screen menjadi h-full (atau biarkan default) jika body boleh scroll */}
          <div className="bg-white">
            {children}
          </div>
          <div id="modal-root"></div>
          <SWRegister />
        </AuthProvider>
      </body>
    </html>
  );
}
