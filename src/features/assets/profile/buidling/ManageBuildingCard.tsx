"use client"

import React from "react"
import Image from "next/image"
import Button from "@/components/ui/Button"
import type { BuildingResponse } from "@/services/assets"

function fmt(n?: number, unit?: string) {
  if (n == null) return "—"
  return `${n.toLocaleString("id-ID")}${unit ? ` ${unit}` : ""}`
}

function alamatLine(b: BuildingResponse) {
  // Use full_address from API, or fallback to formatted address
  if (b.full_address) {
    const parts = [b.full_address]
    if (b.postal_code) parts.push(b.postal_code)
    return parts.join(", ")
  }
  return "—"
}

export default function ManageBuildingCard({
  data,
  onEdit,
  onDelete,
}: {
  data: BuildingResponse
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}) {
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
          <Image src="/icons/lembaga/registrasi/ic-building.svg" alt="" width={20} height={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{data.name || "Nama Bangunan"}</div>
          <div className="text-sm text-black/70">{data.address_label || "—"}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-black/60">Tarif Listrik</div>
          <div className="font-semibold text-xs">ID: {data.electricity_tariff_id.slice(0, 8)}...</div>
        </div>
        <div>
          <div className="text-black/60">Luas</div>
          <div className="font-semibold">{fmt(data.metadata?.area_sqm, "m²")}</div>
        </div>
        <div>
          <div className="text-black/60">Elektronik</div>
          <div className="font-semibold">
            {data.metadata?.electronics_inventory 
              ? Object.keys(data.metadata.electronics_inventory).length 
              : 0}
          </div>
        </div>
      </div>

      <p className="mt-3 text-sm text-black/60">
        Tambahkan peralatan listrik yang ada di bangunan ini pada halaman edit
      </p>

      <div className="mt-3 text-sm">
        <div className="text-black/60">Alamat:</div>
        <div className="text-black/80">{alamatLine(data)}</div>
      </div>

      <div className="my-3 h-px w-full bg-black/10" />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline"
          className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
          onClick={() => onEdit?.(data.id)}>
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
          </svg>
          Edit
        </Button>
        <Button type="button" variant="outline"
          className="!bg-red-50 !border-red-200 !text-red-600"
          onClick={() => onDelete?.(data.id)}>
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" />
          </svg>
          Hapus
        </Button>
      </div>
    </article>
  )
}
