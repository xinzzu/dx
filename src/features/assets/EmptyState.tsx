"use client";

import clsx from "clsx";
import Image from "next/image";

type EmptyVariant = "building" | "vehicle";

type Props = {
  /** Pilih salah satu:
   *  - pakai variant: "building" | "vehicle"
   *  - atau override icon manual lewat `icon`
   */
  variant?: EmptyVariant;
  icon?: React.ReactNode | string;
  text: string;
  className?: string;
  height?: number; // default 136px
};

const DEFAULT_ICON_BY_VARIANT: Record<EmptyVariant, string> = {
  building: "/icons/lembaga/registrasi/ic-building.svg",
  vehicle:  "/icons/lembaga/registrasi/ic-vehicle.svg",
};

// Sanitize string path untuk Next/Image
function sanitizeIconPath(src: string) {
  if (!src) return "";
  let s = src.replace(/\\/g, "/").trim();
  if (!s.startsWith("/") && !/^https?:\/\//i.test(s)) s = "/" + s;
  return s;
}

export default function EmptyState({
  variant = "building",      // default ke building
  icon,                      // kalau diisi, mengoverride variant
  text,
  className,
  height = 136,
}: Props) {
  const chosenIconPath = DEFAULT_ICON_BY_VARIANT[variant];
  const finalIcon = icon ?? chosenIconPath;

  return (
    <div
      className={clsx(
        "rounded-[16px] border border-dashed px-4 text-center",
        "border-[var(--color-border-muted,#d1d5db)]",
        "bg-[var(--color-surface,white)]",
        className
      )}
      style={{ height }}
    >
      <div className="grid h-full place-items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="text-[var(--color-icon-muted,#9ca3af)]">
            {typeof finalIcon === "string" ? (
              <Image
                src={sanitizeIconPath(finalIcon)}
                alt=""
                width={24}
                height={24}
                className="opacity-70"
                priority={false}
              />
            ) : (
              finalIcon
            )}
          </div>
          <p className="text-sm text-[var(--color-muted,#6b7280)]">{text}</p>
        </div>
      </div>
    </div>
  );
}
