"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import Button from "@/components/ui/Button"
// --- (BARU) Impor dialog Anda ---
import SuccessDialog from "@/components/ui/SuccessDialog"
import { useOnboarding } from "@/stores/onboarding";
import useAuth from "@/hooks/useAuth";
import { userService } from "@/services/user";

export default function ActivationContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { markActivated } = useOnboarding();
  const { getIdToken } = useAuth();
  const type = searchParams?.get("type") || "individu"
  const phone = searchParams?.get("phone") || ""

  // --- (DIUBAH) State ini sekarang untuk dialog ---
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(59)

  useEffect(() => {
    setMounted(true)

    // --- (DIUBAH) Cek "magic link" dan TAMPILKAN DIALOG ---
    if (searchParams.get("verified") === "true") {
      // Update backend when coming from magic link
      (async () => {
        try {
          const token = await getIdToken();
          if (token) {
            await userService.updateProfile({ active: true }, token);
            console.log("✅ User activated via magic link");
          }
        } catch (error) {
          console.error("❌ Failed to activate user via magic link:", error);
        }
      })();
      
      markActivated();
      setShowSuccessDialog(true);
    }
  }, [searchParams, markActivated, getIdToken]);

  // Countdown timer
  useEffect(() => {
    // Jangan jalankan timer jika dialog sedang tampil
    if (!mounted || showSuccessDialog) return 

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [mounted, showSuccessDialog])

  // "Klik Link Aktivasi" (Simulasi)
  const handleActivationClick = async () => {
    try {
      // 1. Update backend - set active: true
      const token = await getIdToken();
      if (token) {
        await userService.updateProfile({ active: true }, token);
        console.log("✅ User activated in backend");
      }
      
      // 2. Update Zustand store
      markActivated();
      
      // 3. Show success dialog
      setShowSuccessDialog(true);
    } catch (error) {
      console.error("❌ Failed to activate user:", error);
      // Still show dialog even if backend fails (for development)
      markActivated();
      setShowSuccessDialog(true);
    }
  }

  // --- (BARU) Aksi setelah dialog ditutup ---
  const handleDialogClose = () => {
    setShowSuccessDialog(false); 
    // Arahkan ke onboarding
    router.push(`/complete-profile?type=${type}&phone=${phone}`);
  }

  const handleResend = () => {
    console.log("Kirim ulang link aktivasi")
    setCountdown(59)
  }

  // Skeleton
  if (!mounted) {
    return (
      <main className="min-h-dvh bg-white text-black px-5 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
          <div className="h-32 w-32 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </main>
    )
  }

  // --- (DIUBAH) Hapus 'if (isVerified)' ---
  // Tampilan 1: "Link Aktivasi Terkirim!" (Selalu tampil)
  return (
    // Fragment agar bisa merender <main> DAN <SuccessDialog>
    <> 
      <main className="min-h-dvh bg-white text-black px-5 py-8" suppressHydrationWarning>
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
          {/* Icon Success */}
          <div className="mb-8">
            <Image
              src="/check-badge.svg"
              alt="Success"
              width={120}
              height={120}
              className="w-[120px] h-[120px]"
              priority
            />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-semibold text-center mb-3">
            Link Aktivasi Terkirim!
          </h1>

          {/* Description */}
          <p className="text-sm text-center text-black/70 mb-6 max-w-[300px]">
            Silahkan cek pesan WhatsApp Anda! Kami telah mengirimkan link aktivasi Anda untuk melanjutkan prosesnya.
          </p>

          {/* Resend Timer */}
          <div className="mb-8 text-center">
            {/* ... (logika countdown tidak berubah) ... */}
            <p className="text-sm text-black/70">
              <span className="font-medium">Tidak menerima pesan?</span>{" "}
              {countdown > 0 ? (
                <button disabled className="text-black/40 cursor-not-allowed">
                  Ulangi
                </button>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-primary font-semibold hover:underline"
                >
                  Ulangi
                </button>
              )}
            </p>
            {countdown > 0 && (
              <p className="text-xs text-primary font-mono mt-1">
                00:{countdown.toString().padStart(2, "0")}
              </p>
            )}
          </div>

          {/* CTA Button (Simulasi) */}
          <Button size="lg" fullWidth onClick={handleActivationClick}>
            Klik Link Aktivasi (Simulasi)
          </Button>
        </div>
      </main>

      {/* --- (BARU) Render Tampilan 2 (Dialog) di sini --- */}
      <SuccessDialog
        open={showSuccessDialog}
        message="Aktivasi Akun Anda Berhasil" // <-- Pesan dari Tampilan 2
        onClose={handleDialogClose} // <-- Arahkan ke onboarding saat ditutup
        // autoCloseMs={1500} // (Otomatis dari default)
      />
    </>
  )
}