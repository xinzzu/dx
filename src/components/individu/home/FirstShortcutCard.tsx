"use client";

import { useRouter } from "next/navigation";
import ShortcutCard from "./ShortcutCard";
import { useOnboarding, useShouldShowFirstShortcut } from "@/stores/onboarding";

export default function FirstShortcutCard() {
  const router = useRouter();
  const show = useShouldShowFirstShortcut();
  const { markShortcutSeen } = useOnboarding();

  if (!show) return null;

  return (
    <ShortcutCard
      className="mt-4"
      title="Saatnya Mulai Pencatatan!"
      subtitle="Jejak karbon bulan ini masih kosong, ayo mulai catat aktivitasmu."
      ctaLabel="＋  Catat Emisi Karbon"
      onCta={() => {
        markShortcutSeen();
        router.push("/app/catat");
      }}
      variant="primary"
      imageSrc="/images/profile/shortcut.png" // taruh file di public/
      imageBg="bg-[#D8F4E6]" // opsional: ganti warna latar ikon
    />
  );
}
