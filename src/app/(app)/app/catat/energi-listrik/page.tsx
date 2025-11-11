"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useUsage } from "@/stores/catat/usage";
import type { EnergyReport } from "@/stores/catat/usage";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { assetsService, type BuildingResponse } from "@/services/assets";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import ScrollContainer from "@/components/nav/ScrollContainer";

// Backend may return a minimal response containing total CO₂e under various keys.

const CLEAN_TYPES = [
  { value: "solar", label: "Tenaga Surya" },
  { value: "angin", label: "Angin" },
  { value: "air", label: "Air" },
  { value: "lainnya", label: "Lainnya" },
];

export default function CatatEnergiIndividuPage() {
  const { addEnergy } = useUsage();
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [date, setDate] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [billCost, setBillCost] = useState("");
  const [useClean, setUseClean] = useState<boolean | undefined>(undefined);
  const [cleanType, setCleanType] = useState("");
  const [cleanKwh, setCleanKwh] = useState("");

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number | null>(null);
  const [savedCleanEnergy, setSavedCleanEnergy] = useState<{ type: string; energy_produced: number } | null>(null);

  // Fetch buildings from backend
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  // Helper to get backend token
  const getBackendToken = useCallback(async (): Promise<string | null> => {
    const { authService } = await import("@/services/auth");
    let backendToken = authService.getToken();

    if (!backendToken) {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) return null;

      backendToken = await authService.loginWithGoogle(firebaseToken);
      authService.saveToken(backendToken);
    }

    return backendToken;
  }, [getIdToken]);

  // Fetch buildings on mount
  useEffect(() => {
    async function fetchBuildings() {
      try {
        setLoadingBuildings(true);
        const token = await getBackendToken();
        if (!token) return;

        const data = await assetsService.getBuildings(token);
        setBuildings(data);
      } catch (error) {
        console.error("Failed to fetch buildings:", error);
      } finally {
        setLoadingBuildings(false);
      }
    }
    fetchBuildings();
  }, [getBackendToken]);

  const buildingOptions = useMemo(
    () => buildings.map((b) => ({ value: b.id, label: b.name })),
    [buildings]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const canSubmit =
    !!date &&
    !!buildingId &&
    Number(billCost) >= 0 &&
    (useClean === undefined ||
      (useClean === true ? cleanType !== "" && Number(cleanKwh) >= 0 : true));

  async function handleSave() {
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = await getBackendToken();
      if (!token) {
        setSubmitError("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const { reportsService } = await import("@/services/reports");

      // Payload untuk BE
      const payload: Record<string, unknown> = {
        report_date: date,
        building_asset_id: buildingId,
        total_cost_rp: Number(billCost || 0),
      };

      // Jika memakai energi bersih, kirimkan field yang sesuai backend
      if (useClean) {
        payload.produced_kwh = Number(cleanKwh || 0);
        const cleanLabel = CLEAN_TYPES.find((c) => c.value === cleanType)?.label ?? cleanType;
        payload.clean_energy_type = cleanLabel;
      }

      console.log("📤 Submitting electricity report:", payload);

      // submitElectricityReport expects a typed payload; cast payload to unknown so we can send extra fields
      // Call submit helper while allowing extra fields in payload. We narrow types locally to avoid `any`.
      const submitFn = reportsService.submitElectricityReport as unknown as (
        p: Record<string, unknown>,
        t: string
      ) => Promise<unknown>;
      const resp = await submitFn(payload as Record<string, unknown>, token);

      console.log("✅ Report submitted successfully:", resp);

      // Safely read numeric CO₂ value from possible backend keys
      const respObj = (resp && typeof resp === "object") ? (resp as Record<string, unknown>) : {};
      const co2Keys = ["total_co2e", "total_co2e_produced", "emission_kgco2e"];
      let totalCo2e: number | null = null;
      for (const k of co2Keys) {
        const v = respObj[k];
        if (typeof v === "number") {
          totalCo2e = v;
          break;
        }
      }

      // Optional: some backends include clean energy summary in response
      let cleanEnergy: { type: string; energy_produced: number } | null = null;
      const ce = respObj["clean_energy"];
      if (ce && typeof ce === "object") {
        const maybeType = (ce as Record<string, unknown>)["type"];
        const maybeProduced = (ce as Record<string, unknown>)["energy_produced"];
        if (typeof maybeType === "string" && typeof maybeProduced === "number") {
          cleanEnergy = { type: maybeType, energy_produced: maybeProduced };
        }
      }

      // Simpan ke local store (offline/cache)
      addEnergy({
        date,
        buildingId,
        billCost: Number(billCost || 0),
        useClean: useClean,
        cleanType: useClean ? (cleanType as EnergyReport["cleanType"]) : undefined,
        cleanKwh: useClean ? Number(cleanKwh || 0) : undefined,
      });

      // Reset ringan form (biar siap input baru)
      setBillCost("0");
      setCleanType("");
      setCleanKwh("0");
      setUseClean(undefined);

  // Tampilkan modal sukses + total CO₂e (jika ada)
  setSavedTotal(totalCo2e);
  setSavedCleanEnergy(cleanEnergy);
      setModalOpen(true);
    } catch (error) {
      console.error("❌ Failed to submit report:", error);
      const err = error as { message?: string };
      setSubmitError(err.message || "Gagal menyimpan laporan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollContainer
         headerTitle="Listrik"
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
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          id="bangunan"
          label="Pilih bangunan terdaftar"
          placeholder={
            loadingBuildings
              ? "Memuat..."
              : buildingOptions.length
              ? "Pilih Bangunan"
              : "Belum ada bangunan"
          }
          options={buildingOptions}
          value={buildingId}
          onChange={(e) => setBuildingId(e.target.value)}
          disabled={loadingBuildings || !buildingOptions.length}
          required
        />

        <TextField
          id="biayaListrik"
          label="Berapa biaya tagihan listrik bulanan?"
          placeholder="0"
          leftIcon={<span className="text-black/60">Rp</span>}
          inputMode="numeric"
          value={billCost}
          onChange={(e) => setBillCost(e.target.value)}
        />

        {/* Toggle energi bersih */}
        <div>
          <div className="mb-2 text-sm text-black">
            Apakah di bangunan ini juga menggunakan energi bersih?{" "}
            <span className="text-xs text-black/50">(Opsional)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={useClean === true ? "primary" : "outline"}
              onClick={() => setUseClean(true)}
            >
              Ya
            </Button>
            <Button
              type="button"
              variant={useClean === false ? "primary" : "outline"}
              onClick={() => setUseClean(false)}
            >
              Tidak
            </Button>
          </div>
        </div>

        {useClean === true && (
          <>
            <Select
              id="jenisBersih"
              label="Jenis Energi Bersih"
              placeholder="Pilih jenis energi bersih"
              options={CLEAN_TYPES}
              value={cleanType}
              onChange={(e) => setCleanType(e.target.value)}
            />
            <TextField
              id="kwh"
              label="Berapa kWh yang dihasilkan?"
              placeholder="0"
              rightIcon={<span className="text-black/60">kWh</span>}
              inputMode="numeric"
              value={cleanKwh}
              onChange={(e) => setCleanKwh(e.target.value)}
            />
          </>
        )}

        {submitError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{submitError}</p>
          </div>
        )}

        <Button fullWidth size="lg" disabled={!canSubmit || isSubmitting} onClick={handleSave}>
          {isSubmitting ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </div>

      {/* Modal sukses simpan */}
      <ReportSavedModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        reportKind="Energi Listrik"
        total={savedTotal}
        unit="kg CO₂e"
        redirectTo="/app/catat"
        cleanEnergy={savedCleanEnergy}
      />
    </ScrollContainer>
  );
}
