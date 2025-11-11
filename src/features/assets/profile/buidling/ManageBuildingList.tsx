"use client"

import React, { useCallback } from "react"
import { useRouter } from "next/navigation"
import { BuildingResponse, assetsService } from "@/services/assets"
import ManageBuildingCard from "./ManageBuildingCard"
import useAuth from "@/hooks/useAuth"
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'

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
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

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

  const openConfirm = (id: string) => {
    setConfirmingId(id)
    setConfirmOpen(true)
  }

  const handleCancelConfirm = () => {
    setConfirmOpen(false)
    setConfirmingId(null)
  }

  const performDelete = async (id: string) => {
    // Prevent concurrent deletes
    if (deletingId) return

    try {
      setDeletingId(id)
      const token = await getBackendToken();
      if (!token) {
        alert("Token tidak tersedia");
        return;
      }

      await assetsService.deleteBuilding(id, token);

      // Refresh list
      if (onRefresh) {
        onRefresh();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to delete building:", error);
      alert(error instanceof Error ? error.message : "Gagal menghapus bangunan");
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setConfirmingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {buildings.map((b) => (
        <ManageBuildingCard
          key={b.id}
          data={b}
          onEdit={(id: string) => router.push(`${baseEditPath}/${id}/edit`)}
          onDelete={openConfirm}
        />
      ))}

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Hapus Bangunan"
        message="Kamu akan menghapus bangunan ini. Tindakan ini tidak dapat dibatalkan."
        dangerLabel="Hapus"
        cancelLabel="Batal"
        loading={Boolean(deletingId)}
        onCancel={handleCancelConfirm}
        onConfirm={() => confirmingId && performDelete(confirmingId)}
        meta={confirmingId ? [
          { label: 'Nama', value: buildings.find(x => x.id === confirmingId)?.name || '' },
          { label: 'Alamat', value: buildings.find(x => x.id === confirmingId)?.full_address || '' },
        ] : []}
      />
    </div>
  )
}
