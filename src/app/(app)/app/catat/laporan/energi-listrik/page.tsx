"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Button from "@/components/ui/Button";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { formatDateID, nf } from "@/lib/format";
import { formatIDR } from "@/utils/currency";
import useAuth from "@/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api/client";
import { electricityService } from "@/services/electricity";
import { toast } from "sonner";
import { userFriendlyError } from "@/lib/userError";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

// ===== Types =====
export type ElectricityReportResponse = {
  id: string;
  report_date: string; // ISO
  building_asset_id: string;
  total_cost_rp: number;
  total_kwh: number;
  emission_kgco2e: number;
};

type ElectricityListItem = ElectricityReportResponse & {
  asset_name?: string; // nama bangunan
  // Energi bersih (opsional)
  clean_type?: string; // misal: "Surya", "Angin"
  clean_generated_kwh?: number; // kWh dihasilkan
};

// ===== Card =====
function ElectricityCard({
  data,
  onEdit,
  onDelete,
}: {
  data: ElectricityListItem;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}) {
  const showClean = data.clean_type && (data.clean_generated_kwh ?? 0) > 0;

  return (
    <article className="rounded-2xl border border-gray-200 p-4 shadow-sm">
      <div className="mb-2 flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-lg">
          <Image
            src="/images/catat/laporan/energi-listrik/energi-listrik.png"
            alt="Vehicle Icon"
            width={24}
            height={24}
          />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-semibold">
            {data.asset_name ?? "Nama Bangunan"}
          </div>
          <div className="text-xs text-gray-600">
            {formatDateID(data.report_date)}
          </div>
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
          <dd className="font-semibold">
            {/* {`${nf(
              data.emission_kgco2e ?? 0
            )} kg CO₂e`} */}
            {formatCarbonFootprint(data.emission_kgco2e ?? 0).value}{" "}
            {formatCarbonFootprint(data.emission_kgco2e ?? 0).unit}
          </dd>
        </div>
      </dl>

      {/* Energi bersih (opsional) */}
      {showClean && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
          <div className="mb-2 flex items-center gap-2 font-medium text-emerald-800">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-lg">
              <Image
                src="/images/catat/laporan/energi-listrik/energi-bersih.svg"
                alt="Vehicle Icon"
                width={24}
                height={24}
              />
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
              <div className="font-medium">
                {nf(data.clean_generated_kwh ?? 0)} kWh
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="my-3 h-px w-full bg-gray-200" />

      {/* Aksi: pakai Button & ikon seperti manajemen bangunan */}
      <div className="grid grid-cols-2 gap-3">
        {onEdit ? (
          <Button
            type="button"
            variant="outline"
            className="bg-emerald-50! border-emerald-200! text-emerald-700!"
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
        ) : (
          <div />
        )}

        {onDelete ? (
          <Button
            type="button"
            variant="outline"
            className="bg-red-50! border-red-200! text-red-600!"
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
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}

// ===== Page (dummy) =====
export default function ElectricityReportListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || null;
  const { getIdToken } = useAuth();
  const [items, setItems] = useState<ElectricityListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disableActions, setDisableActions] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selected, setSelected] = useState<ElectricityListItem | null>(null);

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
        // Support Riwayat -> laporan flow: prefer by-month endpoint when
        // `prefillMonth` is provided. Normalize both array and wrapper shapes
        // from the API using unknown narrowing.
        const prefillMonth = searchParams.get("prefillMonth");
        const prefillReportId = searchParams.get("prefillReportId");
        const currentIso = (() => {
          const d = new Date();
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })();

        let rowsUnknown: unknown[] = [];
        if (prefillMonth) {
          const [yStr, mStr] = prefillMonth.split("-");
          const year = Number(yStr || NaN);
          const month = Number(mStr || NaN);
          if (!Number.isFinite(year) || !Number.isFinite(month)) {
            const resp = await fetchWithAuth<unknown>("/me/reports/electricity", token);
            if (Array.isArray(resp)) rowsUnknown = resp as unknown[];
            else if (resp && typeof resp === "object" && Array.isArray((resp as { data?: unknown }).data)) rowsUnknown = (resp as { data?: unknown }).data as unknown[];
            else rowsUnknown = [];
          } else {
            try {
              const path = `/me/reports/electricity/by-month?year=${year}&month=${month}`;
              const byMonth = await fetchWithAuth<unknown>(path, token);
              if (Array.isArray(byMonth)) rowsUnknown = byMonth as unknown[];
              else if (byMonth && typeof byMonth === "object" && Array.isArray((byMonth as { data?: unknown }).data)) rowsUnknown = (byMonth as { data?: unknown }).data as unknown[];
              else rowsUnknown = [];
            } catch (e) {
              const resp = await fetchWithAuth<unknown>("/me/reports/electricity", token);
              if (Array.isArray(resp)) rowsUnknown = resp as unknown[];
              else if (resp && typeof resp === "object" && Array.isArray((resp as { data?: unknown }).data)) rowsUnknown = (resp as { data?: unknown }).data as unknown[];
              else rowsUnknown = [];
            }

            if ((rowsUnknown.length === 0 || !rowsUnknown) && prefillReportId) {
              try {
                const singlePath = `/me/reports/electricity/${encodeURIComponent(prefillReportId)}`;
                const single = await fetchWithAuth<unknown>(singlePath, token);
                if (single) {
                  if (Array.isArray(single)) rowsUnknown = single as unknown[];
                  else if (single && typeof single === "object" && Array.isArray((single as { data?: unknown }).data)) rowsUnknown = (single as { data?: unknown }).data as unknown[];
                  else if (single && typeof single === "object") rowsUnknown = [single as unknown];
                }
              } catch {
                // ignore
              }
            }

            setDisableActions(prefillMonth !== currentIso);
          }
        } else {
          const resp = await fetchWithAuth<unknown>("/me/reports/electricity", token);
          if (Array.isArray(resp)) rowsUnknown = resp as unknown[];
          else if (resp && typeof resp === "object" && Array.isArray((resp as { data?: unknown }).data)) rowsUnknown = (resp as { data?: unknown }).data as unknown[];
          else rowsUnknown = [];
          setDisableActions(false);
        }

        // Map backend shape -> ElectricityListItem used by UI
        const mapped: ElectricityListItem[] = (rowsUnknown ?? []).map((r, idx) => {
          const rr = (r ?? {}) as Record<string, unknown>;
          // optional clean energy: either nested `clean_energy` or flat fields
          let clean_type: string | undefined = undefined;
          let clean_generated_kwh: number | undefined = undefined;

          const maybeCe = rr["clean_energy"];
          if (maybeCe && typeof maybeCe === "object") {
            const ceObj = maybeCe as Record<string, unknown>;
            clean_type = ceObj["type"] as string | undefined;
            const produced = ceObj["energy_produced"];
            if (typeof produced === "number") clean_generated_kwh = produced;
          } else {
            // fallbacks
            clean_type =
              ((rr["clean_energy_type"] as string) ??
                (rr["clean_type"] as string)) ??
              undefined;
            const produced = rr["produced_kwh"] ?? rr["clean_generated_kwh"];
            if (typeof produced === "number")
              clean_generated_kwh = produced as number;
          }

          return {
            // Prefer backend `report_id` when available. Fallback to `id` or a composed key with index to guarantee uniqueness.
            id:
              (rr["report_id"] as string) ??
              (rr["id"] as string) ??
              `${(rr["report_date"] as string) ?? "unknown"}-${(rr["building_name"] as string) ?? "unknown"}-${idx}`,
            building_asset_id: String(rr["building_asset_id"] ?? ""),
            report_date: (rr["report_date"] as string) ?? new Date().toISOString(),
            total_cost_rp: Number(rr["electricity_cost"] ?? rr["total_cost_rp"] ?? 0),
            total_kwh: Number(rr["total_kwh"] ?? 0),
            emission_kgco2e: Number(rr["total_co2e_produced"] ?? rr["emission_kgco2e"] ?? 0),
            asset_name: (rr["building_name"] as string) ?? (rr["asset_name"] as string) ?? "Nama Bangunan",
            clean_type,
            clean_generated_kwh,
          };
        });

        if (mounted) setItems(mapped);
      } catch (e: unknown) {
        console.error("Load electricity reports failed", e);
        if (mounted) setError(userFriendlyError(e, "Gagal memuat laporan listrik."));
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
    router.push(
      `/app/catat/laporan/energi-listrik/${encodeURIComponent(id)}/edit`
    );
  };

  const handleDelete = (id: string) => {
    const it = (items ?? []).find((x) => x.id === id) ?? null;
    setSelected(it);
    setDeleteOpen(true);
  };

  const doDelete = async () => {
    if (!selected) return;
    setDeleteLoading(true);
    try {
      const token = await getIdToken();
      await electricityService.deleteReport(selected.id, token);
      setItems((prev) => (prev ?? []).filter((x) => x.id !== selected.id));
      setDeleteOpen(false);
      // Show success toast including the building name when available
      try {
        const name = selected.asset_name ?? selected.building_asset_id ?? selected.id;
        toast.success(`Laporan "${name}" berhasil dihapus`);
      } catch { }
      setSelected(null);
    } catch (e: unknown) {
      console.error("Delete electricity report failed", e);
      // show simple error to user
      toast.error(userFriendlyError(e, "Gagal menghapus laporan listrik."));
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Energi Listrik"
      leftContainer={
        <button
          onClick={() => {
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
              onEdit={disableActions ? undefined : handleEdit}
              onDelete={disableActions ? undefined : handleDelete}
            />
          ))}
        </div>
      </div>
      <ConfirmDeleteModal
        open={deleteOpen}
        title="Hapus Laporan Energi Listrik"
        message="Tindakan ini akan menghapus laporan listrik Anda. Proses ini tidak dapat dibatalkan."
        dangerLabel="Hapus"
        cancelLabel="Batal"
        onCancel={() => {
          setDeleteOpen(false);
          setSelected(null);
        }}
        onConfirm={doDelete}
        loading={deleteLoading}
        meta={
          selected
            ? [
              { label: "Tanggal", value: formatDateID(selected.report_date) },
              { label: "Bangunan", value: selected.asset_name ?? "-" },
            ]
            : []
        }
      />
    </ScrollContainer>
  );
}