"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

export default function TotalCard({ total }: { total: number }) {
  return (
    <section
      className="rounded-2xl border p-5 text-center"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div className="text-black/70">Total Emisi Keseluruhan</div>
      <div
        className="mt-2 text-5xl font-semibold"
        style={{ color: "var(--color-primary)" }}
      >
        {/* {(total / 1000).toLocaleString("id-ID", { maximumFractionDigits: 3 })} */}
        {formatCarbonFootprint(total).value}
      </div>
      <div className="text-sm">{formatCarbonFootprint(total).unit}</div>
    </section>
  );
}
