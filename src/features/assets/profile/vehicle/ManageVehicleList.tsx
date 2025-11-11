"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { VehicleResponse, assetsService } from "@/services/assets"
import ManageVehicleCard from "./ManageVehicleCard"
import useAuth from '@/hooks/useAuth'
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'

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
  const { getIdToken } = useAuth()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!vehicles.length) return null

  const openConfirm = (id: string) => {
    setConfirmingId(id)
    setConfirmOpen(true)
  }

  const handleCancelConfirm = () => {
    setConfirmOpen(false)
    setConfirmingId(null)
  }

  const performDelete = async (id: string) => {
    // Ignore if another delete for the same id is in progress
    if (deletingId) {
      console.log('Delete already in progress for:', deletingId)
      return
    }

    try {
      console.log('Deleting vehicle:', id)
      setDeletingId(id)
      const token = await getIdToken()
      if (!token) {
        alert('Token tidak tersedia. Silakan login kembali.')
        return
      }

      await assetsService.deleteVehicle(id, token)

      console.log('Delete successful:', id)
      // Let parent update list if provided, otherwise fallback to reload
      if (onDeleted) {
        onDeleted(id)
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to delete vehicle:', err)
      alert(err instanceof Error ? err.message : 'Gagal menghapus kendaraan')
    } finally {
      setDeletingId(null)
      setConfirmOpen(false)
      setConfirmingId(null)
    }
  }

  return (
    <div className="space-y-3">
      {vehicles.map(v => (
        <ManageVehicleCard
          key={v.id}
          data={v}
          onEdit={(id: string) => router.push(`${baseEditPath}/${id}/edit`)}
          onDelete={openConfirm}
        />
      ))}

      {/* Confirm delete modal */}
      <ConfirmDeleteModal
        open={confirmOpen}
        title="Hapus Kendaraan"
        message="Kamu akan menghapus kendaraan ini. Tindakan ini tidak dapat dibatalkan."
        dangerLabel="Hapus"
        cancelLabel="Batal"
        loading={Boolean(deletingId)}
        onCancel={handleCancelConfirm}
        onConfirm={() => confirmingId && performDelete(confirmingId)}
        meta={confirmingId ? [
          { label: 'Nama', value: vehicles.find(x => x.id === confirmingId)?.name || '' },
          { label: 'Jenis Kendaraan', value: vehicles.find(x => x.id === confirmingId)?.metadata?.vehicle_type || '' },
        ] : []}
      />
    </div>
  )
}
