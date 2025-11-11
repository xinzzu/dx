"use client"

import React, { useEffect, useState, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/Button"
import EmptyState from "@/features/assets/EmptyState"
import ManageBuildingList from "@/features/assets/profile/buidling/ManageBuildingList"
import { assetsService, BuildingResponse } from "@/services/assets"
import useAuth from "@/hooks/useAuth"
import ScrollContainer from "@/components/nav/ScrollContainer"

export default function Page() {
  const router = useRouter()
  const { getIdToken } = useAuth()
  const [buildings, setBuildings] = useState<BuildingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper to get backend token (not Firebase token)
  const getBackendToken = useCallback(async (): Promise<string | null> => {
    const { authService } = await import("@/services/auth");
    let backendToken = authService.getToken();

    if (!backendToken) {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) return null;

      backendToken = await authService.loginWithGoogle(firebaseToken);
      authService.saveToken(backendToken);
    }

    return backendToken;
  }, [getIdToken]);

  // Fetch buildings from API
  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true)
      const token = await getBackendToken()
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
  }, [getBackendToken]);

  useEffect(() => {
    fetchBuildings()
  }, [fetchBuildings])

  return (
     <ScrollContainer
                 headerTitle="Atur Bangunan"
                 leftContainer={
                   <button
                     onClick={() => router.back()}
                     aria-label="Kembali"
                     className="h-9 w-9 grid place-items-center"
                   >
                     <Image src="/arrow-left.svg" alt="" width={18} height={18} />
                   </button>
                 }
               >

      {/* List / Empty */}
      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : buildings.length === 0 ? (
          <EmptyState variant="building" text="Belum ada bangunan. Tambahkan terlebih dahulu." />
        ) : (
          <ManageBuildingList
            buildings={buildings}
            baseEditPath="/app/profile/manajemen-bangunan"
            onRefresh={fetchBuildings}
          />
        )}
      </div>

      {/* CTA */}
      <div className="sticky bottom-6 mt-6">
        <Button size="lg" fullWidth onClick={() => router.push("/app/profile/manajemen-bangunan/new")}>
          + Tambah Bangunan
        </Button>
      </div>
    </ScrollContainer>
  )
}
