"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { formatDateID, nf } from "@/lib/format";
import { formatIDR } from "@/utils/currency";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Button from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api/client";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

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
  report_id?: string;
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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
          <dd className="font-semibold">
            {/* {`${nf(data.emission_kgco2e ?? 0)} kg CO₂e`} */}
            {formatCarbonFootprint(data.emission_kgco2e ?? 0).value}{" "}
            {formatCarbonFootprint(data.emission_kgco2e ?? 0).unit}
          </dd>
        </div>
      </dl>

      <div className="my-3 h-px w-full bg-gray-200" />

      <div className="grid grid-cols-2 gap-3">
        {onEdit ? (
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
        ) : (
          <div />
        )}

        {onDelete ? (
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
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}

// ==== Page ====
export default function TransportReportListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || null;
  const { getIdToken } = useAuth();

  const [items, setItems] = useState<TransportListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [disableActions, setDisableActions] = useState(false);

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

        // If we have a `prefillMonth` query parameter, prefer the by-month
        // endpoint so we show historical month data exactly as in Riwayat.
        // e.g. /me/reports/transportation/by-month?year=2025&month=10
        const prefillMonth = searchParams.get("prefillMonth");
        const currentIso = (() => {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })();

        let rows: BackendRow[] = [];
        const prefillReportId = searchParams.get("prefillReportId");
        if (prefillMonth) {
          // parse YYYY-MM
          const [yStr, mStr] = prefillMonth.split("-");
          const year = Number(yStr || NaN);
          const month = Number(mStr || NaN);
          if (!Number.isFinite(year) || !Number.isFinite(month)) {
            // fallback to list endpoint
            const res = await fetchWithAuth<BackendRow[]>("/me/reports/transportation", token);
            rows = (res ?? []) as BackendRow[];
          } else {
            // First try the by-month endpoint so we surface ALL reports for
            // that month (matches Postman). Only if by-month returns empty
            // and a prefillReportId exists, fetch the single report as fallback.
            try {
              const path = `/me/reports/transportation/by-month?year=${year}&month=${month}`;
              // fetchWithAuth returns `json.data` from the API. Accept both
              // shapes: array or wrapper { data: [...] } by requesting
              // `unknown` and narrowing at runtime.
              const resUnknown = await fetchWithAuth<unknown>(path, token);
              if (Array.isArray(resUnknown)) {
                rows = resUnknown as BackendRow[];
              } else if (resUnknown && typeof resUnknown === "object" && Array.isArray((resUnknown as { data?: unknown }).data)) {
                rows = (resUnknown as { data?: unknown }).data as BackendRow[];
              } else {
                rows = [];
              }
            } catch (e) {
              // If by-month fails, try full list as fallback
              const res = await fetchWithAuth<BackendRow[]>("/me/reports/transportation", token);
              rows = (res ?? []) as BackendRow[];
            }

            // If by-month returned nothing but we have a specific report id,
            // try fetching that single report so we still show the referenced
            // item (some backends might return the single report endpoint only).
            if ((rows.length === 0 || !rows) && prefillReportId) {
              try {
                const singlePath = `/me/reports/transportation/${encodeURIComponent(prefillReportId)}`;
                const singleRes = await fetchWithAuth<unknown>(singlePath, token);
                if (singleRes) {
                  if (Array.isArray(singleRes)) rows = singleRes as BackendRow[];
                  else if (singleRes && typeof singleRes === "object" && Array.isArray((singleRes as { data?: unknown }).data)) rows = (singleRes as { data?: unknown }).data as BackendRow[];
                  else if (singleRes && typeof singleRes === "object") rows = [singleRes as BackendRow];
                }
              } catch (e) {
                // ignore and keep whatever rows we have
              }
            }
          }

          // disable actions when viewing a historical month (prefillMonth != current)
          setDisableActions(prefillMonth !== currentIso);
        } else {
          // No prefill: show current list and allow edit/delete
          const res = await fetchWithAuth<BackendRow[]>("/me/reports/transportation", token);
          rows = (res ?? []) as BackendRow[];
          setDisableActions(false);
        }


        const mapped: TransportListItem[] = rows.map((r, idx) => {
          // Backend may use `report_id` or `id` depending on endpoint
          const reportId = r.report_id as string | undefined;
          const id = reportId ?? r.id ?? encodeURIComponent(`${r.report_date ?? ""}-${r.vehicle_name ?? ""}-${idx}`);
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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<TransportListItem | null>(null);

  const handleEdit = (id: string) => {
    // Navigate to the dedicated edit page (uses route we created)
    router.push(`/app/catat/laporan/transportasi/${encodeURIComponent(id)}/edit`);
  };

  const handleDelete = (id: string) => {
    const it = (items ?? []).find((x) => x.id === id) ?? null;
    setSelectedReport(it);
    setDeleteOpen(true);
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Transportasi"
      leftContainer={
        <button
          onClick={() => {
            // If we arrived from Riwayat, go back to Riwayat. Otherwise go to Catat.
            try {
              if (from === "riwayat") router.push("/app/catat/riwayat");
              else router.push("/app/catat/");
            } catch {
              router.push("/app/catat/");
            }
          }}
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
                onEdit={disableActions ? undefined : handleEdit}
                onDelete={disableActions ? undefined : handleDelete}
              />
            ))}

            {items !== null && items.length === 0 && (
              <p className="text-sm text-gray-600">Belum ada laporan.</p>
            )}
          </div>
        )}
      </div>
      <ConfirmDeleteModal
        open={deleteOpen}
        reportId={selectedReport?.id ?? null}
        kind="transportation"
        onCancel={() => {
          setDeleteOpen(false);
          setSelectedReport(null);
        }}
        onDeleted={() => {
          if (!selectedReport) return;
          setItems((prev) => (prev ?? []).filter((x) => x.id !== selectedReport.id));
        }}
        meta={
          selectedReport
            ? [
              { label: "Tanggal", value: formatDateID(selectedReport.report_date) },
              { label: "Kendaraan", value: selectedReport.asset_name ?? "-" },
            ]
            : []
        }
      />
    </ScrollContainer>
  );
}
