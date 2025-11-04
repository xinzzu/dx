"use client";

import { useRouter } from "next/navigation";
import { ReactNode } from "react";

// (Asumsi ikon ini ada di file yang sama atau diimpor)
const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  children: ReactNode;
  suppressHydrationWarning?: boolean;
};

export default function AuthLayout({
  title,
  subtitle,
  children,
  suppressHydrationWarning,
}: Props) {
  const router = useRouter();

  return (
    // Ini adalah layout "kode lama" Anda yang "ditengah gitu"
    <div className="min-h-dvh bg-white text-black" suppressHydrationWarning={suppressHydrationWarning}>
      <main className="mx-auto max-w-md px-4 pb-10 pt-6">
        
        {/* Panah Kembali ("Icon Lama") */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2"
            aria-label="Kembali"
          >
            <BackArrowIcon />
          </button>
        </div>

        <div className="mt-8">
          {/* Judul & Subjudul */}
          <div className="text-left">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
            {subtitle && (
              <p className="text-gray-600 mb-8">
                {subtitle}
              </p>
            )}
          </div>
          
          {/* Konten (Form, Tombol, dll) */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}