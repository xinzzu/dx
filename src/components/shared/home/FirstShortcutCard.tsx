"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShortcutCard from "./ShortcutCard";
import { useOnboarding, useShouldShowFirstShortcut } from "@/stores/onboarding";
import { getRandomTip } from "@/utils/dailyTips";

type DailyTip = {
  headline: string;
  body: string;
  variant: 'primary';
};

export default function FirstShortcutCard({ totalKg }: { totalKg?: number }) {
  const router = useRouter();
  const show = useShouldShowFirstShortcut();
  const { markShortcutSeen } = useOnboarding();
  const [randomTip, setRandomTip] = useState<DailyTip | null>(null);

  // only show the first-shortcut card when onboarding indicates it AND the
  // user hasn't recorded any emissions yet (totalKg is falsy/zero).
  // if (!show) return null; //munculkan terus saja dulu
  // if (typeof totalKg === "number" && totalKg > 0) return null; //munculkan terus saja dulu

  useEffect(() => {
    if (typeof totalKg === "number" && totalKg > 0) {
      setRandomTip(getRandomTip());
    }
  }, [totalKg]);

  const hasRecordedEmissions = typeof totalKg === "number" && totalKg > 0;

  const title = hasRecordedEmissions && randomTip
    ? randomTip.headline
    : "Saatnya Mulai Pencatatan!";

  const subtitle = hasRecordedEmissions && randomTip
    ? randomTip.body
    : "Jejak karbon bulan ini masih kosong, ayo mulai catat aktivitasmu.";

  const cardVariant = hasRecordedEmissions && randomTip
    ? randomTip.variant
    : "primary";

  return (
    <ShortcutCard
      className="mt-4"
      title={title}
      subtitle={subtitle}
      ctaLabel="＋  Catat Emisi Karbon"
      onCta={() => {
        markShortcutSeen();
        router.push("/app/catat");
      }}
      variant={cardVariant}
      imageSrc="/images/profile/shortcut.png"
      imageBg="bg-[#D8F4E6]"
    />
  );
}