"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import useAuth from "@/hooks/useAuth";
import { assetsService } from "@/services/assets";
import { toast } from "sonner";

function formatVA(n: number) {
  return `${n.toLocaleString("id-ID")} VA`;
}

export default function BuildingCardList() {
  const { buildings, removeBuilding } = useAssetWizard();
  const { getIdToken } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (buildings.length === 0) return null; // empty state ditampilkan di page

  return (
    <ul className="space-y-3">
      {buildings.map((b) => (
        <li
          key={b.id}
          className="rounded-2xl border border-[var(--color-primary,theme(colors.emerald.500))]/60 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            {/* Icon di tile hijau muda */}
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--color-primary,theme(colors.emerald.500))]/10">
              <Image
                src="/icons/lembaga/registrasi/ic-building.svg" // ganti ke path SVG-mu
                alt=""
                width={20}
                height={20}
                className="opacity-80"
                priority={false}
              />
            </div>

            {/* Teks */}
            <div className="flex-1">
              <div className="font-semibold">{b.name}</div>
              <div className="text-sm text-black/70">{b.categoryName}</div>
              <div className="text-sm text-black/70">{b.tariffLabel || formatVA(b.dayaVa)}</div>
              {b.luasM2 ? (
                <div className="text-sm text-black/70">Luas: {b.luasM2} m²</div>
              ) : null}
            </div>

            {/* Tombol hapus */}
            <button
              onClick={async () => {
                // confirm
                const ok = window.confirm(`Hapus bangunan \"${b.name}\"?`);
                if (!ok) return;

                // If this building is persisted on backend (has apiId), call delete API first
                if (b.apiId) {
                  try {
                    setDeletingId(b.id);
                    const token = await getIdToken();
                    if (!token) throw new Error("Not authenticated");
                    await assetsService.deleteBuilding(b.apiId as string, token);
                    // remove from local store after successful delete
                    removeBuilding(b.id);
                  } catch (err) {
                    console.error("Failed to delete building:", err);
                    toast.error("Gagal menghapus bangunan. Coba lagi.");
                  } finally {
                    setDeletingId(null);
                  }
                } else {
                  // local-only item, just remove
                  removeBuilding(b.id);
                }
              }}
              aria-label={`Hapus ${b.name}`}
              className="text-red-600 hover:text-red-700"
              title="Hapus"
              disabled={deletingId === b.id}
            >
              <Trash2 size={18} />
              {/* Kalau mau SVG-mu sendiri:
              <Image src="/icons/lembaga/registrasi/ic-trash.svg" alt="" width={18} height={18}/>
              */}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
