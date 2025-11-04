"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import EmptyState from "@/features/assets/EmptyState"
import ManageBuildingList from "@/features/assets/profile/buidling/ManageBuildingList"
import { assetsService, BuildingResponse } from "@/services/assets"
import useAuth from "@/hooks/useAuth"

export default function Page() {
  const router = useRouter()
  const { getIdToken } = useAuth()
  const [buildings, setBuildings] = useState<BuildingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch buildings from API
  useEffect(() => {
    async function fetchBuildings() {
      try {
        setLoading(true)
        const token = await getIdToken()
        if (!token) {
          setError("No authentication token")
          return
        }
        
        const data = await assetsService.getBuildings(token)
        setBuildings(data)
      } catch (err) {
        console.error("Failed to fetch buildings:", err)
        setError(err instanceof Error ? err.message : "Failed to load buildings")
      } finally {
        setLoading(false)
      }
    }
    
    fetchBuildings()
  }, [getIdToken])

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      {/* Header ala kamu */}
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Aset Bangunan Anda
        </h1>
        <div className="h-9 w-9" />
      </header>
      <div
        className="mx-auto mt-3 h-0.5 w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* List / Empty */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : buildings.length === 0 ? (
          <EmptyState variant="building" text="Belum ada bangunan. Tambahkan terlebih dahulu." />
        ) : (
          <ManageBuildingList buildings={buildings} baseEditPath="/app/profile/manajemen-bangunan" />
        )}
      </div>

      {/* CTA */}
      <div className="sticky bottom-6 mt-6">
        <Button size="lg" fullWidth onClick={() => router.push("/app/profile/bangunan/new")}>
          Tambah Bangunan
        </Button>
      </div>
    </main>
  )
}
