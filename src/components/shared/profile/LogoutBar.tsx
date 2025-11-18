"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";

type Props = {
  onClick: () => void;
  isLoggingOut: boolean;
};

export default function LogoutBar({ onClick, isLoggingOut }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoggingOut}
      className={`
                mt-6 w-full rounded-2xl border cursor-pointer 
                hover:shadow-md px-4 py-3 text-[15px] font-medium 
                flex items-center justify-center gap-2 transition-opacity duration-200
                ${isLoggingOut
          ? 'opacity-70 cursor-not-allowed bg-gray-50 border-gray-300 text-gray-500'
          : 'border-[color:var(--color-danger)] text-[color:var(--color-danger)]'
        }
            `}
    >
      {isLoggingOut ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Image
          src="/icons/profile/logout.svg"
          alt=""
          width={20}
          height={20}
        />
      )}

      <span>Keluar</span>
    </button>
  );
}