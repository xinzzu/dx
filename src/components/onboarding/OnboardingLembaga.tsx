"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useOnboarding } from "@/stores/onboarding";

export default function OnboardingLembaga() {
  const router = useRouter();
  const { markOnboardingCompleted, assetsCompleted } = useOnboarding();

  function goNext() {
    markOnboardingCompleted();         // ⬅️ penting untuk guard
    
    // Kalau assets sudah selesai, langsung ke lembaga dashboard
    if (assetsCompleted) {
      // unified destination: /app (pages inside /app decide rendering by userType)
      router.replace("/app");
    } else {
      // Kalau belum, lanjut ke setup assets
      router.replace("/setup/lembaga/assets/bangunan");
    }
  }

  return (
    <section className="w-full max-w-sm text-center">
      <h1 className="text-[26px] leading-snug font-semibold whitespace-pre-line">
        {"Setiap Langkahmu Meninggalkan Jejak"}
      </h1>

      <div className="mt-8 mb-10">
        <Image
          src="/onboarding.png"
          alt=""
          width={360}
          height={220}
          className="mx-auto h-auto w-full max-w-[360px]"
          priority
        />
      </div>

      <p className="text-sm text-black whitespace-pre-line">
        Yuk, hitung jejak karbonmu dalam satu bulan dan mulai petualangan untuk menguranginya!
        Jawabanmu tidak perlu 100% akurat, cukup perkiraan saja ya!
      </p>

      <Button size="lg" className="w-full sm:h-10 mt-6 shadow-lg" onClick={goNext}>
        Mulai Sekarang!
      </Button>
    </section>
  );
}
