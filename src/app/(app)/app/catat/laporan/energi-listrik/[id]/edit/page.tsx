"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { fetchWithAuth } from "@/lib/api/client";
import useAuth from "@/hooks/useAuth";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import ScrollContainer from "@/components/nav/ScrollContainer";
import { formatIDR } from "@/utils/currency";
import { assetsService, type BuildingResponse } from "@/services/assets";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

/**
 * Halaman Edit Laporan Energi Listrik
 * Path: /app/catat/laporan/energi-listrik/[id]/edit
 */

// Tipe data gabungan untuk GET dan PUT
type ElectricityReport = {
  id: string;
  report_date: string; // YYYY-MM-DD
  building_asset_id: string;
  total_cost_rp: number;
  total_kwh?: number; // kWh dari PLN (opsional, mungkin dihitung backend)
  emission_kgco2e?: number;

  // Data Energi Bersih (bisa flat atau nested)
  clean_energy_type?: string;
  produced_kwh?: number;
  clean_energy?: {
    type: string;
    energy_produced: number;
  };
};

// Konstanta dari halaman create
const CLEAN_TYPES = [
  { value: "solar", label: "Tenaga Surya" },
  { value: "angin", label: "Angin" },
  { value: "air", label: "Air" },
  { value: "lainnya", label: "Lainnya" },
];

