// src/components/individu/catat/ReportRow.tsx
"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";
import Link from "next/link";

type Props = {
  title: string;         // "Transportasi"
  subtitle?: string;     // optional; kalau tidak diisi, dibentuk dari dateISO + amount
  dateISO?: string;      // "2025-10-20"
  amount?: number;       // 375
  href?: string;
  className?: string;
};

function formatDateId(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ReportRow({
  title,
  subtitle,
  dateISO,
  amount,
  href = "#",
  className,
}: Props) {
  // const sub =
  //   subtitle ??
  //   [formatDateId(dateISO), typeof amount === "number" ? `${amount} kg CO₂e` : null]
  //     .filter(Boolean)
  //     .join(" • ");

  const sub =
    subtitle ??
    [formatDateId(dateISO), typeof amount === "number" ? `${formatCarbonFootprint(amount).value} ${formatCarbonFootprint(amount).unit}` : null]
      .filter(Boolean)
      .join(" • ");

  return (
    <Link
      href={href}
      className={[
        "relative block rounded-2xl border bg-white px-4 py-3",
        "transition-colors hover:bg-black/[0.02] focus:outline-none",
        "focus:ring-2 focus:ring-[color:var(--color-primary)]/30",
        className || "",
      ].join(" ")}
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div className="pr-6">
        <div className="text-[15px] font-semibold">{title}</div>
        {sub ? <div className="truncate text-[12px] text-black/60">{sub}</div> : null}
      </div>

      <svg
        width="8"
        height="12"
        viewBox="0 0 8 12"
        aria-hidden
        className="absolute right-4 top-1/2 -translate-y-1/2 text-black/60"
      >
        <path
          d="M2 1l4 5-4 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
