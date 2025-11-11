"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Button from "@/components/ui/Button";
import { formatDateID, nf } from "@/lib/format";
import useAuth from "@/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api/client";

// ===== Types =====
type WasteDetail = {
  id: string;
  name: string; // contoh: "Plastik"
  amount_kg: number; // berat sampah (kg)
  emission_kgco2e: number; // emisi per kategori
};

type WasteReportItem = {
  id: string;
  report_date: string; // ISO
  period: "weekly" | "monthly";
  total_emission_kgco2e: number;
  details: WasteDetail[];
};

// ===== UI subcomponents =====

function EmissionBadge({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-2 text-emerald-800">
        <Image
          src="/images/catat/laporan/produksi-sampah/co2e.svg"
          alt="Ikon lokal"
          width={20}
          height={20}
          className="h-5 w-5"
        />
        <span className="font-medium text-[#04BF68]">Total Emisi</span>
      </div>
      <div className="text-right font-semibold text-[#04BF68]">
        {nf(value)}{" "}
        <span className="text-xs font-normal text-[#04BF68]">kg CO₂e</span>
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${
        open ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function WasteCard({
  data,
  onEdit,
  onDelete,
}: {
  data: WasteReportItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-2xl border border-gray-200 p-4 shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-lg">
          <Image
            src="/images/catat/laporan/produksi-sampah/sampah.png"
            alt="Vehicle Icon"
            width={24}
            height={24}
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">Laporan</div>
          <div className="text-xs text-gray-600">
            {formatDateID(data.report_date)}
          </div>
          <div className="text-xs text-gray-600">
            Periode {data.period === "weekly" ? "Mingguan" : "Bulanan"}
          </div>
        </div>
      </div>

      {/* Total Emisi */}
      <EmissionBadge value={data.total_emission_kgco2e} />

      {/* Toggle details */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex w-full items-center justify-between rounded-xl border border-gray-200 px-3 py-2 text-left text-sm text-gray-700"
      >
        <span>Lihat detail sampah</span>
        <Chevron open={open} />
      </button>

      {/* Details */}
      {open && (
        <div className="mt-3 space-y-3">
          {data.details.map((d) => (
            <div key={d.id} className="flex items-start justify-between">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-gray-600">
                  {nf(d.amount_kg)} kg
                </div>
              </div>
              <div className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-medium text-[#04BF68]">
                {nf(d.emission_kgco2e)} kg CO₂e
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="my-3 h-px w-full bg-gray-200" />

      {/* Actions (Edit / Hapus) */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
          onClick={() => onEdit(data.id)}
        >
          <svg
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M12 20h9M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
          </svg>
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          className="!bg-red-50 !border-red-200 !text-red-600"
          onClick={() => onDelete(data.id)}
        >
          <svg
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" />
          </svg>
          Hapus
        </Button>
      </div>
    </article>
  );
}

// ===== Page (dummy) =====

export default function WasteReportListPage() {
  const router = useRouter();
  const [items, setItems] = useState<WasteReportItem[] | null>(null);
  const { getIdToken } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadWasteReports() {
      setItems(null);
      try {
        const firebaseToken = await getIdToken();
        if (!firebaseToken) {
          if (mounted) setItems([]);
          return;
        }

        const res = await fetchWithAuth(`/me/reports/waste`, firebaseToken);
        const reports = Array.isArray(res) ? (res as unknown[]) : (res || []) as unknown[];

        const mapped: WasteReportItem[] = reports.map((r, ri) => {
          const rec = (r ?? {}) as Record<string, unknown>;
          const id = typeof rec.report_id === "string" ? rec.report_id : `waste-${ri}`;
          const report_date = typeof rec.report_date === "string" ? rec.report_date : new Date().toISOString();
          const period = typeof rec.report_type === "string" && rec.report_type === "weekly" ? "weekly" : "monthly";
          const total = typeof rec.total_co2e === "number" ? rec.total_co2e : Number((rec.total_co2e as unknown) ?? 0) || 0;

          const detailsRaw = Array.isArray(rec.waste_details) ? (rec.waste_details as unknown[]) : [];
          const details: WasteDetail[] = detailsRaw.map((wd, idx) => {
            const d = (wd ?? {}) as Record<string, unknown>;
            const name = typeof d.waste_type === "string" ? d.waste_type : "";
            const amount = typeof d.weight_kg === "number" ? d.weight_kg : Number(d.weight_kg as unknown) || 0;
            const emission = typeof d.total_co2e === "number" ? d.total_co2e : Number((d.total_co2e as unknown) ?? 0) || 0;
            return {
              id: `${id}-${idx}`,
              name,
              amount_kg: amount,
              emission_kgco2e: emission,
            };
          });

          return {
            id,
            report_date,
            period,
            total_emission_kgco2e: Number(total),
            details,
          };
        });

        if (mounted) setItems(mapped);
      } catch (err) {
        console.error("Failed to load waste reports", err);
        if (mounted) setItems([]);
      }
    }

    loadWasteReports();

    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  const data = useMemo(() => items ?? [], [items]);

  const handleEdit = (id: string) => {
    router.push(`/app/catat/produksi-sampah?report_id=${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus laporan ini?")) {
      setItems((prev) => (prev ?? []).filter((x) => x.id !== id));
    }
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Produksi Sampah"
      leftContainer={
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }
    >
      <div className="px-4 pb-24">
        <div className="space-y-4">
          {data.map((it) => (
            <WasteCard
              key={it.id}
              data={it}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {items === null && <p>Memuat…</p>}
          {items?.length === 0 && (
            <p className="text-sm text-gray-600">Belum ada laporan.</p>
          )}
        </div>
      </div>
    </ScrollContainer>
  );
}
