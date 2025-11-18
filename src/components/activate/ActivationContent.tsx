"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
// --- (BARU) Impor dialog Anda ---
import { authService } from "@/services/auth";

export default function ActivationContent() {
  const searchParams = useSearchParams()
  const phone = searchParams?.get("phone") || ""

  // constants
  const DURATION = 59 // seconds
  const STORAGE_PREFIX = "activation_start_"
  const storageKey = phone ? `${STORAGE_PREFIX}${phone.replace(/[^0-9]/g, "")}` : null

  // states
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState<number>(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // interval ref so we can clear across renders
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [searchParams])

  // helper: clear any running timer and remove stored key(s)
  const clearStoredTimers = () => {
    try {
      // remove keys for this phone (and any other activation keys)
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k?.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k)
      }
    } catch {}

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCountdown(0)
  }

  // expose a global helper so other pages (login/verify) can clear timers
  useEffect(() => {
    // attach typed property to window to avoid `any`
    (window as Window & { clearActivationTimer?: () => void }).clearActivationTimer = clearStoredTimers
    return () => {
      try {
        delete (window as Window & { clearActivationTimer?: () => void }).clearActivationTimer
      } catch {}
    }
  }, [])

  // start counting down from a number of seconds
  const startInterval = (seconds: number) => {
    // clear previous if any
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setCountdown(seconds)
    timerRef.current = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          // remove stored key when finished
          if (storageKey) localStorage.removeItem(storageKey)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // check localStorage on mount and resume timer if present
  useEffect(() => {
    if (!mounted) return

    // nothing to do if no phone provided
    if (!storageKey) return

    try {
      const startMsStr = localStorage.getItem(storageKey)
      if (!startMsStr) return
      const startMs = Number(startMsStr)
      if (isNaN(startMs)) {
        localStorage.removeItem(storageKey)
        return
      }

      const elapsed = Math.floor((Date.now() - startMs) / 1000)
      const remaining = Math.max(0, DURATION - elapsed)
      if (remaining > 0) {
        startInterval(remaining)
      } else {
        // expired
        localStorage.removeItem(storageKey)
      }
    } catch (e) {
      console.error("Failed to resume activation timer:", e)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [mounted, storageKey])

  // Normalize phone number for backend: remove non-digits, ensure country code '62'
  const normalizePhoneForBackend = (p: string) => {
    if (!p) return null
    const digits = p.replace(/[^0-9]/g, "")
    if (!digits) return null
    if (digits.startsWith("0")) return "62" + digits.slice(1)
    if (digits.startsWith("62")) return digits
    if (digits.length === 9 || digits.length === 10 || digits.startsWith("8")) return "62" + digits
    return digits
  }

  const startLocalTimer = () => {
    if (!storageKey) return
    const now = Date.now()
    try { localStorage.setItem(storageKey, String(now)) } catch {}
    startInterval(DURATION)
  }

  const handleResend = async () => {
    setErrorMsg(null)
    if (!phone) {
      setErrorMsg("Nomor telepon tidak tersedia. Silakan mulai ulang proses masuk.")
      return
    }

    const normalized = normalizePhoneForBackend(phone)
    if (!normalized) {
      setErrorMsg("Nomor telepon tidak valid untuk dikirimkan. Silakan periksa kembali.")
      return
    }

    try {
      await authService.initiateWhatsApp(normalized)
      // only start timer when backend responded OK
      startLocalTimer()
    } catch (err: unknown) {
      console.error("Failed to resend WhatsApp link:", err)
      const message = err instanceof Error ? err.message : "Gagal mengirim ulang link."
      setErrorMsg(message)
    }
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