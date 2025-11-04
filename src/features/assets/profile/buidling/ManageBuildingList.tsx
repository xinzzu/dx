"use client"

import React, { useCallback } from "react"
import { useRouter } from "next/navigation"
import { BuildingResponse, assetsService } from "@/services/assets"
import ManageBuildingCard from "./ManageBuildingCard"
import useAuth from "@/hooks/useAuth"

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
  const { getIdToken } = useAuth()

  // Helper to get backend token
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

  if (!buildings.length) return null

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus bangunan ini?")) return;

    try {
      const token = await getBackendToken();
      if (!token) {
        alert("Token tidak tersedia");
        return;
      }

      await assetsService.deleteBuilding(id, token);
      alert("Bangunan berhasil dihapus!");
      
      // Refresh list
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete building:", error);
      alert(error instanceof Error ? error.message : "Gagal menghapus bangunan");
    }
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
