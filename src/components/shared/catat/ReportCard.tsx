"use client";
import { useState } from "react";

type Metric = { label: string; value: string };
type DetailRow = { label: string; qty?: string; right?: string }; // untuk sampah/makanan

export type ReportCardProps = {
  icon?: React.ReactNode;
  title: string;
  dateText: string;          // "20 Oktober 2025"
  subtitle?: string;         // "Konsumsi Bahan Bakar" / "Periode Mingguan"
  metrics: [Metric, Metric, Metric]; // Biaya, Kuantitas, Total emisi
  banner?: { label: string; value: string; }; // "Total Emisi", "2.500 kg CO₂e"
  details?: DetailRow[];     // opsional (sampah/makanan)
  detailsLabel?: string;     // "Lihat detail sampah"
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ReportCard({
  icon, title, dateText, subtitle, metrics,
  banner, details, detailsLabel = "Lihat detail", onEdit, onDelete,
}: ReportCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-start gap-3">
        <div className="h-10 w-10 shrink-0 rounded-lg bg-emerald-50 grid place-items-center">
          {icon ?? "🧾"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">{title}</div>
          <div className="text-xs text-gray-600">{dateText}</div>
          {subtitle && <div className="text-xs text-gray-600">{subtitle}</div>}
        </div>
      </div>

      {/* Banner Total Emisi (opsional) */}
      {banner && (
        <div className="my-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm">
          <div className="flex items-center justify-between">
            <span>{banner.label}</span>
            <strong>{banner.value}</strong>
          </div>
        </div>
      )}

      {/* Metrics 3 kolom */}
      <dl className="grid grid-cols-3 gap-3 text-sm">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="text-gray-500">{m.label}</dt>
            <dd className="font-medium">{m.value}</dd>
          </div>
        ))}
      </dl>

      {/* Accordion detail (opsional) */}
      {details && details.length > 0 && (
        <>
          <button
            className="mt-3 w-full rounded-lg bg-gray-50 px-3 py-2 text-left text-sm"
            onClick={() => setOpen(!open)}
          >
            {detailsLabel} {open ? "▴" : "▾"}
          </button>
          {open && (
            <div className="mt-2 space-y-2 text-sm">
              {details.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{d.label}</div>
                    {d.qty && <div className="text-gray-500">{d.qty}</div>}
                  </div>
                  {d.right && (
                    <div className="rounded-full bg-emerald-50 px-2 py-1">{d.right}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="mt-3 border-t pt-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onEdit}
            className="rounded-xl bg-emerald-50 py-2 font-medium text-emerald-700"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete?.()}
            className="rounded-xl bg-red-50 py-2 font-medium text-red-700"
          >
            🗑️ Hapus
          </button>
        </div>
      </div>
    </article>
  );
}
