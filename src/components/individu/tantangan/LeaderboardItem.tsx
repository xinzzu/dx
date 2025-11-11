"use client";

import Image from "next/image";

type Props = {
  rank: number;
  name: string;
  avatar: string;   // PNG path
  valueText: string;
  active?: boolean; // highlight bar
};

// Helper untuk mendapatkan kelas styling berdasarkan peringkat
function getRankCircleStyles(rank: number): string {
  switch (rank) {
    case 1:
      return "bg-[#FFCA1C] text-black border"; // Emas
    case 2:
      // Menggunakan `style` untuk warna dari variabel CSS
      return "bg-[color:var(--color-primary)] text-black border";      // Hijau (Primary)
    case 3:
      return "bg-[#D2D2D2] text-black border"; // Perak
    default:
      return "border-black text-black";                // Default
  }
}

export default function LeaderboardItem({
  rank,
  name,
  avatar,
  valueText,
  active,
}: Props) {
  // Panggil helper untuk mendapatkan kelas CSS yang benar untuk lingkaran peringkat
  const rankCircleClasses = getRankCircleStyles(rank);

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-2xl px-3 py-3",
        // Logika untuk latar belakang baris aktif tetap di sini
        active ? "bg-[color:var(--color-secondary)]/80" : "",
      ].join(" ")}
    >
      {/* Lingkaran peringkat sekarang menggunakan kelas dinamis */}
      <div
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-semibold ${rankCircleClasses}`}
      >
        {rank}
      </div>

      <Image
        src={avatar}
        alt={name}
        width={40}
        height={40}
        className="h-10 w-10 rounded-full object-cover ring-1 ring-black/10"
      />

      <div className="flex-1">
        <div className="font-medium">{name}</div>
        <div className="text-sm text-black/60">{valueText}</div>
      </div>
    </div>
  );
}