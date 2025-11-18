"use client";

import Image from "next/image";

type Props = {
  name: string;
  email: string;
  joinedText: string; // contoh: "Bergabung Okt 2025"
  avatarSrc?: string;
  level: number;
  totalPoints: number;
  rank: string; // contoh: "#1240"
};

export default function ProfileHeaderCard({
  name,
  email,
  joinedText,
  avatarSrc = "/images/User.png",
  level,
  totalPoints,
  rank,
}: Props) {
  return (
    <section
      className="rounded-2xl p-4 text-white"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div className="flex items-center gap-3">
        <Image
          src={avatarSrc}
          alt={name}
          width={40}
          height={40}
          priority
        />
        <div className="flex-1">
          <div className="text-lg font-semibold">{name}</div>
          <div className="text-sm/5 opacity-90">{email}</div>
          <div className="mt-1 inline-flex rounded-full bg-[color:var(--color-background-card)] px-2 py-[2px] text-xs">
            {joinedText}
          </div>
        </div>
      </div>

      {/* --- Garis Pemisah --- */}
      <div className="my-4 h-px bg-white" />
      {/* -------------------- */}

      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Level" value={level} />
        <StatPill label="Total Points" value={totalPoints} />
        <StatPill label="Peringkat" value={rank} />
      </div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-[color:var(--color-background-card)] py-4 text-center">
      <div className="text-xs/4 opacity-90">{label}</div>
      <div className="text-xl font-semibold">{label == "Peringkat" ? '#' : ''}{value}</div>
    </div>
  );
}