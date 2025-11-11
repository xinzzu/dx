"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { formatDateID, nf } from "@/lib/format";
import { formatIDR } from "@/utils/currency";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Button from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api/client";

// ==== Types (UI) ====
export type TransportReportResponse = {
  id: string;
  report_date: string;        // ISO
  vehicle_asset_id?: string;
  total_cost_rp: number;
};
type TransportListItem = TransportReportResponse & {
  asset_name?: string;
  total_liter?: number;
  emission_kgco2e?: number;
};

// ==== Types (BE) ====
type BackendRow = {
  id?: string;
  vehicle_name?: string;
  report_date?: string;
  total_co2e?: number;
  total_cost?: number;
  total_fuel_consumed?: number;
  fuel_unit?: string;         // "liter", dll
  vehicle_asset_id?: string;
};

type BackendResponse = {
  reqId?: string;
  meta?: { success?: boolean; message?: string };
  data?: BackendRow[];
};

// ==== Card ====
type TransportCardProps = {
  data: TransportListItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

function TransportCard({ data, onEdit, onDelete }: TransportCardProps) {
  return (
    <article className="rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="mb-2 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-lg">
          <Image
            src="/images/catat/laporan/transportasi/transportasi.png"
            alt="Vehicle Icon"
            width={24}
            height={24}
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">
            {data.asset_name ?? "Nama Kendaraan"}
          </div>
          <div className="text-xs text-gray-600">{formatDateID(data.report_date)}</div>
          <div className="text-xs text-gray-600">Konsumsi Bahan Bakar</div>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Biaya</dt>
          <dd className="font-medium">{formatIDR(data.total_cost_rp ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Total liter</dt>
          <dd className="font-medium">{nf(data.total_liter ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Total emisi</dt>
          <dd className="font-semibold">{`${nf(data.emission_kgco2e ?? 0)} kg CO₂e`}</dd>
        </div>
      </dl>

      <div className="my-3 h-px w-full bg-gray-200" />

      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
          onClick={() => onEdit(data.id)}
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
          onClick={() => onDelete(data.id)}
        >
          <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
            <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-1 0v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7h10" />
          </svg>
          Hapus
        </Button>
      </div>
    </article>
  );
}

// ==== Page ====
export default function TransportReportListPage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [items, setItems] = useState<TransportListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = await getIdToken();
        if (!token) {
          if (mounted) {
            setItems([]);
            setErr("Autentikasi diperlukan untuk melihat laporan.");
          }
          return;
        }

        // NOTE:
        // Jika baseURL fetchWithAuth kamu TIDAK otomatis menambahkan `/api/v1`,
        // ubah path di bawah ini menjadi "/api/v1/me/reports/transportation".
  // fetchWithAuth returns the `data` payload directly (see src/lib/api/client.ts)
  // so the result here is already BackendRow[] (not an object with .data)
  const res = await fetchWithAuth<BackendRow[]>("/me/reports/transportation", token);

  const rows = (res ?? []) as BackendRow[];

        const mapped: TransportListItem[] = rows.map((r, idx) => {
          // synthetic id kalau BE belum kirim id
          const id = r.id ?? encodeURIComponent(`${r.report_date ?? ""}-${r.vehicle_name ?? ""}-${idx}`);
          return {
            id,
            vehicle_asset_id: r.vehicle_asset_id ?? "",
            report_date: r.report_date ?? new Date().toISOString(),
            total_cost_rp: Number(r.total_cost ?? 0),
            asset_name: r.vehicle_name ?? "Kendaraan",
            total_liter: Number(r.total_fuel_consumed ?? 0),
            emission_kgco2e: Number(r.total_co2e ?? 0),
          };
        });

        if (mounted) setItems(mapped);
      } catch (e) {
        console.error("Load transport reports failed:", e);
        if (mounted) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [getIdToken]);

  const data = useMemo(() => items ?? [], [items]);

  const handleEdit = (id: string) => {
    // sementara: arahkan ke form transport lama dengan query ?report_id
    // (nanti kalau sudah ada endpoint detail & route edit: ganti ke /app/catat/laporan/transportasi/[id]/edit)
    router.push(`/app/catat/transportasi?report_id=${id}`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus laporan ini?")) {
      // TODO: panggil DELETE ke BE jika tersedia.
      setItems((prev) => (prev ?? []).filter((x) => x.id !== id));
    }
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Transportasi"
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
        {loading && <p className="text-sm text-gray-600">Memuat…</p>}
        {err && <p className="text-sm text-red-600">{err}</p>}

        {!loading && !err && (
          <div className="space-y-4">
            {data.map((it) => (
              <TransportCard
                key={it.id}
                data={it}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}

            {items !== null && items.length === 0 && (
              <p className="text-sm text-gray-600">Belum ada laporan.</p>
            )}
          </div>
        )}
      </div>
    </ScrollContainer>
  );
}
