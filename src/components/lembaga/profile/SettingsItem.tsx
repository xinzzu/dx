"use client";

import Link from "next/link";
import Image from "next/image";

type Props = {
  title: string;
  subtitle?: string;
  iconSrc?: string;         // PNG/SVG 24x24
  href?: string;            // kalau ada → pakai Link
  onClick?: () => void;     // kalau button biasa
  showDivider?: boolean;    // garis bawah antar item
};

export default function SettingsItem({
  title,
  subtitle,
  iconSrc,
  href,
  onClick,
  showDivider = true,
}: Props) {
  const Content = (
    <div className="flex items-center justify-between gap-3 py-4">
      {/* Left: circular icon + text */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-full bg-black/10">
          {iconSrc ? (
            <Image src={iconSrc} alt="" width={16} height={24} />
          ) : (
            <span className="h-6 w-6 rounded bg-black/20" />
          )}
        </div>

        <div className="min-w-0">
          <div className="truncate font-medium">{title}</div>
          {subtitle ? (
            <div className="truncate text-sm text-black/60">{subtitle}</div>
          ) : null}
        </div>
      </div>

      {/* Right: chevron */}
      <Image
        src="/icons/chevron-right.svg"
        alt=""
        width={7}
        height={12}
        className="shrink-0"
      />
    </div>
  );

  return (
    <li>
      {href ? (
        <Link href={href} aria-label={title} className="block">
          {Content}
        </Link>
      ) : (
        <button type="button" aria-label={title} onClick={onClick} className="block w-full text-left">
          {Content}
        </button>
      )}
      {showDivider && <div className="h-px w-full bg-black/10" />}
    </li>
  );
}
