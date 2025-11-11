"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchWithAuth } from "@/lib/api/client";
import useAuth from "@/hooks/useAuth";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import ReportSavedModal from "@/components/ui/ReportSavedModal";
import { formatIDR } from "@/utils/currency";

/**
 * Halaman Edit Laporan Energi Listrik
 * Path: /app/catat/laporan/energi-listrik/edit/[id]
 */

type ElectricityReport = {
  id: string;
  user_id?: string;
  report_date: string; // YYYY-MM-DD
  building_asset_id: string;
  total_cost_rp: number;
  total_kwh?: number;
  emission_kgco2e?: number;
};

export default function EditElectricityReportPage() {
  const router = useRouter();
  const params = useParams() as { id?: string };
  const id = params?.id;

  const { getIdToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [report, setReport] = useState<ElectricityReport | null>(null);

  // form fields
  const [reportDate, setReportDate] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [totalCostRaw, setTotalCostRaw] = useState("0");
  const [totalKwhRaw, setTotalKwhRaw] = useState("0");

  const [modalOpen, setModalOpen] = useState(false);
  const [savedTotal, setSavedTotal] = useState<number | null>(null);

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
        const { authService } = await import("@/services/auth");
        let token = authService.getToken();
        if (!token) {
          const firebaseToken = await getIdToken();
          if (!firebaseToken) throw new Error("Token not available");
          token = await authService.loginWithGoogle(firebaseToken);
          authService.saveToken(token);
        }
        // GET single report
  const data = await fetchWithAuth<ElectricityReport>(`/reports/electricity/${encodeURIComponent(id as string)}`, token);
        setReport(data);
        // prefill form
        setReportDate(data.report_date || "");
        setBuildingId(data.building_asset_id || "");
        setTotalCostRaw(String(data.total_cost_rp ?? 0));
        setTotalKwhRaw(String(data.total_kwh ?? 0));
      } catch (err) {
        console.error("Failed to load report", err);
        setError((err as Error).message || "Gagal memuat data laporan.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, getIdToken]);

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setError(null);

    try {
      const { authService } = await import("@/services/auth");
      let token = authService.getToken();
      if (!token) {
        const firebaseToken = await getIdToken();
        if (!firebaseToken) throw new Error("Token not available");
        token = await authService.loginWithGoogle(firebaseToken);
        authService.saveToken(token);
      }

      // Build payload (only relevant fields)
      const payload: Partial<ElectricityReport> = {
        report_date: reportDate,
        building_asset_id: buildingId,
        total_cost_rp: Number(totalCostRaw || 0),
        total_kwh: Number(totalKwhRaw || 0),
      };

      // Call update endpoint (PUT)
  const updated = await fetchWithAuth<ElectricityReport>(`/reports/electricity/${encodeURIComponent(id as string)}`, token, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      // Show modal or toast
      setSavedTotal(updated.emission_kgco2e ?? null);
      setModalOpen(true);
      // Optionally redirect after short delay or when modal closed
    } catch (err) {
      console.error("Failed to update report", err);
      const e = err as Error & { details?: string };
      setError(e.details ?? e.message ?? "Gagal menyimpan perubahan.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Memuat...</div>;

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4">
        <p>Tidak ada data</p>
        <Button onClick={() => router.back()}>Kembali</Button>
      </div>
    );
  }

  const canSave = !!reportDate && !!buildingId && Number(totalCostRaw) > 0;

  return (
    <div className="p-4 max-w-lg">
      <h2 className="text-lg font-medium mb-4">Edit Laporan Energi Listrik</h2>

      <TextField id="report_date" label="Tanggal Laporan" type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} required />

      <TextField id="building" label="Gedung / Bangunan" value={buildingId} onChange={(e) => setBuildingId(e.target.value)} required />

      <TextField
        id="total_cost"
        label="Total Biaya (IDR)"
        inputMode="numeric"
        value={formatIDR(totalCostRaw)}
        onChange={(e) => {
          const digits = String(e.target.value || "").replace(/\D/g, "");
          setTotalCostRaw(digits === "" ? "0" : digits);
        }}
      />

      <TextField
        id="total_kwh"
        label="Total kWh"
        inputMode="numeric"
        value={String(totalKwhRaw)}
        onChange={(e) => {
          const digits = String(e.target.value || "").replace(/[^\d.]/g, "");
          setTotalKwhRaw(digits === "" ? "0" : digits);
        }}
      />

      {error && <div className="text-sm text-red-600 my-2">{error}</div>}

      <div className="mt-4">
        <Button disabled={!canSave || saving} onClick={handleSave}>
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        <Button variant="ghost" onClick={() => router.back()} className="ml-2">
          Batal
        </Button>
      </div>

      <ReportSavedModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          router.push("/app/catat/laporan/energi-listrik"); // kembali ke list
        }}
        reportKind="Energi Listrik"
        total={savedTotal ?? undefined}
        unit="kg CO₂e"
        redirectTo="/app/catat/laporan/energi-listrik"
      />
    </div>
  );
}