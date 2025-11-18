"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import ScrollContainer from "@/components/nav/ScrollContainer";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import useAuth from "@/hooks/useAuth";
import { assetsService } from "@/services/assets";
import { reportsService } from "@/services/reports";
import { fetchWithAuth } from "@/lib/api/client";
import { formatIDR } from "@/utils/currency";
import { vehicleService } from "@/services/vehicle";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type TransportReportResponse = {
  id: string;
  report_date: string;
  vehicle_asset_id?: string;
  total_cost_rp: number;
  fuel_product_id?: string;
};

export default function EditTransportReportPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;
  const { getIdToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form state
  const [date, setDate] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [costRaw, setCostRaw] = useState("0");
  const [fuelProductId, setFuelProductId] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<
    Array<{ id: string; name: string; active?: boolean }>
  >([]);
  const [fuelProductOptions, setFuelProductOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const vehicleOptions = useMemo(
    () => vehicles.map((v) => ({ value: v.id, label: v.name })),
    [vehicles]
  );

  // success modal state
  const [savedOpen, setSavedOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setErr("ID laporan tidak ditemukan di URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setErr(null);
      try {
        // ensure we have backend token
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const firebaseToken = await getIdToken();
          if (!firebaseToken) throw new Error("Token Firebase tidak tersedia");
          token = await authService.loginWithGoogle(firebaseToken);
          authService.saveToken(token);
        }
        if (!token) throw new Error("Token backend tidak tersedia");

        // fetch canonical report by id using reportsService helper
        let canonical: TransportReportResponse | null = null;
        try {
          canonical = await reportsService.getTransportReport(id, token);
        } catch (inner) {
          console.error("Failed to fetch transport report detail", inner);
          canonical = null;
        }

        if (!canonical) {
          throw new Error(
            "Gagal memuat data laporan. Periksa kembali apakah laporan tersedia untuk akun ini."
          );
        }

        if (!mounted) return;

        setDate(canonical.report_date ?? new Date().toISOString().slice(0, 10));
        setVehicleId(canonical.vehicle_asset_id ?? "");
        setCostRaw(String(Math.round(canonical.total_cost_rp ?? 0)));
        setFuelProductId(canonical.fuel_product_id ?? null);

        // load vehicles for label/validation (we will lock selection)
        try {
          const vehs = await assetsService.getVehicles(token);
          if (mounted)
            setVehicles((vehs || []).filter((v) => v.active !== false));
        } catch (e) {
          console.warn("Failed to load vehicles for edit page", e);
        }
      } catch (e: unknown) {
        console.error("Load transport edit failed", e);
        setErr((e as Error)?.message ?? String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, getIdToken]);

  // Load fuel products when vehicleId or vehicles change (mirror catat form behavior)
  useEffect(() => {
    let mounted = true;
    async function loadForVehicle() {
      if (!vehicleId) {
        setFuelProductOptions([]);
        setFuelProductId(null);
        return;
      }

      const v = vehicles.find((x) => x.id === vehicleId) as { metadata?: Record<string, unknown> } | undefined;
      const mf = (v?.metadata?.["fuel_type"] as string) ?? undefined;
      const vehicleFuelType = typeof mf === "string" ? mf.toLowerCase() : "bensin";

      setLoadingProducts(true);
      try {
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const firebaseToken = await getIdToken();
          if (!firebaseToken) return;
          token = await authService.loginWithGoogle(firebaseToken);
          authService.saveToken(token);
        }
        if (!token) return;

        const prods = await vehicleService.getFuelProducts(token);
        const filtered = (prods || []).filter(
          (p) => (p.fuel_type || "").toLowerCase() === vehicleFuelType
        );
        const opts = filtered.map((p) => ({ value: p.id, label: `${p.product_name}${p.unit ? ` (${p.unit})` : ""}` }));

        // If the existing report has a fuel_product_id that isn't in the returned list,
        // try to include it so the Select can display and the user can change it.
        const existingProductId = fuelProductId ?? undefined;
        if (existingProductId && !opts.find((o) => o.value === existingProductId)) {
          // try to find full product object from the fetched list
          const found = (prods || []).find((p) => p.id === existingProductId);
          if (found) {
            opts.unshift({ value: found.id, label: `${found.product_name}${found.unit ? ` (${found.unit})` : ""}` });
          } else {
            // fallback: include a friendly label so the user sees something readable
            const shortId = existingProductId.slice(0, 8);
            opts.unshift({ value: existingProductId, label: `Produk tidak dikenal (${shortId}...)` });
          }
        }

        // include metadata product if missing
        const metadata = v?.metadata as Record<string, unknown> | undefined;
        const metaProdId = typeof metadata?.["fuel_product_id"] === "string" ? (metadata["fuel_product_id"] as string) : undefined;
        const metaProdLabel = typeof metadata?.["fuel_product_label"] === "string" ? (metadata["fuel_product_label"] as string) : undefined;
        if (metaProdId && !opts.find((o) => o.value === metaProdId)) {
          opts.unshift({ value: metaProdId, label: metaProdLabel ? `${metaProdLabel} (tersimpan)` : `${metaProdId} (tersimpan)` });
        }

        if (mounted) setFuelProductOptions(opts);

        // if current value is empty, preselect metadata or first option
        const preSelected = metaProdId ?? opts[0]?.value ?? null;
        if (mounted) setFuelProductId((cur) => cur ?? preSelected);
      } catch (err) {
        console.error("Failed to load products for vehicle on edit page", err);
        if (mounted) {
          setFuelProductOptions([]);
        }
      } finally {
        if (mounted) setLoadingProducts(false);
      }
    }

    loadForVehicle();
    return () => { mounted = false; };
  }, [vehicleId, vehicles, getIdToken, fuelProductId]);

  const canSubmit = !!date && !!vehicleId && Number(costRaw) >= 0;

  const handleSave = async () => {
    if (!canSubmit || !id) return;
    try {
      setErr(null);
      const { authService } = await import("@/services/auth");
      let token = authService.getToken();
      if (!token) {
        const firebaseToken = await getIdToken();
        if (!firebaseToken) throw new Error("Token Firebase tidak tersedia");
        token = await authService.loginWithGoogle(firebaseToken);
        authService.saveToken(token);
      }
      if (!token) throw new Error("Token backend tidak tersedia");

      const payload: Partial<{
        report_date: string;
        vehicle_asset_id: string;
        total_cost_rp: number;
        fuel_product_id?: string;
      }> = {
        report_date: date,
        // keep vehicle id same — locked in edit
        vehicle_asset_id: vehicleId,
        total_cost_rp: Number(costRaw || 0),
      };
      if (fuelProductId) payload.fuel_product_id = fuelProductId;

      // Directly PUT to /api/v1/me/reports/transportation/{id} as requested
      const resp = await fetchWithAuth<TransportReportResponse>(`/me/reports/transportation/${encodeURIComponent(id)}`, token, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // Some backends may return total_co2e; try to read it safely
      const asObj = resp as unknown as Record<string, unknown> | null;
      setSavedTotal(asObj && typeof asObj.total_co2e === "number" ? (asObj.total_co2e as number) : 0);
      setSavedOpen(true);
    } catch (e: unknown) {
      console.error("Failed to update transport report", e);
      setErr((e as Error)?.message ?? String(e));
    }
  };

  if (loading)
    return (
      <ScrollContainer headerTitle="Edit Laporan Transportasi">
        <div className="px-4 pb-24">
          <p className="text-sm text-gray-600">Memuat…</p>
        </div>
      </ScrollContainer>
    );

  if (err)
    return (
      <ScrollContainer headerTitle="Edit Laporan Transportasi">
        <div className="px-4 pb-24">
          <p className="text-sm text-red-600">{err}</p>
        </div>
      </ScrollContainer>
    );

  return (
    <ScrollContainer
      headerTitle="Edit Laporan Transportasi"
      leftContainer={
        <button
          onClick={() => router.push("/app/catat/laporan/transportasi")}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }
    >
      <div className="rounded-2xl p-4 space-y-4">
        <TextField
          id="tgl"
          label="Tanggal Laporan"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        {/* Vehicle select is shown but locked in edit mode */}
        <Select
          id="kendaraan"
          label="Kendaraan (tidak dapat diubah)"
          options={vehicleOptions}
          value={vehicleId}
          onChange={() => { }}
          disabled
          required
        />

        <TextField
          id="biaya"
          label="Biaya total (IDR)"
          inputMode="numeric"
          value={costRaw ? formatIDR(costRaw) : ""}
          onChange={(e) =>
            setCostRaw(String(e.target.value).replace(/\D/g, "") || "0")
          }
        />

        <Select
          id="bbm_product"
          label="Produk Bahan Bakar (opsional)"
          options={fuelProductOptions}
          value={fuelProductId ?? ""}
          onChange={(e) => setFuelProductId(e.target.value || null)}
          disabled={loadingProducts}
          placeholder={
            loadingProducts
              ? "Memuat..."
              : fuelProductOptions.length
                ? "Pilih produk"
                : "Belum ada produk"
          }
        />

        {err && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{err}</p>
          </div>
        )}

        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSave}>
          Simpan Perubahan
        </Button>
      </div>

      <ReportSavedModal
        open={savedOpen}
        onClose={() => {
          setSavedOpen(false);
          router.push("/app/catat/laporan/transportasi");
        }}
        reportKind="Transportasi"
        // total={savedTotal}
        // unit="kg CO₂e"
        total={formatCarbonFootprint(savedTotal).value}
        unit={formatCarbonFootprint(savedTotal).unit}
        redirectTo="/app/catat/laporan/transportasi"
      />
    </ScrollContainer>
  );
}