export default function EditElectricityReportPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id;

  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(true); // Loading data laporan
  const [saving, setSaving] = useState(false); // Menyimpan perubahan
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<ElectricityReport | null>(null); // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // === Form fields ===
  const [reportDate, setReportDate] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [totalCostRaw, setTotalCostRaw] = useState("0"); // Biaya PLN

  // State energi bersih (dari halaman create)
  const [useClean, setUseClean] = useState<boolean | undefined>(undefined);
  const [cleanType, setCleanType] = useState("");
  const [cleanKwh, setCleanKwh] = useState("0"); // Ini adalah 'produced_kwh'

  // State untuk dropdown bangunan (dari halaman create)
  const [buildings, setBuildings] = useState<BuildingResponse[]>([]);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  // State modal (dari halaman create)
  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number>(0);
  const [savedCleanEnergy, setSavedCleanEnergy] = useState<{
    type: string;
    energy_produced: number;
  } | null>(null);

  // Helper token (dari halaman create)
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

  // Fetch buildings on mount (dari halaman create)
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

  // === Load Laporan yang mau di-edit ===
  useEffect(() => {
    if (!id) {
      setError("ID laporan tidak ditemukan.");
      setLoading(false);
      return;
    }

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const token = await getBackendToken();
        if (!token) throw new Error("Token not available");

        // GET single report
        const data = await fetchWithAuth<ElectricityReport>(
          `/me/reports/electricity/${encodeURIComponent(id as string)}`,
          token
        );
        setReport(data);

        // === Prefill form ===
        setReportDate(data.report_date || "");
        setBuildingId(data.building_asset_id || "");
        setTotalCostRaw(String(data.total_cost_rp ?? 0));

        // Prefill energi bersih (LOGIKA BARU)
        const ceType = data.clean_energy_type ?? data.clean_energy?.type;
        const ceKwh = data.produced_kwh ?? data.clean_energy?.energy_produced;

        if (ceType && (ceKwh ?? 0) > 0) {
          setUseClean(true);
          setCleanKwh(String(ceKwh));
          // Map label (e.g., "Tenaga Surya") kembali ke value (e.g., "solar")
          const cleanTypeValue =
            CLEAN_TYPES.find((c) => c.label === ceType)?.value ?? "lainnya";
          setCleanType(cleanTypeValue);
        } else {
          setUseClean(false);
          setCleanKwh("0");
          setCleanType("");
        }
      } catch (err) {
        console.error("Failed to load report", err);
        setError((err as Error).message || "Gagal memuat data laporan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, getBackendToken]);

  // === Handle Save (Update) ===
  async function handleSave() {
    if (!id || !canSave) return;
    setSaving(true);
    setError(null);

    try {
      const token = await getBackendToken();
      if (!token) throw new Error("Token not available");

      // Build payload (sesuai 'curl' dan halaman 'create')
      const payload: Record<string, unknown> = {
        report_date: reportDate,
        building_asset_id: buildingId,
        total_cost_rp: Number(totalCostRaw || 0),
      };

      // Jika memakai energi bersih, kirimkan field yang sesuai
      if (useClean) {
        payload.produced_kwh = Number(cleanKwh || 0);
        const cleanLabel =
          CLEAN_TYPES.find((c) => c.value === cleanType)?.label ?? cleanType;
        payload.clean_energy_type = cleanLabel;
      } else {
        // Eksplisit kirim 0/null jika user memilih "Tidak"
        payload.produced_kwh = 0;
        payload.clean_energy_type = null;
      }

      console.log("📤 Updating electricity report:", id, payload);

      // Call update endpoint (PUT)
      const updated = await fetchWithAuth<ElectricityReport>(
        `/me/reports/electricity/${encodeURIComponent(id as string)}`,
        token,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      console.log("✅ Report updated successfully:", updated);

      // Cek response untuk data modal (dari halaman create)
      const respObj = updated as Record<string, unknown>;
      let totalCo2e: number = 0;
      const co2Keys = [
        "emission_kgco2e",
        "total_co2e",
        "total_co2e_produced",
      ];
      for (const k of co2Keys) {
        const v = respObj[k];
        if (typeof v === "number") {
          totalCo2e = v;
          break;
        }
      }

      let cleanEnergy: { type: string; energy_produced: number } | null = null;
      const ce = respObj["clean_energy"];
      if (ce && typeof ce === "object") {
        const maybeType = (ce as Record<string, unknown>)["type"];
        const maybeProduced = (ce as Record<string, unknown>)["energy_produced"];
        if (typeof maybeType === "string" && typeof maybeProduced === "number") {
          cleanEnergy = { type: maybeType, energy_produced: maybeProduced };
        }
      }

      setSavedTotal(totalCo2e);
      setSavedCleanEnergy(cleanEnergy);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to update report", err);
      const e = err as Error & { details?: string };
      setError(e.details ?? e.message ?? "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  const canSave =
    !!reportDate &&
    !!buildingId &&
    Number(totalCostRaw) >= 0 &&
    (useClean === undefined ||
      (useClean === true ? cleanType !== "" && Number(cleanKwh) >= 0 : true));

  // === Render ===

  if (loading) {
    return (
      <ScrollContainer headerTitle="Edit Laporan">
        <div className="p-4">Memuat data laporan...</div>
      </ScrollContainer>
    );
  }

  return (
    <ScrollContainer
      headerTitle="Edit Laporan Listrik"
      leftContainer={
        <button
          onClick={() => router.push("/app/catat/laporan/energi-listrik")}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
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
          value={reportDate}
          onChange={(e) => setReportDate(e.target.value)}
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
          // In edit mode the building should be immutable (disabled)
          disabled={true}
          required
        />

        <TextField
          id="biayaListrik"
          label="Berapa biaya tagihan listrik bulanan?"
          placeholder="0"
          // leftIcon={<span className="text-black/60">Rp</span>}
          inputMode="numeric"
          value={formatIDR(totalCostRaw)} // Format tampilan
          onChange={(e) => {
            // Simpan angka mentah
            const digits = String(e.target.value || "").replace(/\D/g, "");
            setTotalCostRaw(digits === "" ? "0" : digits);
          }}
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

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          fullWidth
          size="lg"
          disabled={!canSave || saving}
          onClick={handleSave}
        >
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      {/* Modal sukses simpan */}
      <ReportSavedModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.push("/app/catat/laporan/energi-listrik"); // kembali ke list
        }}
        reportKind="Energi Listrik"
        // total={savedTotal}
        // unit="kg CO₂e"
        total={formatCarbonFootprint(savedTotal).value}
        unit={formatCarbonFootprint(savedTotal).unit}
        redirectTo="/app/catat/laporan/energi-listrik"
        cleanEnergy={savedCleanEnergy}
      />
    </ScrollContainer>
  );
}