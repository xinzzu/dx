"use client";

import Link from "next/link";
import Image from "next/image";

type Props =
  | { as?: "button"; onClick?: () => void; href?: never }
  | { as?: "link"; href: string; onClick?: never };

export default function SettingRow({
  as = "link",
  href = "#",
  onClick,
  icon,           // SVG path relatif di /public/icons/*.svg
  title,
  subtitle,
}: Props & {
  icon: string;
  title: string;
  subtitle?: string;
}) {
  const content = (
    <div className="flex items-center gap-3">
      <div
        className="grid h-10 w-10 place-items-center rounded-full"
        style={{ backgroundColor: "var(--color-background)" }}
      >
        <Image src={icon} alt="" width={18} height={18} />
      </div>

      <div className="flex-1">
        <div className="text-[15px] font-medium">{title}</div>
        {subtitle && <div className="text-sm text-black/60">{subtitle}</div>}
      </div>

      <Image src="/icons/chevron-right.svg" alt="" width={6.32} height={11.31} />
    </div>
  );

  return (
    <div className="py-4">
      {as === "link" ? (
        <Link href={href} className="block">{content}</Link>
      ) : (
        <button type="button" onClick={onClick} className="w-full text-left">
          {content}
        </button>
      )}
    </div>
  );
}
