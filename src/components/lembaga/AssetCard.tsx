"use client";

import Image from "next/image";

type Props = {
  icon: string;
  title: string;
  detail: string;
};

export default function AssetSummaryCard({ icon, title, detail }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-3">
      <Image src={icon} alt={title} width={32} height={32} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-black/60">{detail}</div>
      </div>
      <button aria-label={`Edit ${title}`}>
        <Image src="/icons/profile/edit.svg" alt="Edit" width={20} height={20} />
      </button>
    </div>
  );
}
