"use client";

import Image from "next/image";
import clsx from "clsx";

type Props = {
  iconSrc: string;
  title: string;
  desc: string;
  owned?: boolean; // beri bingkai hijau jika dimiliki
  className?: string;
};

export default function OrgBadgeCard({ iconSrc, title, desc, owned, className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-2xl bg-white px-4 py-4 shadow-sm border",
        owned ? "border-emerald-400" : "border-black/10",
        className
      )}
    >
      <div className="mb-4">
        <div className="grid h-12 w-12 place-items-center rounded-full">
          <Image src={iconSrc} alt="" width={50} height={50} />
        </div>
      </div>

      <div className="text-left">
        <div className="text-[14px] font-semibold leading-snug">{title}</div>
        <p className="mt-1 text-[12px] leading-snug text-black/50">{desc}</p>
      </div>
    </div>
  );
}
