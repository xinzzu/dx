import React from "react"
import Image from "next/image"
import type { CategoryStat, Accent } from "./types"

const styles: Record<Accent, { border: string; text: string }> = {
  orange: { border: "border-orange-400", text: "text-orange-600" },
  blue:   { border: "border-blue-400",   text: "text-blue-600"   },
  red:    { border: "border-red-400",    text: "text-red-600"    },
  green:  { border: "border-green-400",  text: "text-green-600"  },
  gray:   { border: "border-gray-300",   text: "text-gray-600"   },
}

export function CategoryItem({ item }: { item: CategoryStat }) {
  const fmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 })
  const s = styles[item.accent]
  return (
    <div className={`rounded-xl border ${s.border} bg-white px-4 py-3`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-200">
            {item.iconSrc ? (
              <Image src={item.iconSrc} alt={item.name} width={20} height={20} />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400">
                <circle cx="12" cy="12" r="9" fill="currentColor" />
              </svg>
            )}
          </div>
          <span className="text-[15px] font-medium text-gray-800">{item.name}</span>
        </div>
        <span className={`text-[15px] font-semibold ${s.text}`}>
          {fmt.format(item.valueKg)}{" "}
          <span className="text-xs font-normal">kg CO₂e</span>
        </span>
      </div>
    </div>
  )
}
