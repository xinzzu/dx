// src/components/individu/profile/BadgeCard.tsx
"use client";

import Image from "next/image";
import clsx from "clsx";

type Props = {
  iconSrc: string; // PNG
  title: string;
  desc: string;
  owned?: boolean; // ← NEW: untuk warna border
};

export default function BadgeCard({ iconSrc, title, desc, owned }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white px-4 py-4 shadow-sm",
        "border",                         // selalu ada border…
        owned ? "border-emerald-400" : "border-black/10" // …warnanya beda
      )}
    >
      {/* ikon */}
      <div className="mb-4">
        <div className="grid h-12 w-12 place-items-center rounded-full">
          <Image src={iconSrc} alt="" width={50} height={50} />
        </div>
      </div>

      {/* teks */}
      <div className="text-left">
        <div className="text-[14px] font-semibold leading-snug">{title}</div>
        <p className="mt-1 text-[12px] leading-snug text-black/50">{desc}</p>
      </div>
    </div>
  );
}
