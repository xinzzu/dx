"use client";

import Image from "next/image";
import clsx from "clsx";
import { useRouter } from "next/navigation";

type Props = {
  iconSrc: string;
  title: string;
  subtitle: string;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export default function CategoryItem({
  iconSrc,
  title,
  subtitle,
  href,
  onClick,
  className,
}: Props) {
  const router = useRouter();
  const handle = () => {
    if (onClick) onClick();
    else if (href) router.push(href);
  };

  return (
    <button
      type="button"
      onClick={handle}
      className={clsx(
        "w-full rounded-2xl border px-4 py-3 text-left cursor-pointer hover:shadow-md",
        "bg-white shadow-[0_8px_24px_rgba(0,0,0,.04)]",
        "flex items-center gap-3",
        "border-[color:var(--color-primary)]",
        className
      )}
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#D7F4E8]">
        <Image alt="" src={iconSrc} width={36} height={36} />
      </div>

      <div className="flex-1">
        <div className="text-[15px] font-semibold">{title}</div>
        <div className="text-[13px] text-black/60">{subtitle}</div>
      </div>

      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M9 18l6-6-6-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-black/50"
        />
      </svg>
    </button>
  );
}
