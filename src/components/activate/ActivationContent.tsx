"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
// --- (BARU) Impor dialog Anda ---
import { authService } from "@/services/auth";

export default function ActivationContent() {
  const searchParams = useSearchParams()
  const phone = searchParams?.get("phone") || ""
  

  // states
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState(59)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // Keep page in "sent" state (countdown). Activation is handled on /auth/verify.
  }, [searchParams])

  // Countdown timer (unchanged)
  useEffect(() => {
    if (!mounted) return

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
  }, [mounted])

  // no dialog; activation handled on /auth/verify

  const handleResend = () => {
    // Call backend initiate endpoint to re-send WA link
    setCountdown(59)
    setErrorMsg(null)
    if (!phone) {
      setErrorMsg("Nomor telepon tidak tersedia. Silakan mulai ulang proses masuk.")
      return
    }

    // Normalize phone number for backend: remove non-digits, ensure country code '62'
    const normalizePhoneForBackend = (p: string) => {
      if (!p) return null
      // strip spaces, + and non-digit chars
      const digits = p.replace(/[^0-9]/g, "")
      if (!digits) return null
      if (digits.startsWith('0')) return '62' + digits.slice(1)
      if (digits.startsWith('62')) return digits
      if (digits.length === 9 || digits.length === 10 || digits.startsWith('8')) return '62' + digits
      // fallback: return digits as-is
      return digits
    }

    const normalized = normalizePhoneForBackend(phone)
    if (!normalized) {
      setErrorMsg("Nomor telepon tidak valid untuk dikirimkan. Silakan periksa kembali.")
      return
    }

    ;(async () => {
      try {
        await authService.initiateWhatsApp(normalized)
        // keep user on same screen; countdown restarted above
      } catch (err: unknown) {
        console.error("Failed to resend WhatsApp link:", err)
        const message = err instanceof Error ? err.message : "Gagal mengirim ulang link."
        setErrorMsg(message)
      }
    })()
  }

  if (!mounted) {
    return (
      <main className="min-h-dvh bg-white text-black px-5 py-8">
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
          <div className="h-32 w-32 bg-gray-100 rounded-full animate-pulse" />
        </div>
      </main>
    )
  }

  // RENDER: based on `status`
  return (
    <>
      <main className="min-h-dvh bg-white text-black px-5 py-8" suppressHydrationWarning>
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
          <div className="mb-8">
            <Image src="/check-badge.svg" alt="Success" width={120} height={120} className="w-[120px] h-[120px]" priority />
          </div>

            <>
              <h1 className="text-2xl font-semibold text-center mb-3">Link Aktivasi Terkirim!</h1>
              <p className="text-sm text-center text-black/70 mb-6 max-w-[300px]">
                Silahkan cek pesan WhatsApp Anda! Kami telah mengirimkan link aktivasi Anda untuk melanjutkan prosesnya.
              </p>

              <div className="mb-8 text-center">
                <p className="text-sm text-black/70">
                  <span className="font-medium">Tidak menerima pesan?</span>{" "}
                  {countdown > 0 ? (
                    <button disabled className="text-black/40 cursor-not-allowed">Ulangi</button>
                  ) : (
                    <button onClick={handleResend} className="text-primary font-semibold hover:underline">Ulangi</button>
                  )}
                </p>
                {countdown > 0 && <p className="text-xs text-primary font-mono mt-1">00:{countdown.toString().padStart(2,"0")}</p>}
              </div>
            </>
            {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        </div>
      </main>

    </>
  )
}