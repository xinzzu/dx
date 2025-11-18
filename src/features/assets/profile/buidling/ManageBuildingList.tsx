"use client"

import React from "react"
import { useRouter } from "next/navigation"
import type { BuildingResponse } from "@/services/assets"
import ManageBuildingCard from "./ManageBuildingCard"

export default function ManageBuildingList({
  buildings,
  baseEditPath = "/app/profile/manajemen-bangunan",
  onRefresh,
}: {
  buildings: BuildingResponse[]
  baseEditPath?: string
  onRefresh?: () => void
}) {
  const router = useRouter()
  if (!buildings.length) return null

  return (
    <div className="space-y-3">
      {buildings.map((b) => (
        <ManageBuildingCard
          key={b.id}
          data={b}
          onEdit={(id: string) => router.push(`${baseEditPath}/${id}/edit`)}
          onRefresh={() => {
            if (onRefresh) onRefresh(); else router.refresh();
          }}
        />
      ))}

      {/* Confirm modal moved into each card component to keep card-level UX self-contained */}
    </div>
  )
}
