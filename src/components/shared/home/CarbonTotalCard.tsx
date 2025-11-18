"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type Props = {
  totalKg: number;
};

export default function CarbonTotalCard({ totalKg }: Props) {

  return (
    <section
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <p className="text-center text-black/70 text-sm">Jejak Karbon Anda:</p>
      <div className="mt-2 text-center text-5xl font-semibold text-[color:var(--color-primary)]">
        {formatCarbonFootprint(totalKg).value}
      </div>
      <p className="text-center text-sm">{formatCarbonFootprint(totalKg).unit} bulan ini</p>
    </section>
  );
}
