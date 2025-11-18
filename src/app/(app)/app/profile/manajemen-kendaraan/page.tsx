"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import EmptyState from "@/features/assets/EmptyState"
import ManageVehicleList from "@/features/assets/profile/vehicle/ManageVehicleList"
import { assetsService, VehicleResponse } from "@/services/assets"
import useAuth from "@/hooks/useAuth"
import ScrollContainer from "@/components/nav/ScrollContainer"

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
        
        // Use assetsService which calls /me/vehicle-assets under the hood
        const data = await assetsService.getVehicles(token);

        // Deduplicate backend response by id in case backend returns duplicates
        const deduped = Array.from(new Map((data || []).map((v) => [v.id, v])).values())
        console.log('Fetched vehicles (deduped):', deduped.length, data?.length)
        setVehicles(deduped)
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
    <ScrollContainer
                headerTitle="Atur Kendaraan"
                leftContainer={
                  <button
                    onClick={() => router.push("/app/profile" )}
                    aria-label="Kembali"
                    className="h-9 w-9 grid place-items-center"
                  >
                    <Image src="/arrow-left.svg" alt="" width={18} height={18} />
                  </button>
                }
              >

      {/* Body */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : vehicles.length === 0 ? (
          <EmptyState variant="vehicle" text="Belum ada kendaraan. Tambahkan terlebih dahulu." />
        ) : (
          <ManageVehicleList
            vehicles={vehicles}
            baseEditPath="/app/profile/manajemen-kendaraan"
            onDeleted={(id: string) => setVehicles(prev => prev.filter(v => v.id !== id))}
          />
        )}
      </div>

      {/* CTA */}
      <div className="sticky bottom-6 mt-6">
        <Button size="lg" fullWidth onClick={() => router.push("/app/profile/manajemen-kendaraan/new")}>
          Tambah Kendaraan
        </Button>
      </div>
    </ScrollContainer>
  )
}
