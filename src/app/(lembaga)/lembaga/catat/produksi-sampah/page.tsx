"use client"

import React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import type { WasteCategoryDef } from "@/components/shared/catat/food/types"
import WasteFormSection from "@/components/shared/catat/food/WasteFormSection"

export default function Page() {
  const router = useRouter()

  const categories: WasteCategoryDef[] = [
    { id: "plastik",  label: "Plastik",               hint: "Botol, kantong, kemasan" },
    { id: "kertas",   label: "Kertas & Karton",       hint: "Kertas tulis, kardus" },
    { id: "logam",    label: "Logam",                 hint: "Kaleng aluminium, besi" },
    { id: "kaca",     label: "Kaca",                  hint: "Botol/pecahan kaca" },
    { id: "organik",  label: "Organik",               hint: "Sisa makanan, daun" },
    { id: "ewaste",   label: "Elektronik (E-waste)",  hint: "Baterai, lampu, perangkat" },
    { id: "b3",       label: "Limbah Berbahaya (B3)", hint: "Obat, cat, minyak" },
  ]

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      {/* Header ala Energi Listrik */}
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Produksi Sampah
        </h1>
        <div className="h-9 w-9" />
      </header>

      <div
        className="mx-auto mt-3 h-[2px] w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* Body */}
      <div className="py-4">
        <WasteFormSection categories={categories} />
      </div>
    </main>
  )
}
