"use client";

import Image from "next/image";

type Props = {
  rank: number;
  name: string;
  avatar: string;   // path PNG
  points: string;   // contoh: "5.000"
  unit?: string;    // default: "Poin"
  active?: boolean; // highlight baris user
};

// Palet warna: 1=emas, 2=hijau brand, 3=silver, ≥4=abu-abu
function rankPalette(rank: number) {
  if (rank === 1) return { inner: "bg-[#FFCA1C]", text: "text-black" };
  if (rank === 2) return { inner: "bg-[color:var(--color-primary)]/85", text: "text-black" };
  if (rank === 3) return { inner: "bg-[#D2D2D2]", text: "text-black" };
  return { inner: "bg-gray-200", text: "text-black" };
}

export default function LeaderboardItem({
  rank,
  name,
  avatar,
  points,
  unit = "Poin",
  active,
}: Props) {
  const pal = rankPalette(rank);

  return (
    <div
      className={[
        "flex items-center gap-3 px-3 py-3",
        active ? "bg-[color:var(--color-secondary)]/70" : "",
      ].join(" ")}
    >
      {/* Rank badge: hanya inner colored circle + number (TANPA border luar) */}
      <div className={`relative grid h-8 w-8 shrink-0 place-items-center rounded-full ${pal.text}`}>
        <span className={`absolute inset-0 m-1 rounded-full ${pal.inner}`} />
        <span className="relative z-10 text-sm font-semibold">{rank}</span>
      </div>

      {/* Avatar */}
      <div className="h-10 w-10 shrink-0 rounded-full bg-gray-50 ring-1 ring-black/10 overflow-hidden">
        <Image
          src={avatar}
          alt={name}
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Nama */}
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{name}</div>
        <div className="text-xs text-black/60">Total Laporan: 12x</div>
        <div className="text-xs text-black/60">Jejak Karbon: 17 kg CO2e</div>
      </div>

      {/* Poin kanan (sesuai mock) */}
      <div className="text-right leading-tight">
        <div className="font-semibold text-emerald-600">{points}</div>
        <div className="text-xs text-black/60">{unit}</div>
      </div>
    </div>
  );
}
