"use client";

import Image from "next/image";
import Link from "next/link";

export default function TransportasiCard({
  icon,
  title,
  subtitle,
  href,
}: {
  icon: string;       // /images/transport/car.png, dll.
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border p-3 hover:bg-black/[0.02] transition"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <span className="grid h-16 w-16 place-items-center rounded-xl bg-[color:var(--color-secondary)]">
        <Image src={icon} alt="" width={36} height={36} />
      </span>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-sm text-black/60">{subtitle}</div>
      </div>
      <Image src="/icons/chevron-right.svg" alt="" width={6.32} height={11.31} />
    </Link>
  );
}
