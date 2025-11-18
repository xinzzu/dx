"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Button from "@/components/ui/Button";
import { formatDateID, nf } from "@/lib/format";
import useAuth from "@/hooks/useAuth";
import { fetchWithAuth } from "@/lib/api/client";
import { toast } from "sonner";
import ConfirmDeleteModal from "@/components/ui/ConfirmDeleteModal";
import { wasteService } from "@/services/waste";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

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
        {/* {nf(value)}{" "}
        <span className="text-xs font-normal text-[#04BF68]">kg CO₂e</span> */}
        {formatCarbonFootprint(value ?? 0).value}{" "}
        <span className="text-xs font-normal text-[#04BF68]">{formatCarbonFootprint(value ?? 0).unit}</span>
      </div>
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-4 w-4 transition-transform ${open ? "rotate-180" : "rotate-0"
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
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
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
            Periode {data.period === "weekly" ? "mingguan" : "bulanan"}
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
                  {/* {nf(d.amount_kg)} kg */}
                  {formatCarbonFootprint(d.amount_kg).value} {formatCarbonFootprint(d.amount_kg).unit}
                </div>
              </div>
              <div className="rounded-md bg-emerald-50 px-2 py-1 text-sm font-medium text-[#04BF68]">
                {/* {nf(d.emission_kgco2e)} kg CO₂e */}
                {formatCarbonFootprint(d.emission_kgco2e).value} {formatCarbonFootprint(d.emission_kgco2e).unit}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="my-3 h-px w-full bg-gray-200" />

      {/* Actions (Edit / Hapus) */}
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

export default function WasteReportListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || null;
  const [items, setItems] = useState<WasteReportItem[] | null>(null);
  const { getIdToken } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [disableActions, setDisableActions] = useState(false);
  const [noPrefillData, setNoPrefillData] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWasteReports() {
      setItems(null);
      try {
        // Prefer backend access token; exchange firebase token when needed
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const firebaseToken = await getIdToken();
          if (!firebaseToken) {
            if (mounted) setItems([]);
            return;
          }
          token = await authService.loginWithGoogle(firebaseToken);
          try {
            authService.saveToken(token);
          } catch { }
        }

        const prefillMonth = searchParams.get("prefillMonth");
        const prefillReportId = searchParams.get("prefillReportId") || null;

        let reportsRaw: unknown[] = [];

        if (prefillMonth) {
          // if user came from riwayat, prefer the by-month endpoint and do not fall back to current-month
          const nowIso = new Date().toISOString().slice(0, 7); // YYYY-MM
          setDisableActions(prefillMonth !== nowIso);

          const [y, m] = prefillMonth.split("-");
          const year = Number(y || 0);
          const month = Number(m || 0);

          const byMonthRes = await fetchWithAuth(`/me/reports/waste/by-month?year=${year}&month=${month}`, token);
          if (Array.isArray(byMonthRes)) {
            reportsRaw = byMonthRes as unknown[];
          } else if (byMonthRes && typeof byMonthRes === "object" && Array.isArray((byMonthRes as Record<string, unknown>).data)) {
            reportsRaw = (byMonthRes as Record<string, unknown>).data as unknown[];
          } else {
            reportsRaw = [];
          }

          // if by-month is empty and we have a prefillReportId, try single-report fetch
          if (reportsRaw.length === 0 && prefillReportId) {
            try {
              const single = await fetchWithAuth(`/me/reports/waste/${encodeURIComponent(prefillReportId)}`, token);
              if (single) {
                reportsRaw = [single as unknown];
              }
            } catch {
              // ignore
            }
          }
        } else {
          const res = await fetchWithAuth(`/me/reports/waste`, token);
          if (Array.isArray(res)) reportsRaw = res as unknown[];
          else if (res && typeof res === "object" && Array.isArray((res as Record<string, unknown>).data)) reportsRaw = (res as Record<string, unknown>).data as unknown[];
          else reportsRaw = [];
        }

        // Backend returns an array of report objects without `report_id`.
        // Use `report_date` as the unique identifier (same as food reports flow)
        const mapped: WasteReportItem[] = reportsRaw.map((r, ri) => {
          const rec = (r ?? {}) as Record<string, unknown>;
          const report_date = typeof rec.report_date === "string" ? rec.report_date : new Date().toISOString().split("T")[0];
          const id = report_date; // unique per user per date
          const period = typeof rec.report_type === "string" && rec.report_type === "weekly" ? "weekly" : "monthly";
          const total = typeof rec.total_co2e === "number" ? rec.total_co2e : Number((rec.total_co2e as unknown) ?? 0) || 0;

          // Backend uses `items` array (see API example) with fields: weight_kg, total_co2e, waste_type
          const detailsRaw = Array.isArray(rec.items) ? (rec.items as unknown[]) : [];
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

        if (mounted) {
          setItems(mapped);
          // If user specifically requested a month (prefillMonth) and there are no reports,
          // mark noPrefillData so the UI shows only the "Belum ada laporan." message.
          if (prefillMonth && mapped.length === 0) setNoPrefillData(true);
          else setNoPrefillData(false);
        }
      } catch (err) {
        console.error("Failed to load waste reports", err);
        if (mounted) setItems([]);
      }
    }

    loadWasteReports();

    return () => {
      mounted = false;
    };
  }, [getIdToken, searchParams]);

  const data = useMemo(() => items ?? [], [items]);

  // Keep same edit flow as food reports: pass report_date as query param
  const handleEdit = (reportDate: string) => {
    const params = new URLSearchParams({ report_date: reportDate });
    router.push(`/app/catat/laporan/produksi-sampah/edit?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    // clear any previous delete error and open confirm modal
    setDeleteError(null);
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Autentikasi hilang");

      // compute friendly label before mutating state
      const prev = items ?? [];
      const found = prev.find((x) => x.id === deletingId);
      const label = found
        ? `${formatDateID(found.report_date)}${found.details?.[0]?.name ? ` — ${found.details[0].name}` : ""}`
        : deletingId;

      // If id looks like a date (YYYY-MM-DD), use DELETE /me/reports/waste/by-date/{date}
      const dateLike = /^\d{4}-\d{2}-\d{2}$/.test(deletingId);
      if (dateLike) {
        await fetchWithAuth(`/me/reports/waste/by-date/${encodeURIComponent(deletingId)}`, token, { method: "DELETE" });
      } else {
        await wasteService.deleteReport(deletingId, token);
      }

      // remove from local list
      setItems((prev) => (prev ?? []).filter((x) => x.id !== deletingId));
      setDeletingId(null);

      try {
        toast.success(`Laporan ${label} berhasil dihapus`);
      } catch { }
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteError(null);
    setDeletingId(null);
  };

  return (
    <ScrollContainer
      headerTitle="Laporan Produksi Sampah"
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
        {deleteError ? (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-3 text-red-700">
            {deleteError}
          </div>
        ) : null}
        <div className="space-y-4">
          {items === null && <p>Memuat…</p>}

          {noPrefillData ? (
            <p className="text-sm text-gray-600">Belum ada laporan.</p>
          ) : (
            <>
              {data.map((it) => (
                <WasteCard
                  key={it.id}
                  data={it}
                  onEdit={disableActions ? undefined : handleEdit}
                  onDelete={disableActions ? undefined : handleDelete}
                />
              ))}

              {items?.length === 0 && (
                <p className="text-sm text-gray-600">Belum ada laporan.</p>
              )}
            </>
          )}
        </div>
      </div>
      <ConfirmDeleteModal
        open={Boolean(deletingId)}
        title="Hapus Laporan Produksi Sampah"
        message="Laporan akan dihapus secara permanen. Anda tidak dapat mengembalikan data ini."
        dangerLabel="Hapus"
        cancelLabel="Batal"
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        meta={
          deletingId
            ? [
              {
                label: "Tanggal",
                value:
                  (items ?? []).find((x) => x.id === deletingId)
                    ?.report_date ?? deletingId,
              },
            ]
            : []
        }
      />
    </ScrollContainer>
  );
}
