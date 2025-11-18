"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type Props = {
  value: number | string;
  subtitle?: string;
};

export default function ResultCard({ value, subtitle = "kg CO₂e bulan ini" }: Props) {
  return (
    <div
      className="rounded-2xl border bg-white p-5 text-center"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div
        className="text-6xl font-bold leading-none"
        style={{ color: "var(--color-primary)" }}
      >
        {/* {value} */}
        {formatCarbonFootprint(typeof value === "number" ? value : parseFloat(value)).value}
      </div>
      <div className="mt-1 text-sm text-black/60"> {formatCarbonFootprint(typeof value === "number" ? value : parseFloat(value)).unit}</div>
    </div>
  );
}
