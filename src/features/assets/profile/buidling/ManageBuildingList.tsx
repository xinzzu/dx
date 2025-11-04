"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { BuildingResponse } from "@/services/assets"
import ManageBuildingCard from "./ManageBuildingCard"

export default function ManageBuildingList({
  buildings,
  baseEditPath = "/app/profile/bangunan",
}: {
  buildings: BuildingResponse[]
  baseEditPath?: string
}) {
  const router = useRouter()

  if (!buildings.length) return null

  const handleDelete = async (id: string) => {
    // TODO: Implement DELETE /building-assets/:id
    console.log("Delete building:", id)
  }

  return (
    <div className="space-y-3">
      {buildings.map((b) => (
        <ManageBuildingCard
          key={b.id}
          data={b}
          onEdit={(id: string) => router.push(`${baseEditPath}/${id}/edit`)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
