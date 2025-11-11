// src/components/catat/SavedActivityItem.tsx
"use client";

import Image from "next/image";

type Props = {
  icon: string;
  title: string;
  sub: string;
  value: number;
  unitRight: string;
  isLastItem: boolean;
};

export default function SavedActivityItem({
  icon,
  title,
  sub,
  value,
  unitRight,
  isLastItem,
}: Props) {
  return (
    <div className="py-3">
      <div className="flex items-start gap-3">
        <Image src={icon} alt="" width={22} height={22} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px]">{title}</div>
          <div className="text-sm text-black/60">{sub}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[15px] font-semibold">{value}</div>
          <div className="text-xs text-black/60">{unitRight}</div>
        </div>
      </div>
      {!isLastItem && <div className="mt-3 h-px w-full bg-black/10" />}
    </div>
  );
}