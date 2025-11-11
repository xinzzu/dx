
"use client";

import Image from "next/image";

type Props = {
  icon?: string;         // e.g. /icons/bolt.svg
  title: string;
  actionText?: string;   // e.g. "Lihat Semua"
  onAction?: () => void;
  className?: string;
};

export default function SectionHeader({
  icon,
  title,
  actionText,
  onAction,
  className = "",
}: Props) {
  return (
    <div className={["mb-2 flex items-center justify-between", className].join(" ")}>
      <div className="flex items-center gap-2">
        {icon && <Image src={icon} alt="" width={30} height={30} />}
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="text-sm text-[color:var(--color-primary)]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
