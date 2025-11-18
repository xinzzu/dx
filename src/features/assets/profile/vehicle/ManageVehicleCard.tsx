"use client"

import React from "react"
import Image from "next/image"
import Button from "@/components/ui/Button"
import ConfirmDeleteModal from '@/components/ui/ConfirmDeleteModal'
import useAuth from '@/hooks/useAuth'
import { assetsService } from '@/services/assets'
import { toast } from 'sonner'
import { userFriendlyError } from '@/lib/userError'
import { useRouter } from 'next/navigation'
import type { VehicleResponse } from "@/services/assets"

const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—")

export default function ManageVehicleCard({
  data,
  onEdit,
  onDeleted,
}: {
  data: VehicleResponse
  onEdit?: (id: string) => void
  onDeleted?: (id: string) => void
}) {
  const router = useRouter()
  const { getIdToken } = useAuth()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const getBackendToken = React.useCallback(async (): Promise<string | null> => {
    const { authService } = await import("@/services/auth");
    let backendToken = authService.getToken();

    if (!backendToken) {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) return null;

      backendToken = await authService.loginWithGoogle(firebaseToken);
      try { authService.saveToken(backendToken); } catch {}
    }

    return backendToken;
  }, [getIdToken])

  const openConfirm = () => setConfirmOpen(true)
  const closeConfirm = () => setConfirmOpen(false)

  const performDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      const token = await getBackendToken()
      if (!token) {
        toast.error('Token tidak tersedia. Silakan login kembali.')
        return
      }

      await assetsService.deleteVehicle(data.id, token)

      try { toast.success(`Kendaraan ${data.name || data.id} berhasil dihapus`) } catch {}

      if (onDeleted) onDeleted(data.id)
      else router.refresh()
    } catch (err) {
      console.error('Failed to delete vehicle:', err)
      toast.error(userFriendlyError(err, 'Gagal menghapus kendaraan. Silakan coba lagi.'))
    } finally {
      setDeleting(false)
      closeConfirm()
    }
  }

  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
          <Image src="/icons/lembaga/registrasi/ic-vehicle.svg" alt="" width={20} height={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{data.name || "Nama Kendaraan"}</div>
          {data.description && (
            <div className="text-sm text-black/70">{data.description}</div>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-black/60">Jenis Kendaraan</div>
          <div className="font-semibold">{data.metadata?.vehicle_type || "—"}</div>
        </div>
        <div>
          <div className="text-black/60">Kapasitas Mesin</div>
          <div className="font-semibold">{data.metadata?.capacity_range || "—"}</div>
        </div>
        <div>
          <div className="text-black/60">Bahan Bakar</div>
          <div className="font-semibold">{cap(data.metadata?.fuel_type)}</div>
        </div>
      </div>

      <div className="my-3 h-px w-full bg-black/10" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
          onClick={() => onEdit?.(data.id)}
        >
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
          </svg>
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          className="!bg-red-50 !border-red-200 !text-red-600"
          onClick={openConfirm}
        >
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" />
          </svg>
          Hapus
        </Button>
      </div>

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Hapus Kendaraan"
        message="Kamu akan menghapus kendaraan ini. Tindakan ini tidak dapat dibatalkan."
        dangerLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onCancel={closeConfirm}
        onConfirm={performDelete}
        meta={[
          { label: 'Nama', value: data.name || '' },
          { label: 'Jenis Kendaraan', value: data.metadata?.vehicle_type || '' },
        ]}
      />

    </article>
  )
}
