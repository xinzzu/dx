"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import React from "react";

type Props = {
  open: boolean;
  onClose?: () => void;
  reportKind: string;
  total?: number | null;
  unit?: string;
  redirectTo?: string;
  cleanEnergy?: { type: string; energy_produced: number } | null;
};

// Helper: batasi maksimal 2 desimal, pakai locale Indonesia
function formatCO2(value: number | null | undefined, maxDecimals = 2) {
  if (value == null || Number.isNaN(value)) return "—";
  const rounded = Math.round(Number(value) * 10 ** maxDecimals) / 10 ** maxDecimals;
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  }).format(rounded);
}

export default function ReportSavedModal({
  open,
  onClose,
  reportKind,
  total = null,
  unit = "kg CO₂e",
  redirectTo,
  cleanEnergy = null,
}: Props) {
  const router = useRouter();
  if (!open) return null;

  const handleClose = () => {
    onClose?.();
    if (redirectTo) router.push(redirectTo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-emerald-100 p-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold">Data Berhasil Disimpan!</h3>
          <p className="text-sm text-black/60">
            Laporan emisi karbon <span className="font-medium">{reportKind}</span> Anda telah tersimpan
          </p>

          <div className="w-full rounded-lg border border-emerald-100 bg-emerald-50 p-4">
            <div className="text-xs text-black/60">Total Emisi CO₂</div>
            <div className="mt-2 text-3xl font-semibold text-black">
              {formatCO2(total, 2)}
            </div>
            <div className="text-sm text-emerald-600">{unit}</div>
          </div>

          {cleanEnergy && (
            <div className="w-full rounded-lg border border-sky-100 bg-sky-50 p-4">
              <div className="text-xs text-black/60">Energi Bersih (dilaporkan)</div>
              <div className="mt-2 text-sm font-medium text-black">{cleanEnergy.type}</div>
              <div className="text-sm text-black/70">{new Intl.NumberFormat('id-ID').format(cleanEnergy.energy_produced)} kWh</div>
            </div>
          )}

          <div className="w-full">
            <Button size="lg" className="w-full" onClick={handleClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
