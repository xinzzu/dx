import { twMerge } from "tailwind-merge"

export default function MetricBar({
  label,
  valueKg,          // nilai kategori (kg)
  totalKg,          // total semua kategori (untuk lebar bar)
  className,
}: {
  label: string
  valueKg: number
  totalKg: number
  className?: string
}) {
  const pct = totalKg > 0 ? Math.min(100, (valueKg / totalKg) * 100) : 0

  return (
    <div className={twMerge("mb-3", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-black">{label}</span>
        <span className="text-black/70">{Intl.NumberFormat("id-ID").format(valueKg)} kg</span>
      </div>

      <div className="mt-2 h-2 rounded-full bg-[#D9D9D9]">
        <div
          className="h-full rounded-full bg-[color:var(--color-primary)]"
          style={{ width: `${pct}%` }}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          role="progressbar"
        />
      </div>
    </div>
  )
}
