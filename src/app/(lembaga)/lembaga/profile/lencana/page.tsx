// src/app/(lembaga)/lembaga/profile/lencana/page.tsx
"use client";

import { useRouter } from "next/navigation";
import BadgeCard from "@/components/shared/profile/BadgeCard";
import { ALL_BADGES, OWNED_BADGE_IDS } from "@/data/badge";

export default function OrgBadgesPage() {
  const router = useRouter();

  const owned  = ALL_BADGES.filter((b) => OWNED_BADGE_IDS.includes(b.id));
  const others = ALL_BADGES.filter((b) => !OWNED_BADGE_IDS.includes(b.id));

  return (
    <main className="min-h-dvh bg-white text-black">
      <div className="mx-auto max-w-lg px-4 pb-6 pt-4">
        {/* Header custom: chevron left + title center + divider */}
        <div className="relative mb-2">
          <button
            onClick={() => router.back()}
            aria-label="Kembali"
            className="absolute left-0 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl hover:bg-black/5"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 19L8 12L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h2 className="text-center text-base font-semibold">Koleksi Lencana</h2>
        </div>
        <div className="mb-2 h-[2px] w-full rounded" style={{ backgroundColor: "var(--color-primary)" }} />

        <h3 className="mt-4 mb-2 text-[15px] font-semibold">Lencana dimiliki</h3>
        <div className="grid grid-cols-2 gap-4">
          {owned.map((b) => (
            <BadgeCard key={b.id} iconSrc={b.icon} title={b.title} desc={b.desc} owned />
          ))}
        </div>

        <h3 className="mt-6 mb-2 text-[15px] font-semibold">Semua Lencana</h3>
        <div className="grid grid-cols-2 gap-4">
          {others.map((b) => (
            <BadgeCard key={b.id} iconSrc={b.icon} title={b.title} desc={b.desc} />
          ))}
        </div>
      </div>
    </main>
  );
}
