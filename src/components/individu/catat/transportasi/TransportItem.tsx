"use client";

import Image from "next/image";
import { TransportEntry, VehicleType } from "./types";

export default function TransportItem({
  type,
  icon,
  subtitle,
  value,
  onClick,
}: {
  type: VehicleType;
  icon: string;         // PNG path
  subtitle: string;
  value?: TransportEntry;
  onClick: () => void;  // open modal
}) {
  const filled = !!value;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left rounded-2xl border p-3 mb-3 flex items-start gap-3",
        "transition",
        filled ? "border-[color:var(--color-primary)] bg-[color:var(--color-secondary)]/40" : "border-black/15",
      ].join(" ")}
    >
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-[color:var(--color-secondary)]">
        <Image src={icon} alt="" width={32} height={32} />
      </div>

      <div className="flex-1">
        <div className="font-semibold capitalize">{type}</div>
        {!filled ? (
          <div className="text-sm text-black/60">{subtitle}</div>
        ) : (
          <div className="mt-1 text-sm">
            <div className="flex justify-between">
              <span>Penggunaan:</span>
              <span className="font-medium">{value.usesPerMonth} kali</span>
            </div>
            <div className="flex justify-between">
              <span>Jarak tempuh:</span>
              <span className="font-medium">{value.dailyDistanceKm} km</span>
            </div>
            {value.fuel && (
              <div className="flex justify-between">
                <span>Bahan bakar:</span>
                <span className="font-medium capitalize">{value.fuel}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Image src="/icons/chevron-right.svg" alt="" width={7} height={12} />
    </button>
  );
}
