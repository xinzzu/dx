"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

type Props = {
  value: number;
};

export default function ResultCard({ value }: Props) {
  return (
    <div
      className="rounded-2xl border bg-white p-5 text-center"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div
        className="text-6xl font-bold leading-none"
        style={{ color: "var(--color-primary)" }}
      >
        {formatCarbonFootprint(value).value}
      </div>
      <div className="mt-1 text-sm text-black/60">{formatCarbonFootprint(value).unit}</div>
    </div>
  );
}
