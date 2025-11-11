"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import useAuth from "@/hooks/useAuth";
import { assetsService } from "@/services/assets";

export default function VehicleCardList() {
  const { vehicles, removeVehicle } = useAssetWizard();
  const { getIdToken } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (vehicles.length === 0) return null; // empty state ditangani di page

  return (
    <ul className="space-y-3">
      {vehicles.map((v) => (
        <li
          key={v.id}
          className="rounded-2xl border border-[var(--color-primary,theme(colors.emerald.500))]/60 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            {/* Icon di tile hijau muda */}
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-primary,theme(colors.emerald.500))]/10">
              <Image
                src="/icons/lembaga/registrasi/ic-vehicle.svg" // ganti ke path SVG kendaraanmu
                alt=""
                width={20}
                height={20}
                className="opacity-80"
                priority={false}
              />
            </div>

            {/* Teks */}
            <div className="flex-1">
              {/* Nama dalam [bracket] mengikuti building */}
              <div className="font-semibold">{v.name}</div>

              {/* Detail berbaris */}
              <div className="text-sm text-black/70">{v.vehicleTypeLabel}</div>
              <div className="text-sm text-black/70">{v.capacityRangeLabel}</div>
              <div className="text-sm text-black/70">{v.fuelTypeLabel}</div>
            </div>

            {/* Tombol hapus */}
            <button
              onClick={async () => {
                const ok = window.confirm(`Hapus kendaraan \"${v.name}\"?`);
                if (!ok) return;

                if (v.apiId) {
                  try {
                    setDeletingId(v.id);
                    const token = await getIdToken();
                    if (!token) throw new Error('Not authenticated');
                    await assetsService.deleteVehicle(v.apiId as string, token);
                    removeVehicle(v.id);
                  } catch (err) {
                    console.error('Failed to delete vehicle:', err);
                    window.alert('Gagal menghapus kendaraan. Coba lagi.');
                  } finally {
                    setDeletingId(null);
                  }
                } else {
                  removeVehicle(v.id);
                }
              }}
              aria-label={`Hapus ${v.name}`}
              className="text-red-600 hover:text-red-700"
              title="Hapus"
              disabled={deletingId === v.id}
            >
              <Trash2 size={18} />
              {/* Kalau mau pakai SVG internalmu:
                 <Image src="/icons/lembaga/registrasi/ic-trash.svg" alt="" width={18} height={18} />
              */}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
