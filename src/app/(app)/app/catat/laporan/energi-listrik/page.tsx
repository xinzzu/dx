"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Button from "@/components/ui/Button";
import { formatDateID, nf } from "@/lib/format";
import { formatIDR } from "@/utils/currency";
import useAuth from "@/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api/client";

// ===== Types =====
export type ElectricityReportResponse = {
  id: string;
  report_date: string;          // ISO
  building_asset_id: string;
  total_cost_rp: number;
  total_kwh: number;
  emission_kgco2e: number;
};

type ElectricityListItem = ElectricityReportResponse & {
  asset_name?: string;          // nama bangunan
  // Energi bersih (opsional)
  clean_type?: string;          // misal: "Surya", "Angin"
  clean_generated_kwh?: number; // kWh dihasilkan
};

// ===== Card =====
function ElectricityCard({
  data,
  onEdit,
  onDelete,
}: {
  data: ElectricityListItem;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const showClean = data.clean_type && (data.clean_generated_kwh ?? 0) > 0;

  return (
    <article className="rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="mb-2 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-lg">
                  <Image src="/images/catat/laporan/energi-listrik/energi-listrik.png" alt="Vehicle Icon" width={24} height={24} />
                </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">
            {data.asset_name ?? "Nama Bangunan"}
          </div>
          <div className="text-xs text-gray-600">{formatDateID(data.report_date)}</div>
          <div className="text-xs text-gray-600">Konsumsi Listrik</div>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <dt className="text-gray-500">Biaya</dt>
          <dd className="font-medium">{formatIDR(data.total_cost_rp ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Total kWh</dt>
          <dd className="font-medium">{nf(data.total_kwh ?? 0)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Total emisi</dt>
          <dd className="font-semibold">{`${nf(data.emission_kgco2e ?? 0)} kg CO₂e`}</dd>
        </div>
      </dl>

      {/* Energi bersih (opsional) */}
      {showClean && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="mb-2 flex items-center gap-2 font-medium text-emerald-800">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-lg">
                  <Image src="/images/catat/laporan/energi-listrik/energi-bersih.svg" alt="Vehicle Icon" width={24} height={24} />
                </div>
            Energi Bersih
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-gray-500">Jenis</div>
              <div className="font-medium">{data.clean_type}</div>
            </div>
            <div>
              <div className="text-gray-500">Dihasilkan</div>
              <div className="font-medium">{nf(data.clean_generated_kwh ?? 0)} kWh</div>
            </div>
          </div>
        </div>
      )}

      <div className="my-3 h-px w-full bg-gray-200" />

      {/* Aksi: pakai Button & ikon seperti manajemen bangunan */}
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

// ===== Page (dummy) =====
export default function ElectricityReportListPage() {
  const router = useRouter();
  const { getIdToken } = useAuth();
  const [items, setItems] = useState<ElectricityListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          setItems([]);
          setError("Autentikasi diperlukan untuk melihat laporan.");
          return;
        }

        const resp = await fetchWithAuth<Array<{
          building_name: string;
          report_date: string;
          electricity_cost: number;
          total_kwh: number;
          total_co2e_produced: number;
        }>>('/me/reports/electricity', token);

        // Map backend shape -> ElectricityListItem used by UI
        const mapped: ElectricityListItem[] = (resp ?? []).map((r, idx) => {
          const rr = r as Record<string, unknown>;
          // optional clean energy: either nested `clean_energy` or flat fields
          let clean_type: string | undefined = undefined;
          let clean_generated_kwh: number | undefined = undefined;

          const maybeCe = rr['clean_energy'];
          if (maybeCe && typeof maybeCe === 'object') {
            const ceObj = maybeCe as Record<string, unknown>;
            clean_type = ceObj['type'] as string | undefined;
            const produced = ceObj['energy_produced'];
            if (typeof produced === 'number') clean_generated_kwh = produced;
          } else {
            // fallbacks
            clean_type = (rr['clean_energy_type'] as string) ?? (rr['clean_type'] as string) ?? undefined;
            const produced = rr['produced_kwh'] ?? rr['clean_generated_kwh'];
            if (typeof produced === 'number') clean_generated_kwh = produced as number;
          }

          return {
            // Prefer backend `report_id` when available. Fallback to `id` or a composed key with index to guarantee uniqueness.
            id: (rr['report_id'] as string) ?? (rr['id'] as string) ?? `${rr['report_date'] as string}-${rr['building_name'] as string}-${idx}`,
            building_asset_id: String(rr['building_asset_id'] ?? ''),
            report_date: rr['report_date'] as string,
            total_cost_rp: Number(rr['electricity_cost'] ?? rr['total_cost_rp'] ?? 0),
            total_kwh: Number(rr['total_kwh'] ?? 0),
            emission_kgco2e: Number(rr['total_co2e_produced'] ?? rr['emission_kgco2e'] ?? 0),
            asset_name: (rr['building_name'] as string) ?? (rr['asset_name'] as string) ?? 'Nama Bangunan',
            clean_type,
            clean_generated_kwh,
          };
        });

        if (mounted) setItems(mapped);
      } catch (e: unknown) {
        console.error('Load electricity reports failed', e);
        if (mounted) setError((e as Error)?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [getIdToken]);

  const data = useMemo(() => items ?? [], [items]);

  const handleEdit = (id: string) => {
    // Navigate to the dedicated edit page which expects the id as route param
    router.push(`/app/catat/laporan/energi-listrik/${encodeURIComponent(id)}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus laporan ini?")) {
      setItems((prev) => (prev ?? []).filter((x) => x.id !== id));
    }
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Energi Listrik"
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
          {loading && <p>Memuat…</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {!loading && data.length === 0 && (
            <p className="text-sm text-gray-600">Belum ada laporan.</p>
          )}

          {data.map((it) => (
            <ElectricityCard
              key={it.id}
              data={it}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </ScrollContainer>
  );
}
