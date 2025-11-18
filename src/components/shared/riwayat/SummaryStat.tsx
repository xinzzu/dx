import { formatCarbonFootprint } from "@/utils/carbonAnalysis";
import React from "react"

export function SummaryStat({
  label,
  valueKg,
}: { label: string; valueKg: number }) {
  const fmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 })
  return (
    <div className="rounded-xl border border-gray-200 bg-[#F8FAFC] p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-emerald-600">
        {/* {fmt.format(valueKg)} */}
        {formatCarbonFootprint(valueKg).value}
      </div>
      <div className="text-xs text-gray-500">{formatCarbonFootprint(valueKg).unit}</div>
    </div>
  )
}
