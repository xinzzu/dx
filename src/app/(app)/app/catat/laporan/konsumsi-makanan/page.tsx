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
import { deleteFoodReport } from "@/services/food";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

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

function FoodCard({
  data,
  onEdit,
  onDelete,
}: {
  data: FoodReportItem;
  onEdit?: (reportDate: string, reportType: string) => void;
  onDelete?: (id: string) => void;
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
            {onEdit ? (
              <Button
                type="button"
                variant="outline"
                className="bg-emerald-50! border-emerald-200! text-emerald-700!"
                onClick={() => onEdit(data.report_date, data.period)}
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
export default function FoodReportListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || null;
  const [items, setItems] = useState<FoodReportItem[] | null>(null);
  const { getIdToken } = useAuth();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [disableActions, setDisableActions] = useState(false);
  const [noPrefillData, setNoPrefillData] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadReports() {
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
          try { authService.saveToken(token); } catch { }
        }

        const prefillMonth = searchParams.get("prefillMonth");
        const prefillReportId = searchParams.get("prefillReportId") || null;

        let reportsRaw: unknown[] = [];

        if (prefillMonth) {
          const nowIso = new Date().toISOString().slice(0, 7);
          setDisableActions(prefillMonth !== nowIso);

          const [y, m] = prefillMonth.split("-");
          const year = Number(y || 0);
          const month = Number(m || 0);

          const byMonthRes = await fetchWithAuth(`/me/reports/food/by-month?year=${year}&month=${month}`, token);
          if (Array.isArray(byMonthRes)) reportsRaw = byMonthRes as unknown[];
          else if (byMonthRes && typeof byMonthRes === "object" && Array.isArray((byMonthRes as Record<string, unknown>).data)) reportsRaw = (byMonthRes as Record<string, unknown>).data as unknown[];
          else reportsRaw = [];

          if (reportsRaw.length === 0 && prefillReportId) {
            try {
              const single = await fetchWithAuth(`/me/reports/food/${encodeURIComponent(prefillReportId)}`, token);
              if (single) reportsRaw = [single as unknown];
            } catch { }
          }
        } else {
          const res = await fetchWithAuth(`/me/reports/food`, token);
          if (Array.isArray(res)) reportsRaw = res as unknown[];
          else if (res && typeof res === "object" && Array.isArray((res as Record<string, unknown>).data)) reportsRaw = (res as Record<string, unknown>).data as unknown[];
          else reportsRaw = [];
        }

        const mapped: FoodReportItem[] = reportsRaw.map((r, ri) => {
          const rec = (r ?? {}) as Record<string, unknown>;

          const reportDate = typeof rec.report_date === "string" ? rec.report_date : new Date().toISOString().split('T')[0];
          const reportType = typeof rec.report_type === "string" ? rec.report_type : "monthly";
          const reportId = typeof rec.report_id === "string" ? rec.report_id : reportDate;
          const total = typeof rec.total_co2e === "number" ? rec.total_co2e : Number((rec.total_co2e as unknown) ?? 0) || 0;

          const detailsRaw = Array.isArray(rec.items) ? (rec.items as unknown[]) : [];
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

        if (mounted) {
          setItems(mapped);
          if (prefillMonth && mapped.length === 0) setNoPrefillData(true);
          else setNoPrefillData(false);
        }
      } catch (err) {
        console.error("Failed to load food reports", err);
        if (mounted) setItems([]);
      }
    }

    loadReports();

    return () => {
      mounted = false;
    };
  }, [getIdToken, searchParams]);

  const data = useMemo(() => items ?? [], [items]);

  // accept optional second arg but only send report_date in URL
  const handleEdit = (reportDate: string, _reportType?: string) => {
    const params = new URLSearchParams({ report_date: reportDate });
    router.push(`/app/catat/laporan/konsumsi-makanan/edit?${params.toString()}`);
  };

  const handleDelete = (id: string) => {
    // open confirm modal
    setDeleteError(null);
    setDeletingId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      // Prefer backend token from authService; fall back to exchanging Firebase id token
      const { authService } = await import("@/services/auth");
      let token = authService.getToken();
      if (!token) {
        const firebaseToken = await getIdToken();
        if (!firebaseToken) throw new Error("Autentikasi hilang");
        token = await authService.loginWithGoogle(firebaseToken);
        try { authService.saveToken(token); } catch { }
      }

      // If deletingId looks like a date (YYYY-MM-DD), call the by-date delete endpoint
      const dateLike = /^\d{4}-\d{2}-\d{2}$/.test(deletingId);
      if (dateLike) {
        // DELETE /me/reports/food/by-date/{date}
        await fetchWithAuth(`/me/reports/food/by-date/${encodeURIComponent(deletingId)}`, token, { method: "DELETE" });
      } else {
        await deleteFoodReport(deletingId, token);
      }

      // determine a friendly label for toast
      const prevItems = items ?? [];
      const found = prevItems.find((x) => x.id === deletingId);
      const label = found
        ? `${formatDateID(found.report_date)}${found.details?.[0]?.name ? ` — ${found.details[0].name}` : ""}`
        : deletingId;

      // remove from local list
      setItems((prev) => (prev ?? []).filter((x) => x.id !== deletingId));
      setDeletingId(null);

      // show success toast
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
      headerTitle="Laporan Konsumsi Makanan"
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
                <FoodCard
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
        title="Hapus Laporan"
        message="Yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan."
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
