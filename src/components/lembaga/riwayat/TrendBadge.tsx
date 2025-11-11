"use client";
import Image from "next/image";

export default function TrendBadge({ pct }: { pct: number }) {
  const positif = pct <= 0 ? false : true; // contoh: +15% = naik (merah?), -15% = turun (hijau)
  const color = positif ? "text-[#16a34a]" : "text-[#16a34a]";
  // Jika kamu ingin beda warna untuk naik/turun, silakan ubah di sini.

  return (
    <div className="flex items-center gap-1 text-white">
      <Image
        src={pct >= 0 ? "/icons/lembaga/trend-up.svg" : "/icons/lembaga/trend-down.svg"}
        alt=""
        width={18}
        height={18}
      />
      <span className="text-sm font-semibold">{Math.abs(pct)}%</span>
    </div>
  );
}
