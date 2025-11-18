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
import type { BuildingResponse } from "@/services/assets"
import { formatIDR } from "@/utils/currency"

function fmt(n?: number, unit?: string) {
  if (n == null) return "—"
  return `${n.toLocaleString("id-ID")}${unit ? ` ${unit}` : ""}`
}

function alamatLine(b: BuildingResponse) {
  // Use full_address from API, or fallback to formatted address
  if (b.full_address) {
    const parts = [b.full_address]
    if (b.postal_code) parts.push(b.postal_code)
    return parts.join(", ")
  }
  return "—"
}

type ElectronicsArrayItem = { name?: string; qty?: number; count?: number; jumlah?: number }
type ElectronicsInventory = Record<string, number> | ElectronicsArrayItem[]

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x)
}

function electronicsTotal(inv?: ElectronicsInventory | unknown): number {
  // debug: lihat bentuk payload yang diterima
  // hapus/komentari console.debug setelah selesai debug
  console.debug("electronics_inventory raw:", inv)

  if (!inv) return 0

  if (Array.isArray(inv)) {
    return inv.reduce((sum, it: ElectronicsArrayItem) => {
      const val = Number(it.qty ?? it.count ?? it.jumlah ?? 0)
      return sum + (Number.isFinite(val) ? Math.max(0, Math.floor(val)) : 0)
    }, 0)
  }

  if (isRecord(inv)) {
    return Object.values(inv).reduce<number>((sum, v) => {
      const num = Number(v as unknown)
      return sum + (Number.isFinite(num) ? Math.max(0, Math.floor(num)) : 0)
    }, 0)
  }

  // jika bentuk tak terduga, tampilkan di console dan kembalikan 0
  console.warn("electronicsTotal: unexpected inventory shape", inv)
  return 0
}

export default function ManageBuildingCard({
  data,
  onEdit,
  onRefresh,
}: {
  data: BuildingResponse
  onEdit?: (id: string) => void
  onRefresh?: () => void
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
        toast.error('Token tidak tersedia')
        return
      }

      await assetsService.deleteBuilding(data.id, token)

      try { toast.success(`Bangunan ${data.name || data.id} berhasil dihapus`) } catch {}

      // refresh parent list or fallback to router refresh
      if (onRefresh) onRefresh(); else router.refresh()
    } catch (err) {
      console.error('Failed to delete building:', err)
      toast.error(userFriendlyError(err, 'Gagal menghapus bangunan. Silakan coba lagi.'))
    } finally {
      setDeleting(false)
      closeConfirm()
    }
  }
  return (
    <article className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm ring-1 ring-black/[0.03]">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/10">
          <Image src="/icons/lembaga/registrasi/ic-building.svg" alt="" width={20} height={20} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold">{data.name || "Nama Bangunan"}</div>
          <div className="text-sm text-black/70">{data.address_label || "—"}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
        <div>
          <div className="text-black/60">Daya Listrik</div>
          <div className="font-semibold text-xs">{data.power_capacity_label}</div>
        </div>
        <div>
          <div className="text-black/60">Tariff Listrik</div>
          <div className="font-semibold text-xs">{formatIDR(data.electricity_tariff_rate_per_kwh)}/kwh</div>
        </div>
        <div>
          <div className="text-black/60">Luas</div>
          <div className="font-semibold">{fmt(data.metadata?.area_sqm, "m²")}</div>
        </div>
        <div>
          <div className="text-black/60">Elektronik</div>
          <div className="font-semibold">{electronicsTotal(data.metadata?.electronics_inventory)}</div>
        </div>
      </div>

      <p className="mt-3 text-sm text-black/60">
        Tambahkan peralatan listrik yang ada di bangunan ini pada halaman edit
      </p>

      <div className="mt-3 text-sm">
        <div className="text-black/60">Alamat:</div>
        <div className="text-black/80">{alamatLine(data)}</div>
      </div>

      <div className="my-3 h-px w-full bg-black/10" />

      <div className="grid grid-cols-2 gap-3">
        <Button type="button" variant="outline"
          className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
          onClick={() => onEdit?.(data.id)}>
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
          </svg>
          Edit
        </Button>
        <Button type="button" variant="outline"
          className="!bg-red-50 !border-red-200 !text-red-600"
          onClick={openConfirm}>
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" />
          </svg>
          Hapus
        </Button>
      </div>

      <ConfirmDeleteModal
        open={confirmOpen}
        title="Hapus Bangunan"
        message="Kamu akan menghapus bangunan ini. Tindakan ini tidak dapat dibatalkan."
        dangerLabel="Hapus"
        cancelLabel="Batal"
        loading={deleting}
        onCancel={closeConfirm}
        onConfirm={performDelete}
        meta={[
          { label: 'Nama', value: data.name || '' },
          { label: 'Alamat', value: data.full_address || '' },
        ]}
      />
    </article>
  )
}
