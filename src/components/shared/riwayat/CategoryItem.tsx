"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { CategoryStat, Accent } from "./types";
import { ChevronRight } from "lucide-react";
import { formatCarbonFootprint } from "@/utils/carbonAnalysis";

// const styles: Record<Accent, { border: string; text: string }> = {
//   orange: { border: "border-orange-400", text: "text-orange-600" },
//   blue:   { border: "border-blue-400",   text: "text-blue-600"   },
//   red:    { border: "border-rose-400",   text: "text-rose-600"   },
//   green:  { border: "border-emerald-400",text: "text-emerald-600"},
//   gray:   { border: "border-gray-300",   text: "text-gray-700"   },
// };

const styles: Record<Accent, { border: string; text: string }> = {
  orange: { border: "border-gray-300", text: "text-orange-600" },
  blue: { border: "border-gray-300", text: "text-blue-600" },
  red: { border: "border-gray-300", text: "text-red-600" },
  green: { border: "border-gray-300", text: "text-emerald-600" },
  gray: { border: "border-gray-300", text: "text-gray-700" },
};

export function CategoryItem({
  item,
  isLast,
}: {
  item: CategoryStat;
  isLast: boolean;
}) {
  const fmt = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
  const s = styles[item.accent];

  const borderClass = isLast ? "" : "border-b border-gray-300";

  return (
    <Link
      href={item.href || '#'}
      className={`block bg-white px-4 py-3 transition hover:bg-gray-50 cursor-pointer ${borderClass}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 ring-1 ring-gray-200">
            {item.iconSrc ? (
              <Image src={item.iconSrc} alt={item.name} width={20} height={20} />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gray-400" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="currentColor" />
              </svg>
            )}
          </div>
          <span className="text-[15px] font-medium text-gray-800">{item.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-[15px] font-semibold gap-2 ${s.text} whitespace-nowrap`}>
            {/* {fmt.format(item.valueKg)}{" "} */}
            {formatCarbonFootprint(item.valueKg).value}{" "}
            <span className="text-xs font-normal text-black/60">{formatCarbonFootprint(item.valueKg).unit}</span>
          </span>

          <ChevronRight
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </div>
      </div>
    </Link>
  );
}