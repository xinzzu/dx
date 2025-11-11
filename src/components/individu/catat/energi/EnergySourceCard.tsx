"use client";

import Image from "next/image";
import clsx from "clsx";
import type { EnergySource } from "./types";

type Props = {
  value: EnergySource;
  selected: boolean;
  onSelect: (v: EnergySource) => void;
  title: string;
  img: string;            // path png
};

export default function EnergySourceCard({ value, selected, onSelect, title, img }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={clsx(
        "flex w-full items-center justify-center rounded-2xl border p-4 transition-colors",
        selected
          ? "bg-[color:var(--color-secondary)]/50 border-[color:var(--color-primary)]"
          : "border-[#D9D9D9] hover:border-[color:var(--color-primary)]/60"
      )}
    >
      <div className="grid place-items-center gap-2">
        <Image src={img} alt={title} width={56} height={56} />
        <span className="text-sm font-medium">{title}</span>
      </div>
    </button>
  );
}
