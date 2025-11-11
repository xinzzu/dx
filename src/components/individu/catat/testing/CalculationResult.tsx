// src/components/catat/CalculationResult.tsx
"use client";

type Props = {
  total: number;
};

export default function CalculationResult({ total }: Props) {
  return (
    <>
      <h3 className="mt-5 text-center text-base font-semibold">Hasil Perhitungan</h3>
      <div
        className="mt-3 rounded-2xl border p-4 text-center"
        style={{ borderColor: "var(--color-primary)" }}
      >
        <div className="text-5xl font-semibold text-[color:var(--color-primary)]">
          {total}
        </div>
        <div className="text-sm">kg CO₂e bulan ini</div>
      </div>
    </>
  );
}