"use client";

import Button from "@/components/ui/Button";
import { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { wasteService } from "@/services/waste";
import { deleteFoodReport } from "@/services/food";
import { electricityService } from "@/services/electricity";
import { reportsService } from "@/services/reports";
import { toast } from "sonner";
import { userFriendlyError } from "@/lib/userError";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  dangerLabel?: string;
  cancelLabel?: string;
  // onConfirm can return a Promise — the modal will show loading until it settles
  onConfirm?: (() => void) | (() => Promise<void>);
  onCancel?: () => void;
  loading?: boolean; // explicit external loading can still be provided

  // Optional built-in delete behavior. If provided, the modal will call the
  // corresponding service DELETE endpoint when the user confirms.
  reportId?: string | null;
  kind?: "waste" | "food" | "electricity" | "transportation" | "transport";
  onDeleted?: () => void;

  // Opsional: tampilkan info ringkas item yang mau dihapus
  meta?: Array<{ label: string; value: string }>;
};

export default function ConfirmDeleteModal({
  open,
  title = "Hapus Item?",
  message = "Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus item ini?",
  dangerLabel = "Hapus",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  loading = false,
  meta = [],
  reportId = null,
  kind,
  onDeleted,
}: Props) {
  const [internalLoading, setInternalLoading] = useState(false);
  const { getIdToken } = useAuth();

  if (!open) return null;

  const effectiveLoading = loading || internalLoading;

  const handleConfirm = async () => {
    // If caller provided a custom onConfirm, run it
    if (onConfirm) {
      try {
        const res = onConfirm();
        if (res && typeof (res as Promise<void>).then === "function") {
          setInternalLoading(true);
          await res;
        }
      } finally {
        setInternalLoading(false);
      }
      return;
    }

    // Otherwise, if reportId + kind provided, perform the built-in delete
    if (!reportId || !kind) return;

    setInternalLoading(true);
    try {
      const token = await getIdToken();
      switch (kind) {
        case "waste":
          await wasteService.deleteReport(reportId, token);
          break;
        case "food":
          await deleteFoodReport(reportId, token);
          break;
        case "electricity":
          await electricityService.deleteReport(reportId, token);
          break;
        case "transport":
        case "transportation":
          // reportsService.deleteTransportReport requires token (string)
          if (!token) throw new Error("Auth token required for delete");
          await reportsService.deleteTransportReport(reportId, token);
          break;
        default:
          throw new Error("Unsupported delete kind");
      }

      // notify caller that delete succeeded
      try {
        onDeleted?.();
      } catch {
        // ignore handler errors
      }

      // close modal if caller provided onCancel
      onCancel?.();
        // Show success toast. If meta contains a name/value, include it for clarity.
        try {
          const nameCandidate = meta.find((m) => /nama|kendaraan|item/i.test(m.label))?.value || meta[0]?.value;
          if (nameCandidate) {
            toast.success(`Laporan "${nameCandidate}" berhasil dihapus`);
          } else {
            toast.success("Laporan berhasil dihapus");
          }
        } catch {
          // ignore toast errors
        }
    } catch (e: unknown) {
      console.error("Delete failed", e);
      // Basic user feedback — keep simple for now
      try {
        toast.error(userFriendlyError(e, "Gagal menghapus item. Silakan coba lagi."));
      } catch { }
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4">
          <div className="mx-auto rounded-full bg-red-100 p-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-center">{title}</h3>
          <p className="text-sm text-black/70 text-center">{message}</p>

          {meta.length > 0 && (
            <div className="mt-1 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <dl className="space-y-1">
                {meta.map((m) => (
                  <div key={m.label} className="flex items-start justify-between gap-2">
                    <dt className="text-black/60">{m.label}</dt>
                    <dd className="font-medium text-right">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-2 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={effectiveLoading}
              onClick={onCancel}
              className="bg-white!"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              disabled={effectiveLoading}
              onClick={handleConfirm}
              className="bg-red-600! hover:bg-red-700!"
            >
              {effectiveLoading ? "Menghapus..." : dangerLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
