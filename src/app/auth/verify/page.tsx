"use client"

import { useEffect, useState, useCallback } from "react"
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

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)

  const exchangeAndLogin = useCallback(async (urlToken: string) => {
    setError(null)
    setLoading(true)

    try {
      let tokenToUse = authService.getToken() || null;

      if (!tokenToUse && urlToken) {

        try {
          if (authService && typeof authService.exchangeWhatsAppToken === "function") {
            tokenToUse = await authService.exchangeWhatsAppToken(urlToken)
          }
        } catch {
          // Fallback di bawah
        }

        if (!tokenToUse) {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "https://cahayamu.id/api/v1"
          const res = await fetch(`${API_BASE}/auth/whatsapp/exchange`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: urlToken }),
          })
          const body = await res.text().then((t) => {
            try { return JSON.parse(t) } catch { return { rawText: t } }
          })
          console.debug("[verify] activation exchange response", { status: res.status, body })
          if (!res.ok) throw new Error(body?.meta?.message || body?.message || `HTTP ${res.status}`)
          tokenToUse = body?.data?.access_token || body?.data?.token || body?.token || null
        }
      }

      if (!tokenToUse) {
        if (urlToken) {
          throw new Error("Access token tidak tersedia. Mungkin link sudah digunakan atau kadaluarsa.");
        } else {
          return;
        }
      }

      try {
        if (authService && typeof authService.saveToken === "function") authService.saveToken(tokenToUse)
        else localStorage.setItem("backend_token", tokenToUse)
        setAccessToken(tokenToUse);
      } catch {
        localStorage.setItem("backend_token", tokenToUse)
        setAccessToken(tokenToUse);
      }

      const me = await userService.getMe(tokenToUse)
      console.debug("[verify] fetched user after exchange", { id: me?.id })

      try {
        try { (window as Window & { clearActivationTimer?: () => void }).clearActivationTimer?.(); } catch { }
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k?.startsWith("activation_start_")) localStorage.removeItem(k)
        }
      } catch (e) {
        console.warn("Failed to clear activation timer from storage:", e)
      }

      setShowSuccessDialog(true)
    } catch (e: unknown) {
      console.error("[verify] activation failed", e)
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setShowSuccessDialog]);

  useEffect(() => {
    const urlToken = searchParams?.get("token");

    if (urlToken) {
      exchangeAndLogin(urlToken);
    } else {
      const existing = authService.getToken() || localStorage.getItem("backend_token");
      if (existing) setAccessToken(existing);
    }
  }, [searchParams, exchangeAndLogin]);

  const handleDialogClose = () => {
    try {
      markActivated()
    } finally {
      router.replace("/complete-profile")
    }
  }

  return (
    <>
      <main className="min-h-dvh bg-white text-black px-5 py-8" suppressHydrationWarning>
        <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
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
            <p className="text-sm mb-4">Memproses {token ? 'data profil' : 'verifikasi'}, mohon tunggu...</p>
          ) : null}

          {error && <p className="text-sm text-red-600 mb-4">Perhatian: {error}</p>}
          <h1 className="text-2xl font-semibold text-center mb-3">{token ? 'Verifikasi Akun' : 'Konfirmasi Aktivasi Akun'}</h1>

          <p className="text-sm text-center text-black/70 mb-6 max-w-[300px]">
            Nomor WhatsApp Anda telah terverifikasi. Silahkan klik tombol di bawah ini untuk {token ? 'masuk ke akun anda' : 'menyelesaikan pendaftaran'}.
          </p>

          <Button
            size="lg"
            fullWidth
            onClick={showSuccessDialog ? handleDialogClose : () => exchangeAndLogin(token)}
            disabled={loading || (!token && !error)}
          >
            {loading
              ? 'Memproses...'
              : showSuccessDialog
                ? 'Lanjut ke Profil'
                : 'Aktivasi Akun / Ulangi'
            }
          </Button>
        </div>
      </main>

      <SuccessDialog
        open={showSuccessDialog}
        message={token ? 'Akun berhasil diverifikasi' : 'Aktivasi Akun Anda Berhasil'}
        onClose={handleDialogClose}
      />
    </>
  )
}