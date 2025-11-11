// src/app/(app)/app/profil/lencana/page.tsx
"use client";

import { useRouter } from "next/navigation";
import BadgeCard from "@/components/shared/profile/BadgeCard";
import { ALL_BADGES, OWNED_BADGE_IDS } from "@/data/badge";
import ScrollContainer from "@/components/nav/ScrollContainer";
import Image from "next/image";

export default function BadgesCollectionPage() {
  const router = useRouter();

  const owned  = ALL_BADGES.filter(b => OWNED_BADGE_IDS.includes(b.id));
  const others = ALL_BADGES.filter(b => !OWNED_BADGE_IDS.includes(b.id));

  return (
     <ScrollContainer
                   headerTitle="Koleksi Lencana"
                   leftContainer={
                     <button
                       onClick={() => router.back()}
                       aria-label="Kembali"
                       className="h-9 w-9 grid place-items-center"
                     >
                       <Image src="/arrow-left.svg" alt="" width={18} height={18} />
                     </button>
                   }
                 >

        {/* Lencana dimiliki */}
        <h3 className="mt-4 mb-2 text-[15px] font-semibold">Lencana dimiliki</h3>
        <div className="grid grid-cols-2 gap-4">
          {owned.map(b => (
            <BadgeCard key={b.id} iconSrc={b.icon} title={b.title} desc={b.desc} owned />
          ))}
        </div>

        {/* Semua Lencana */}
        <h3 className="mt-6 mb-2 text-[15px] font-semibold">Semua Lencana</h3>
        <div className="grid grid-cols-2 gap-4">
          {others.map(b => (
            <BadgeCard key={b.id} iconSrc={b.icon} title={b.title} desc={b.desc} />
          ))}
        </div>
      
    </ScrollContainer>
  );
}
