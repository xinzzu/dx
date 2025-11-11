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
type FoodDetail = {
  id: string;
  name: string; // ex: "Telur"
  frequency_label: string; // ex: "4–5 kali seminggu"
  emission_kgco2e: number; // emisi per item
};

type FoodReportItem = {
  id: string;
  report_date: string; // ISO
  period: "weekly" | "monthly";
  total_emission_kgco2e: number;
  details: FoodDetail[];
};

// ===== UI subcomponents =====
function EmissionBadge({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
      <div className="flex items-center gap-2 text-emerald-800">
        <Image
          src="/images/catat/laporan/konsumsi-makanan/co2e.svg"
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

function FoodCard({
  data,
  onEdit,
  onDelete,
}: {
  data: FoodReportItem;
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
            src="/images/catat/laporan/konsumsi-makanan/makanan.png"
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
        <span>Lihat detail makanan</span>
        <Chevron open={open} />
      </button>

      {/* Details */}
      {open && (
        <div className="mt-3 space-y-4">
          {data.details.map((d) => (
            <div key={d.id} className="flex items-start justify-between">
              <div>
                <div className="font-medium">{d.name}</div>
                <div className="text-sm text-gray-600">{d.frequency_label}</div>
              </div>
              <div className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-medium text-[#04BF68]">
                {nf(d.emission_kgco2e)} kg
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="my-3 h-px w-full bg-gray-200" />

      {/* Actions */}
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
export default function FoodReportListPage() {
  const router = useRouter();
  const [items, setItems] = useState<FoodReportItem[] | null>(null);
  const { getIdToken } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
      setItems(null);
      try {
        const firebaseToken = await getIdToken();
        if (!firebaseToken) {
          // no token — leave items empty
          if (mounted) setItems([]);
          return;
        }

        const res = await fetchWithAuth(`/me/reports/food`, firebaseToken);
        // fetchWithAuth returns the `data` payload already (or throws)
        const reports = Array.isArray(res) ? (res as unknown[]) : (res || []) as unknown[];

        const mapped: FoodReportItem[] = reports.map((r, ri) => {
          const rec = (r ?? {}) as Record<string, unknown>;
          const reportId = typeof rec.report_id === "string" ? rec.report_id : `food-${ri}`;
          const reportDate = typeof rec.report_date === "string" ? rec.report_date : new Date().toISOString();
          const reportType = typeof rec.report_type === "string" ? rec.report_type : "monthly";
          const total = typeof rec.total_co2e === "number" ? rec.total_co2e : Number((rec.total_co2e as unknown) ?? 0) || 0;

          const detailsRaw = Array.isArray(rec.food_details) ? (rec.food_details as unknown[]) : [];
          const details: FoodDetail[] = detailsRaw.map((fd, idx) => {
            const d = (fd ?? {}) as Record<string, unknown>;
            const name = typeof d.food === "string" ? d.food : "";
            const frequencyVal = typeof d.frequency === "number" ? d.frequency : Number(d.frequency as unknown) || 0;
            const freqLabel = frequencyVal ? `${frequencyVal} kali` : "";
            const emission = typeof d.total_co2e === "number" ? d.total_co2e : Number((d.total_co2e as unknown) ?? 0) || 0;
            return {
              id: `${reportId}-${idx}`,
              name,
              frequency_label: freqLabel,
              emission_kgco2e: emission,
            };
          });

          return {
            id: reportId,
            report_date: reportDate,
            period: reportType === "weekly" ? "weekly" : "monthly",
            total_emission_kgco2e: Number(total),
            details,
          };
        });

        if (mounted) setItems(mapped);
      } catch (err) {
        console.error("Failed to load food reports", err);
        if (mounted) setItems([]);
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  const data = useMemo(() => items ?? [], [items]);

  const handleEdit = (id: string) => {
    router.push(`/app/catat/konsumsi-makanan?report_id=${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus laporan ini?")) {
      setItems((prev) => (prev ?? []).filter((x) => x.id !== id));
    }
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Konsumsi Makanan"
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
            <FoodCard
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
