"use client";

import Image from "next/image";

type Props = {
  title: string;
  subtitle: string;
  footer?: string;
  iconSrc?: string; // default lencana
};

export default function BadgeCard({
  title,
  subtitle,
  footer,
  iconSrc = "/images/lencana.png",
}: Props) {
  return (
    <section
      className="mt-4 rounded-2xl border p-4 flex gap-3"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <div className="h-9 w-9 grid place-items-center rounded-full bg-[color:var(--color-secondary)]">
        <Image src={iconSrc} alt="" width={36} height={36} />
      </div>
      <div className="flex-1">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-black/60">{subtitle}</div>
        {footer && <div className="text-sm">{footer}</div>}
      </div>
    </section>
  );
}
