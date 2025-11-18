"use client"

import React from "react"
import { useRouter } from "next/navigation"
import type { VehicleResponse } from "@/services/assets"
import ManageVehicleCard from "./ManageVehicleCard"

export default function ManageVehicleList({
  vehicles,
  baseEditPath = "/app/profile/manajemen-kendaraan",
  onDeleted,
}: {
  vehicles: VehicleResponse[]
  baseEditPath?: string
  onDeleted?: (id: string) => void
}) {
  const router = useRouter()

  if (!vehicles.length) return null

  return (
    <div className="space-y-3">
      {vehicles.map(v => (
        <ManageVehicleCard
          key={v.id}
          data={v}
          onEdit={(id: string) => router.push(`${baseEditPath}/${id}/edit`)}
          onDeleted={(id: string) => {
            if (onDeleted) onDeleted(id);
            else router.refresh();
          }}
        />
      ))}
    </div>
  )
}
