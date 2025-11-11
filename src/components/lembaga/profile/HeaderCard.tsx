// src/components/lembaga/profile/HeaderCard.tsx
"use client";

import Image from "next/image";
import clsx from "clsx";

type Props = {
  orgName: string;
  email: string;
  joinedAt?: string;              // contoh: "Bergabung Okt 2025"
  logoSrc?: string;               // default icon
  // statistik ringkas (bebas kamu mapping dari store/API)
  statA?: { label: string; value: number | string }; // mis: Unit Tercatat
  statB?: { label: string; value: number | string }; // mis: Anggota
  statC?: { label: string; value: number | string }; // mis: Emisi Bulan Ini
  className?: string;
};

export default function OrgProfileHeader({
  orgName,
  email,
  joinedAt,
  logoSrc = "/images/lembaga/profile/building.svg",
  statA = { label: "Unit Tercatat", value: 0 },
  statB = { label: "Anggota", value: 0 },
  statC = { label: "Emisi Bulan Ini", value: "0 kg CO₂e" },
  className,
}: Props) {
  return (
    <section
      className={clsx("rounded-2xl p-4 text-white", className)}
      style={{ backgroundColor: "var(--color-primary)" }}
      aria-label="Informasi Lembaga"
    >
      {/* Header info */}
      <div className="flex items-center gap-4">
        <div className="grid h-14 w-14 place-items-center rounded-xl bg-white/20">
          <Image
            src={logoSrc}
            alt="Logo Lembaga"
            width={40}
            height={40}
            className="h-10 w-10"
            priority
          />
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{orgName}</h2>
          <p className="truncate text-sm/5 opacity-90">{email}</p>
          {joinedAt && (
            <span className="mt-1 inline-block rounded-full bg-[color:var(--color-background-card)] px-2 py-0.5 text-xs">
              {joinedAt}
            </span>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px bg-white/90" />

      {/* Stats grid – sama pola dengan individu */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill label={statA.label} value={statA.value} />
        <StatPill label={statB.label} value={statB.value} />
        <StatPill label={statC.label} value={statC.value} />
      </div>
    </section>
  );
}

function StatPill({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-[color:var(--color-background-card)] py-4 text-center">
      <div className="text-xs/4 opacity-90">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
