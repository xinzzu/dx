"use client";

import Button from "@/components/ui/Button";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  dangerLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  loading?: boolean;

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
}: Props) {
  if (!open) return null;

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
              disabled={loading}
              onClick={onCancel}
              className="!bg-white"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={onConfirm}
              className="!bg-red-600 hover:!bg-red-700"
            >
              {loading ? "Menghapus..." : dangerLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
