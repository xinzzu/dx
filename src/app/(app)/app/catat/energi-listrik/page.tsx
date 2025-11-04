"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useUsage } from "@/stores/catat/usage";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { assetsService, BuildingResponse } from "@/services/assets";

const CLEAN_TYPES = [
  { value: "solar", label: "Solar (PLTS)" },
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

      // Submit to backend
      const payload = {
        report_date: date,
        building_asset_id: buildingId,
        total_cost_rp: Number(billCost || 0),
      };

      console.log("📤 Submitting electricity report:", payload);
      console.log("📝 Building ID:", buildingId);
      console.log("💰 Bill Cost:", billCost, "->", Number(billCost || 0));
      console.log("📅 Date:", date);
      
      const response = await reportsService.submitElectricityReport(payload, token);
      console.log("✅ Report submitted successfully:", response);

      // Save to local state (for offline/cache)
      addEnergy({
        date,
        buildingId,
        billCost: Number(billCost || 0),
        useClean: useClean,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cleanType: useClean ? (cleanType as any) : undefined,
        cleanKwh: useClean ? Number(cleanKwh || 0) : undefined,
      });

      // Reset form
      setBillCost("0");
      setCleanType("");
      setCleanKwh("0");
      setUseClean(undefined);

      // Navigate back or show success message
      router.back();
    } catch (error) {
      console.error("❌ Failed to submit report:", error);
      const err = error as { message?: string };
      setSubmitError(err.message || "Gagal menyimpan laporan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Energi Listrik
        </h1>
        <div className="h-9 w-9" />
      </header>

      <div
        className="mx-auto mt-3 h-[2px] w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      <div className="rounded-2xl  p-4 space-y-4">
        <TextField
          id="tgl"
          label="Tanggal Laporan*"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          id="bangunan"
          label="Pilih bangunan terdaftar*"
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

        <Button 
          fullWidth 
          size="lg" 
          disabled={!canSubmit || isSubmitting} 
          onClick={handleSave}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan Data"}
        </Button>
      </div>
    </main>
  );
}
