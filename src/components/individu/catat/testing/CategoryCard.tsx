// src/components/catat/CategoryCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  icon: string;
  title: string;
  subtitle: string;
  href: string;
};

export default function CategoryCard({ icon, title, subtitle, href }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border p-3"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div className="grid h-14 w-14 place-items-center rounded-xl bg-[color:var(--color-secondary)]">
        <Image src={icon} alt="" width={32} height={32} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{title}</div>
        <div className="text-sm text-black/60 truncate">{subtitle}</div>
      </div>
      <Image src="/icons/chevron-right.svg" alt="" width={7} height={12} />
    </Link>
  );
}