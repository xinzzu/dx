"use client";

import { useMemo, useState, useEffect } from "react";
// vehicles are loaded from backend assetsService
import { assetsService } from "@/services/assets";
import type { VehicleResponse } from "@/services/assets";
import { useUsage } from "@/stores/catat/usage";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { vehicleService } from "@/services/vehicle";
import { reportsService } from "@/services/reports";
import type { CreateTransportReportPayload } from "@/services/reports";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import { fetchWithAuth } from "@/lib/api/client";
import { userFriendlyError } from '@/lib/userError'
import { formatIDR } from "@/utils/currency";
import ScrollContainer from "@/components/nav/ScrollContainer";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type TransportReportResponseMinimal = {
  total_co2e?: number;
};

export default function CatatTransportasiIndividuPage() {
  const { addTransport } = useUsage();
  const [vehicles, setVehicles] = useState<VehicleResponse[]>([]);
  const [loadVehiclesError, setLoadVehiclesError] = useState<string | null>(null);
  const router = useRouter();

  const [date, setDate] = useState<string>("");
  const [vehicleId, setVehicleId] = useState("");
  const [fuelType, setFuelType] = useState("bensin");
  const [fuelProductOptions, setFuelProductOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [loadProductsError, setLoadProductsError] = useState<string | null>(null);
  const [selectedFuelProductId, setSelectedFuelProductId] = useState<
    string | null
  >(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const { getIdToken } = useAuth();
  // keep raw numeric value (digits only) for backend submission
  const [billCostRaw, setBillCostRaw] = useState("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);

  const vehicleOptions = useMemo(
    () => vehicles.map((v) => ({ value: v.id, label: v.name })),
    [vehicles]
  );

  // Load vehicles from backend (manajemen-asset) so the select shows managed assets
  useEffect(() => {
    async function loadVehicles() {
      try {
        // get backend access token (exchange firebase token if needed)
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const firebaseToken = await getIdToken();
          if (!firebaseToken) return;
          token = await authService.loginWithGoogle(firebaseToken);
          authService.saveToken(token);
        }
        if (!token) return;
        setLoadVehiclesError(null);
        const res = await assetsService.getVehicles(token);
        // prefer active vehicles only for transport selection
        const active = (res || []).filter((v) => v.active !== false);
        setVehicles(active);
      } catch (err) {
        console.error(
          "Failed to load vehicles from backend, falling back to local store",
          err
        );
        // Friendly UI message
        setLoadVehiclesError(userFriendlyError(err, 'Gagal memuat daftar kendaraan. Silakan coba lagi.'));
        // If backend fails, we keep vehicles empty (or could fallback to assetWizard store)
        setVehicles([]);
      }
    }
    loadVehicles();
  }, [getIdToken]);

  // When vehicleId changes, compute fuelType and load compatible products
  useEffect(() => {
    async function loadForVehicle() {
      if (!vehicleId) {
        setFuelType("bensin");
        setFuelProductOptions([]);
        setSelectedFuelProductId(null);
        return;
      }

      const v = vehicles.find((x) => x.id === vehicleId);
      const mf = v?.metadata?.fuel_type;
      const vehicleFuelType =
        typeof mf === "string" ? mf.toLowerCase() : "bensin";
      setFuelType(vehicleFuelType);

      // load products filtered by fuel type
      setLoadingProducts(true);
      try {
        setLoadProductsError(null);
        // ensure we have backend token
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
        const opts = filtered.map((p) => ({
          value: p.id,
          label: `${p.product_name}${p.unit ? ` (${p.unit})` : ""}`,
        }));

        // if vehicle metadata includes a previously saved fuel_product but the products API
        // does not return it (maybe deprecated), include it as an option using the provided label
        const metadata = v?.metadata as Record<string, unknown> | undefined;
        const metaProdId =
          typeof metadata?.fuel_product_id === "string"
            ? metadata.fuel_product_id
            : undefined;
        const metaProdLabel =
          typeof metadata?.fuel_product_label === "string"
            ? metadata.fuel_product_label
            : undefined;
        if (metaProdId && !opts.find((o) => o.value === metaProdId)) {
          opts.unshift({
            value: metaProdId,
            label: metaProdLabel
              ? `${metaProdLabel} (tersimpan)`
              : `${metaProdId} (tersimpan)`,
          });
        }

        setFuelProductOptions(opts);
        // try to preselect the one stored in vehicle metadata (if present on vehicle), otherwise pick first
        const preSelected = metaProdId ?? opts[0]?.value ?? null;
        setSelectedFuelProductId(preSelected);
      } catch (err) {
        console.error("Failed to load products for vehicle", err);
        setLoadProductsError(userFriendlyError(err, 'Gagal memuat daftar produk bahan bakar. Silakan coba lagi.'));
        setFuelProductOptions([]);
        setSelectedFuelProductId(null);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadForVehicle();
  }, [vehicleId, vehicles, getIdToken]);

  // Require that the selected vehicle is actually present in the loaded vehicles list
  const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
  const canSubmit =
    !!date &&
    !!vehicleId &&
    Number(billCostRaw) > 0 &&
    !!selectedFuelProductId &&
    !!selectedVehicle;

  async function handleSave() {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Debug: show what we'll submit (token will be masked)
      console.debug("Transport submit: payload preview", {
        date,
        vehicleId,
        selectedFuelProductId,
        billCost: billCostRaw,
        vehicleLoaded: Boolean(selectedVehicle),
        vehiclesCount: vehicles.length,
      });

      // get backend token (exchange firebase token if needed)
      const { authService } = await import("@/services/auth");
      let token = authService.getToken();
      if (!token) {
        const firebaseToken = await getIdToken();
        if (!firebaseToken)
          throw new Error("Token tidak ditemukan. Silakan login kembali.");
        token = await authService.loginWithGoogle(firebaseToken);
        authService.saveToken(token);
      }

      // Debug: mask token presence
      console.debug("Transport submit: token available", !!token);

      // Server-side validation: ensure the vehicle and product exist for this token
      try {
        // validate using canonical per-id vehicle endpoint (not /me/ route)
        await assetsService.getVehicle(vehicleId, token);
      } catch (err) {
        console.warn(
          "Vehicle validation primary endpoint failed, trying /me fallback",
          err
        );
        // Some backends may only expose the /me/vehicle-assets/:id route — try fallback before giving up
        try {
          await fetchWithAuth(`/me/vehicle-assets/${vehicleId}`, token);
        } catch (err2) {
          console.error("Vehicle validation failed (both endpoints)", err2);
          throw new Error(
            `Kendaraan dengan id ${vehicleId} tidak ditemukan atau tidak tersedia untuk akun ini. Silakan periksa daftar kendaraan.`
          );
        }
      }

      // Validate fuel product by fetching the list (some backends don't expose GET by-id)
      let finalFuelProductId: string | undefined;
      try {
        const prods = await vehicleService.getFuelProducts(token);
        const productIds = (prods || []).map((p) => p.id);

        // Prefer selectedFuelProductId, fallback to vehicle metadata if present
        const vehicle = vehicles.find((v) => v.id === vehicleId);
        const metadataProd = vehicle?.metadata
          ? ((vehicle.metadata as Record<string, unknown>)[
            "fuel_product_id"
          ] as string | undefined)
          : undefined;
        finalFuelProductId = selectedFuelProductId || metadataProd;

        if (!finalFuelProductId) {
          throw new Error("Produk bahan bakar belum dipilih");
        }

        if (!productIds.includes(finalFuelProductId)) {
          throw new Error(
            `Produk bahan bakar dengan id ${finalFuelProductId} tidak ditemukan atau tidak tersedia untuk akun ini.`
          );
        }
      } catch (err) {
        console.error("Fuel product validation failed", err);
        const id =
          selectedFuelProductId ||
          (
            vehicles.find((v) => v.id === vehicleId)?.metadata as Record<
              string,
              unknown
            >
          )?.["fuel_product_id"];
        throw new Error(
          `Produk bahan bakar dengan id ${id || "<tidak ada>"
          } tidak ditemukan atau tidak tersedia untuk akun ini.`
        );
      }
      // NOTE: skip client-side fetch of /fuel-prices because that endpoint may be admin-only
      // Instead, rely on server-side validation during the POST and present a friendly
      // error message when the server responds that a fuel price was not found.

      const payload: CreateTransportReportPayload = {
        // use same date format as energi-listrik page (date string)
        report_date: date,
        vehicle_asset_id: vehicleId,
        // send raw number to backend
        total_cost_rp: Number(billCostRaw || 0),
        fuel_product_id: finalFuelProductId!,
      };

      console.debug("Submitting transport report payload:", payload);
      console.debug("Using backend token:", Boolean(token));

      if (token) {
        const resp = (await reportsService.createTransportReport(
          token,
          payload
        )) as unknown as TransportReportResponseMinimal;

        // tampilkan modal sukses + total co2e
        setSavedTotal(resp?.total_co2e ?? 0);
        setModalOpen(true);
      } else {
        console.warn("No auth token available, skipping backend submit");
      }
    } catch (err) {
      console.error(
        "Failed to submit transport report to backend, saving locally",
        err
      );

      const e = err as Error & { details?: string };

      // Friendly handling for server-side "fuel price not found" errors
      const msgLower = (e.message || "").toLowerCase();
      const detailsLower = (e.details || "").toLowerCase();
      let friendly = userFriendlyError(e, 'Gagal menyimpan laporan. Silakan coba lagi.');

      if (msgLower.includes("fuel price") || msgLower.includes("harga bahan bakar") || detailsLower.includes("fuel price") || detailsLower.includes("harga bahan bakar")) {
        friendly = "Harga bahan bakar untuk produk yang dipilih tidak ditemukan. Silakan minta admin menambahkan harga bahan bakar untuk produk ini, atau pilih produk/tanggal lain.";
      }

      const detailStr = e.details ? ` — ${e.details}` : "";
      setSubmitError(friendly + detailStr);
    } finally {
      // always persist locally for offline friendliness
      addTransport({
        date,
        vehicleId,
        fuelType: fuelType as "bensin" | "diesel" | "listrik" | "bbm_lain",
        fuelProductId: selectedFuelProductId || undefined,
        // store expects `monthlyCost` for transport records; map from raw value here
        monthlyCost: Number(billCostRaw || 0),
      });

      // reset ringan
      setVehicleId("");
      setBillCostRaw("0");
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollContainer
      headerTitle="Transportasi"
      leftContainer={
        <button
          onClick={() => router.back()}
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
          placeholder="klik untuk memilih tanggal"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          id="kendaraan"
          label="Pilih kendaraan terdaftar"
          placeholder={
            vehicleOptions.length ? "Pilih Kendaraan" : "Belum ada kendaraan"
          }
          options={vehicleOptions}
          value={vehicleId}
          onChange={async (e) => {
            const newId = e.target.value;
            setVehicleId(newId);

            // If the selected vehicle exists but is inactive, activate it on the backend.
            // Some backends require required fields (e.g. user_id) to be present on PUT,
            // so fetch the canonical vehicle and send a full payload including active:true.
            try {
              const v = vehicles.find((x) => x.id === newId);
              if (v && v.active === false) {
                const { authService } = await import("@/services/auth");
                let token = authService.getToken();
                if (!token) {
                  const firebaseToken = await getIdToken();
                  if (!firebaseToken) return;
                  token = await authService.loginWithGoogle(firebaseToken);
                  authService.saveToken(token);
                }

                if (!token) return;

                // Fetch canonical vehicle from API to build a full payload (ensure user_id present)
                const canonical = await assetsService.getVehicle(newId, token);
                console.debug("Canonical vehicle before activation:", canonical);

                const fullPayload: Partial<import("@/services/assets").CreateVehiclePayload> = {
                  name: canonical.name,
                  user_id: canonical.user_id,
                  emission_factor_id: canonical.emission_factor_id,
                  description: canonical.description,
                  metadata: canonical.metadata,
                  active: true,
                };

                console.debug(`Activating vehicle ${newId} with full payload`, fullPayload);
                const updated = await assetsService.updateVehicle(newId, fullPayload, token);
                console.debug("Activation response:", updated);

                // If server confirms activation, update local state
                if (updated && updated.active === true) {
                  setVehicles((prev) =>
                    prev.map((pv) => (pv.id === newId ? { ...pv, active: true } : pv))
                  );
                } else {
                  // If response didn't include the updated object, try to re-fetch and inspect
                  try {
                    const check = await assetsService.getVehicle(newId, token);
                    console.warn("Activation check result:", check);
                    if (check?.active === true) {
                      setVehicles((prev) =>
                        prev.map((pv) => (pv.id === newId ? { ...pv, active: true } : pv))
                      );
                    } else {
                      console.error(
                        `Activation did not persist for ${newId}. Server returned active=${String(check?.active)}`
                      );
                    }
                  } catch (innerErr) {
                    console.error("Failed to verify activation after update", innerErr);
                  }
                }
              }
            } catch (err) {
              console.error("Failed to activate vehicle after selection", err);
            }
          }}
          disabled={!vehicleOptions.length}
          required
        />

        {loadVehiclesError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mt-2">
            <p className="text-sm text-red-600">{loadVehiclesError}</p>
          </div>
        )}

        {/* Produk bahan bakar yang dibeli */}
        <Select
          id="bbm_product"
          label="Bahan Bakar yang di beli"
          options={fuelProductOptions}
          value={selectedFuelProductId || ""}
          onChange={(e) => setSelectedFuelProductId(e.target.value)}
          disabled={false}
          placeholder={
            loadingProducts
              ? "Memuat..."
              : fuelProductOptions.length
                ? "Pilih produk"
                : "Belum ada produk"
          }
          required
        />

        {loadProductsError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mt-2">
            <p className="text-sm text-red-600">{loadProductsError}</p>
          </div>
        )}

        <TextField
          id="biaya"
          label="Berapa biaya bahan bakar selama satu bulan?"
          inputMode="numeric"
          placeholder="0"
          // show formatted value directly in the input while storing a raw numeric string
          value={billCostRaw ? formatIDR(billCostRaw) : ""}
          onChange={(e) => {
            // keep only digits for the raw value
            const digits = String(e.target.value || "").replace(/\D/g, "");
            setBillCostRaw(digits === "" ? "0" : digits);
          }}
        />

        {submitError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSave}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </div>

      {/* Modal sukses simpan */}
      <ReportSavedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportKind="Transportasi"
        // total={savedTotal}
        // unit="kg CO₂e"
        total={formatCarbonFootprint(savedTotal).value}
        unit={formatCarbonFootprint(savedTotal).unit}
        redirectTo="/app/catat"
      />
    </ScrollContainer>
  );
}
