"use client"
import React from "react"
import Link from "next/link"

export function HistoryHeader({ backHref }: { backHref: string }) {
  return (
    <div className="sticky top-0 z-10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-screen-sm items-center gap-3 px-4 py-3">
        <Link href={backHref} className="-ml-1 rounded-full p-2 ring-1 ring-gray-200">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-[17px] font-semibold text-gray-900">Riwayat Laporan Jejak Karbon</h1>
      </div>
      <div className="h-[2px] w-full bg-emerald-500/90" />
    </div>
  )
}
