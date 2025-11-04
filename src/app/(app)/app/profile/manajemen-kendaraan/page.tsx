"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import EmptyState from "@/features/assets/EmptyState"
import ManageVehicleList from "@/features/assets/profile/vehicle/ManageVehicleList"
import { assetsService, VehicleResponse } from "@/services/assets"
import useAuth from "@/hooks/useAuth"

export default function Page() {
  const router = useRouter()
  const { getIdToken } = useAuth()
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch vehicles from API
  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true)
        const token = await getIdToken()
        if (!token) {
          setError("No authentication token")
          return
        }
        
        const data = await assetsService.getVehicles(token)
        setVehicles(data)
      } catch (err) {
        console.error("Failed to fetch vehicles:", err)
        setError(err instanceof Error ? err.message : "Failed to load vehicles")
      } finally {
        setLoading(false)
      }
    }
    
    fetchVehicles()
  }, [getIdToken])

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      {/* Header */}
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Aset Kendaraan Anda
        </h1>
        <div className="h-9 w-9" />
      </header>
      <div
        className="mx-auto mt-3 h-0.5 w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      {/* Body */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : vehicles.length === 0 ? (
          <EmptyState variant="vehicle" text="Belum ada kendaraan. Tambahkan terlebih dahulu." />
        ) : (
          <ManageVehicleList vehicles={vehicles} baseEditPath="/app/profile/manajemen-kendaraan" />
        )}
      </div>

      {/* CTA */}
      <div className="sticky bottom-6 mt-6">
        <Button size="lg" fullWidth onClick={() => router.push("/app/profile/kendaraan/new")}>
          Tambah Kendaraan
        </Button>
      </div>
    </main>
  )
}
