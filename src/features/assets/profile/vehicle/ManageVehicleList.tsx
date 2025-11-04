"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { VehicleResponse } from "@/services/assets"
import ManageVehicleCard from "./ManageVehicleCard"

export default function ManageVehicleList({
  vehicles,
  baseEditPath = "/app/profile/kendaraan",
}: {
  vehicles: VehicleResponse[]
  baseEditPath?: string
}) {
  const router = useRouter()

  if (!vehicles.length) return null

  const handleDelete = async (id: string) => {
    // TODO: Implement DELETE /vehicle-assets/:id
    console.log("Delete vehicle:", id)
  }

  return (
    <div className="space-y-3">
      {vehicles.map(v => (
        <ManageVehicleCard
          key={v.id}
          data={v}
          onEdit={(id: string) => router.push(`${baseEditPath}/${id}/edit`)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
