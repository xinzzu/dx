"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { authService } from "@/services/auth";
import Button from "@/components/ui/Button";
import Divider from "@/components/ui/Divider";
import PhoneInput from "@/components/ui/PhoneInput";
import AuthLayout from "@/components/auth/AuthLayout";

function toE164FromLocal62(localDigits: string) {
  const trimmed = localDigits.replace(/\D/g, "").replace(/^0+/, "");
  return `+62${trimmed}`;
}

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();

  // callback dari query, default ke complete-profile
  const callback = params.get("callback") || "/complete-profile";

  const { currentUser, loading, googleLogin } = useAuth();

  // ⛳️ Routing TEPAT SETELAH login
  useEffect(() => {
    if (loading) return;
    if (!currentUser) return;

    // Prefer bendera dari sesi login
    const via = sessionStorage.getItem("login_via");
    const storedCb = sessionStorage.getItem("post_login_callback");
    const providers = currentUser.providerData?.map((p) => p.providerId) ?? [];
    const isGoogle = via === "google" || providers.includes("google.com");

    // tentukan tujuan
    const dest = isGoogle
      ? (storedCb || callback || "/complete-profile")
      : "/activate"; // WA/magic-link → activate

    // berangkat dan bersihkan flag
    router.replace(dest);
    sessionStorage.removeItem("login_via");
    sessionStorage.removeItem("post_login_callback");
  }, [currentUser, loading, callback, router]);

  // ====== WA form (tetap seperti punyamu) ======
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [loadingPhone, setLoadingPhone] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const canSubmit = useMemo(() => phone.replace(/\D/g, "").length >= 9, [phone]);

  const submitPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!canSubmit) return setErr("Nomor WhatsApp minimal 9 digit");
    setLoadingPhone(true);

    // Normalize to backend expected format (no plus, e.g. 6281...)
    const digits = phone.replace(/\D/g, "");
    const normalize = (d: string) => {
      if (!d) return null;
      if (d.startsWith("+")) d = d.replace(/^\+/, "");
      if (d.startsWith("0")) return `62${d.slice(1)}`;
      if (d.startsWith("62")) return d;
      if (d.startsWith("8")) return `62${d}`;
      return d; // fallback
    };

    const normalized = normalize(digits);
    if (!normalized) {
      setErr("Nomor tidak valid untuk dikirimkan.");
      setLoadingPhone(false);
      return;
    }

    try {
      // ask backend to send WA magic-link
      await authService.initiateWhatsApp(normalized);

      // Keep the visible query phone as +62... (E.164) for activate page UX
      const e164 = toE164FromLocal62(phone);
      const q = new URLSearchParams({ mode: "login", phone: e164 }).toString();
      router.push(`/activate?${q}`);
    } catch (err: unknown) {
      // Surface backend error to user
      setErr(err instanceof Error ? err.message : "Gagal mengirim link WhatsApp.");
    } finally {
      setLoadingPhone(false);
    }
  };

  const onGoogle = async () => {
    setGoogleLoading(true);
    setErr("");
    try {
      // simpan callback agar flow redirect juga tahu mau ke mana
      sessionStorage.setItem("post_login_callback", callback);
      await googleLogin(); // popup/redirect → balik → useEffect di atas yang nentuin rute
    } catch (e: unknown) {
      setGoogleLoading(false);
      setErr(e instanceof Error ? e.message : "Gagal login dengan Google.");
    }
  };

  // ⬇️ REMOVED: Loading screen yang tidak perlu untuk Google flow
  // Google login pakai popup, tidak perlu blocking UI dengan loading screen
  
  return (
    <AuthLayout
      title="Masukkan Nomor WhatsApp"
      subtitle="Nomor whatsapp kamu akan dipakai untuk proses verifikasi dan masuk ke akun."
    >
      <form onSubmit={submitPhone} className="space-y-6">
        <PhoneInput
          id="phone"
          label="Nomor WhatsApp"
          placeholder="81xxxx"
          value={phone}
          onValueChange={(v) => { setPhone(v); if (err) setErr(""); }}
          error={err}
          required
          maxLength={13}
          autoComplete="tel"
        />
        <Button type="submit" size="lg" fullWidth disabled={!canSubmit || loadingPhone || googleLoading}>
          {loadingPhone ? "Memproses..." : "Lanjut"}
        </Button>
      </form>

      <Divider />

      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={onGoogle}
        disabled={loadingPhone || googleLoading}
        className="border-primary text-primary hover:bg-primary/5"
      >
        <span className="flex items-center justify-center gap-3">
          <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>

          <span>{googleLoading ? "Memproses..." : "Lanjutkan dengan Google"}</span>
        </span>
      </Button>

      {err ? <p className="mt-3 text-sm text-red-500">{err}</p> : null}
    </AuthLayout>
  );
}
