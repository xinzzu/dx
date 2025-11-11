"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { ReactNode } from "react"

interface InstitutionAuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

export default function InstitutionAuthLayout({
  title,
  subtitle,
  children,
}: InstitutionAuthLayoutProps) {
  const router = useRouter()

  return (
    <main className="min-h-dvh bg-white text-black px-5 py-8" suppressHydrationWarning>
      <div className="w-full max-w-sm mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-8 p-2 -ml-2 hover:bg-black/5 rounded-lg transition-colors active:scale-95"
          aria-label="Kembali"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="w-16 h-16 flex-shrink-0">
            <Image src="/logo-1000-cahaya.svg" alt="1000 Cahaya" width={64} height={64} priority />
          </div>
        </div>
        <p className="text-sm text-black/70 mb-8">{subtitle}</p>

        {children}
      </div>
    </main>
  )
}