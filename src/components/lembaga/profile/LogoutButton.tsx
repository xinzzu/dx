"use client";

import Image from "next/image";

type Props = {
  onClick: () => void;
};

export default function LogoutButtonLembaga({ onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full rounded-2xl border border-[color:var(--color-danger)] px-4 py-3 text-[15px] font-medium text-[color:var(--color-danger)] flex items-center justify-center gap-2"
    >
      <Image 
        src="/icons/profile/logout.svg" 
        alt=""
        width={20}
        height={20}
      />
      <span>Keluar</span>
    </button>
  );
}