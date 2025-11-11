"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Button from "@/components/ui/Button"
import { authService } from "@/services/auth"
import { userService } from "@/services/user"
import { useOnboarding } from "@/stores/onboarding"
import Image from "next/image"
import SuccessDialog from "@/components/ui/SuccessDialog"

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams?.get("token") || ""
  const { markActivated } = useOnboarding()

  const [loading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  // dialog state
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  useEffect(() => {
    // Do NOT auto-exchange the token on mount. Only attempt to read any existing
    // saved backend token from local storage or authService. The network POST to
    // `/auth/whatsapp/exchange` will happen only when user clicks the activation
    // button (handleActivationClick).
    if (!token) return
    try {
      const existing = authService && typeof authService.getToken === "function"
        ? authService.getToken()
        : localStorage.getItem("backend_token")
      if (existing) setAccessToken(existing)
    } catch {
      const existing = localStorage.getItem("backend_token")
      if (existing) setAccessToken(existing)
    }
  }, [token])

  // (activation via button handles exchange + activation)

  const handleDialogClose = () => {
    try {
      markActivated()
    } finally {
      router.replace("/complete-profile")
    }
  }

  // no auto-resend/countdown here; resend handled in ActivationContent if needed

  // handleResend inlined in JSX to avoid unused-symbol linting

  const handleActivationClick = async () => {
    setError(null)
    try {
      // If we already have a backend token, use it. Otherwise exchange the token from the URL.
      let tokenToUse = accessToken
      if (!tokenToUse) {
        // try to exchange using authService helper if available
        if (token) {
          try {
            if (authService && typeof authService.exchangeWhatsAppToken === "function") {
              tokenToUse = await authService.exchangeWhatsAppToken(token)
            }
          } catch {
            // fallback to direct fetch
          }

          if (!tokenToUse) {
            const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cahayamu.id/api/v1"
            const res = await fetch(`${API_BASE}/auth/whatsapp/exchange`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            })
            const body = await res.text().then((t) => {
              try { return JSON.parse(t) } catch { return { rawText: t } }
            })
            console.debug("[verify] activation exchange response", { status: res.status, body })
            if (!res.ok) throw new Error(body?.meta?.message || body?.message || `HTTP ${res.status}`)
            tokenToUse = body?.data?.access_token || body?.data?.token || body?.token || null
          }
        }
      }

      if (!tokenToUse) throw new Error("Access token tidak tersedia. Pastikan link verifikasi dibuka dari WhatsApp atau tekan 'Ulangi'.")

      // persist token
      try {
        if (authService && typeof authService.saveToken === "function") authService.saveToken(tokenToUse)
        else localStorage.setItem("backend_token", tokenToUse)
      } catch {
        localStorage.setItem("backend_token", tokenToUse)
      }

  // after exchanging and persisting token, fetch current user (do not PUT here)
  const me = await userService.getMe(tokenToUse)
  console.debug("[verify] fetched user after exchange", { id: me?.id })
  setShowSuccessDialog(true)
    } catch (e: unknown) {
      console.error("[verify] activation click failed", e)
      setError(e instanceof Error ? e.message : String(e))
    }
  }


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

          {loading ? (
            <p className="text-sm mb-4">Memproses verifikasi, mohon tunggu...</p>
          ) : null}

          {/* Title */}
          {error && <p className="text-sm text-red-600 mb-4">Perhatian: {error}</p>}
          <h1 className="text-2xl font-semibold text-center mb-3">Konfirmasi Aktivasi Akun</h1>

          {/* Description */}
          <p className="text-sm text-center text-black/70 mb-6 max-w-[300px]">
            Nomor WhatsApp Anda telah terverifikasi. Silahkan klik tombol di bawah ini untuk menyelesaikan pendaftaran.
          </p>
          {/* CTA Button (Simulasi) */}
          <Button size="lg" fullWidth onClick={handleActivationClick}>
            Aktivasi Akun
          </Button>
        </div>
      </main>

      {/* --- (BARU) Render Tampilan 2 (Dialog) di sini --- */}
      <SuccessDialog
        open={showSuccessDialog}
        message="Aktivasi Akun Anda Berhasil"
        onClose={handleDialogClose}
      />
    </>
  )
}

