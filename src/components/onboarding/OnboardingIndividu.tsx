"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useOnboarding } from "@/stores/onboarding";

// tujuan baru (flow aset)
const NEXT_ROUTE = "/setup/individu/assets/bangunan";

export default function OnboardingIndividu() {
  const router = useRouter();
  const { markOnboardingCompleted } = useOnboarding();

  function goNext() {
    markOnboardingCompleted();         // ⬅️ penting untuk guard langkah berikutnya
    router.replace(NEXT_ROUTE);        // pakai replace biar nggak balik ke sini
  }

  return (
    <section className="w-full max-w-sm text-center">
      <h1 className="text-[26px] leading-snug font-semibold whitespace-pre-line">
        {"Setiap Langkahmu\nMeninggalkan Jejak"}
      </h1>

      <div className="mt-8 mb-10">
        <Image
          src="/onboarding.png"
          alt="Ilustrasi jejak karbon"
          width={360}
          height={220}
          className="mx-auto h-auto w-full max-w-[360px]"
          priority
        />
      </div>

      <p className="mt-3 text-sm text-black/70 whitespace-pre-line">
        {"Yuk, hitung jejak karbonmu dalam satu bulan\n" +
          "dan mulai petualangan untuk menguranginya!\n" +
          "Jawabanmu tidak perlu 100% akurat, cukup perkiraan saja ya!"}
      </p>

      <Button size="lg" className="w-full mt-6" onClick={goNext}>
        Mulai Sekarang!
      </Button>
    </section>
  );
}
