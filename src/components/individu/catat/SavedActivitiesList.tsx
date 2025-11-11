"use client";

import Image from "next/image";

export type SavedItem = {
  id: string;
  icon?: string;      // optional PNG/SVG
  title: string;      // "Perjalanan naik mobil 15 kali"
  subtitle?: string;  // "total 150 km"
  value: number;      // 55
  unit?: string;      // "kg CO₂e"
};

export default function SavedActivitiesList({ items }: { items: SavedItem[] }) {
  return (
    <ul className="divide-y divide-black/10 rounded-2xl border border-black/10 bg-white">
      {items.map((it) => (
        <li key={it.id} className="flex items-start gap-3 p-4">
          <div className="mt-1 grid h-6 w-6 place-items-center">
            {it.icon ? (
              <Image alt="" src={it.icon} width={24} height={24} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="9" fill="currentColor" className="text-black/20" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <div className="text-[14px] font-medium">{it.title}</div>
            {it.subtitle ? (
              <div className="text-[12px] text-black/60">{it.subtitle}</div>
            ) : null}
          </div>

          <div className="text-right text-[13px] font-semibold">
            {it.value}
            <div className="text-[11px] font-normal text-black/60">{it.unit ?? "kg CO₂e"}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
