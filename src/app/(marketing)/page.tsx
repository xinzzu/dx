// src/app/(marketing)/page.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function WelcomePage() {
  const router = useRouter();

  return (
    <main className="min-h-dvh grid place-items-center bg-white text-black px-5">
      <section className="w-full max-w-sm text-center">
        <h1 className="text-[26px] leading-snug font-semibold">
          Ukur Dampakmu
          <br /> Ciptakan Perubahan
        </h1>
        <p className="mt-2 text-sm text-black/70">
          Platform jejak karbon untuk personal dan organisasi
        </p>

        <div className="mt-8 mb-10">
          <Image
            src="/carbon-illustration.png"
            alt="Ilustrasi energi hijau dan jejak karbon"
            width={360}
            height={260}
            className="mx-auto h-auto w-full max-w-[360px]"
            priority
          />
        </div>

        <div className="space-y-4">
          <Button
            size="lg"
            fullWidth
            onClick={() => router.push("/auth/login?intent=login")}
          >
            Masuk
          </Button>

          {/* <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => router.push("/auth/login?intent=register")}
          >
            Belum ada akun? Daftar dulu
          </Button> */}
        </div>

        <p className="mt-6 text-xs text-black/60">
          Dengan masuk atau mendaftar, kamu menyetujui
          {" "}
          <a href="/terms" className="font-semibold text-[#22C55E]">Syarat & Ketentuan</a>
          {" "}
          dan
          {" "}
          <a href="/privacy" className="font-semibold text-[#22C55E]">Kebijakan Privasi</a>.
        </p>
      </section>
    </main>
  );
}
