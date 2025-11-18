"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";

// ⬇ TAMBAHAN: progress guard & store
import RequireProgress from "@/components/guards/RequireProgress";
import { useOnboarding } from "@/stores/onboarding";

// ⬇ BARU: Area Service & User Service & Auth Service
import { areaService, Province, Regency, District, Village } from "@/services/area";
import { userService, UserProfile } from "@/services/user";
import { authService } from "@/services/auth";
import useAuth from "@/hooks/useAuth";

// === Tipe Data untuk State & Mode ===
type Mode = "individu" | "lembaga";

type IndividuData = {
  namaLengkap: string;
  email: string;
  nomorTelepon: string;
  jenisKelamin: string;
  address: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
};

type LembagaData = {
  namaLembaga: string;
  email: string;
  nomorTelepon: string;
  jenisLembaga: string;
  address: string;
  provinsi: string;
  kabupaten: string;
  kecamatan: string;
  kelurahan: string;
  kodePos: string;
};

// === Static data ===
const JENIS_KELAMIN = [
  { value: "laki-laki", label: "Laki-laki" },
  { value: "perempuan", label: "Perempuan" },
];

const JENIS_LEMBAGA = [
  { value: "sekolah", label: "Sekolah" },
  { value: "kampus", label: "Kampus" },
  { value: "perusahaan", label: "Perusahaan" },
  { value: "organisasi", label: "Organisasi" },
];

type Props = { onSaved?: () => void | Promise<void> };

export default function CompleteProfileContent({ onSaved }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getIdToken, currentUser: currentFirebaseUser } = useAuth();

  const initialType = (searchParams?.get("type") as Mode) || "individu";

  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<Mode>(initialType);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [submitError, setSubmitError] = useState<string>("");

  // ⬇ BARU: Area Data dari API
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // ⬇ BARU: Loading states untuk setiap dropdown
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [individu, setIndividu] = useState<IndividuData>({
    namaLengkap: "",
    email: "",
    nomorTelepon: "",
    jenisKelamin: "",
    address: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    kodePos: "",
  });

  const [lembaga, setLembaga] = useState<LembagaData>({
    namaLembaga: "",
    email: "",
    nomorTelepon: "",
    jenisLembaga: "",
    address: "",
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    kodePos: "",
  });

  const [errorsInd, setErrorsInd] = useState<Partial<IndividuData>>({});
  const [errorsOrg, setErrorsOrg] = useState<Partial<LembagaData>>({});

  // ⬇ TAMBAHAN: ambil action progress
  const {
    markProfileCompleted,
    markAssetsBuildingsCompleted,
    markAssetsVehiclesCompleted,
    markAssetsCompleted,
    markActivated,
  } = useOnboarding();

  // ⬇ BARU: Convert API data to Select options format
  const provinceOptions = provinces.map((p) => ({
    value: p.Code,
    label: p.Name,
  }));

  const regencyOptions = regencies.map((r) => ({
    value: r.Code,
    label: r.Name,
  }));

  const districtOptions = districts.map((d) => ({
    value: d.Code,
    label: d.Name,
  }));

  const villageOptions = villages.map((v) => ({
    value: v.Code,
    label: v.Name,
  }));

  useEffect(() => setMounted(true), []);

  // ⬇ REMOVED: Auto-activation sudah di-handle di useAuth.ts
  // Google user: markActivated() dipanggil di googleLogin() sebelum navigate
  // WhatsApp user: markActivated() dipanggil di ActivationContent setelah klik link
  // No need for duplicate logic here!

  // ⬇ BARU: Load current user data dari backend
  useEffect(() => {
    async function loadUser() {
      setLoadingUser(true);
      try {
        // prefer backend access token saved by authService; fallback to Firebase ID token + exchange
        let token: string | null = authService.getToken() ?? null;

        // if no backend token, try to get firebase id token and exchange it
        if (!token) {
          const firebaseIdToken = await getIdToken();
          if (firebaseIdToken && currentFirebaseUser) {
            try {
              const backendAccessToken = await authService.loginWithGoogle(firebaseIdToken);
              authService.saveToken(backendAccessToken);
              token = backendAccessToken;
              console.log("Backend token obtained successfully");
            } catch (exchangeError) {
              console.error("Failed to exchange Firebase token:", exchangeError);
              setLoadingUser(false);
              return;
            }
          }
        }
        if (!token) {
          console.warn("No backend token. User must login first.");
          setLoadingUser(false);
          return;
        }

        const userData = await userService.getMe(token);
        setCurrentUser(userData);

        // Sync onboarding flags from backend user object so UI reflects
        // server-side completion state (e.g. when user already completed
        // profile on another device or via magic link).
        try {
          if (userData.is_profile_complete) {
            markProfileCompleted();
          }
          if (userData.is_asset_buildings_completed) {
            markAssetsBuildingsCompleted();
          }
          if (userData.is_asset_vehicles_completed) {
            markAssetsVehiclesCompleted();
          }
          // If both asset bits are true, mark overall assets completed
          if (userData.is_asset_buildings_completed && userData.is_asset_vehicles_completed) {
            markAssetsCompleted();
          }
          // If token exists, consider user activated
          markActivated();
        } catch (e) {
          // non-fatal: don't block page if store update fails
          console.debug('[onboarding] failed to sync flags', e);
        }

        // Pre-fill email dari backend
        if (userData.email) {
          setIndividu((prev) => ({ ...prev, email: userData.email }));
          setLembaga((prev) => ({ ...prev, email: userData.email }));
        }

        // Pre-fill phone number jika ada
        if (userData.phone_number) {
          setIndividu((prev) => ({ ...prev, nomorTelepon: userData.phone_number || "" }));
          setLembaga((prev) => ({ ...prev, nomorTelepon: userData.phone_number || "" }));
        }

      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoadingUser(false);
      }
    }

    if (mounted) {
      loadUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, currentFirebaseUser]);

  // ⬇ BARU: Load provinces saat mount
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const token = await getIdToken();

        if (!token) {
          console.warn("No backend token available. User must login first.");
          setLoadingProvinces(false);
          return;
        }

        const data = await areaService.getProvinces(token);
        setProvinces(data);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    }
    if (mounted) {
      loadProvinces();
    }
  }, [mounted, getIdToken]);

  // ⬇ BARU: Load regencies ketika provinsi berubah
  useEffect(() => {
    async function loadRegencies(provinceCode: string) {
      setLoadingRegencies(true);
      try {
        const token = await getIdToken();
        if (!token) return;

        const data = await areaService.getRegencies(provinceCode, token);
        setRegencies(data);
      } catch (error) {
        console.error("Failed to load regencies:", error);
        setRegencies([]);
      } finally {
        setLoadingRegencies(false);
      }
    }

    const provinceCode = mode === "individu" ? individu.provinsi : lembaga.provinsi;
    if (provinceCode) {
      loadRegencies(provinceCode);
    } else {
      setRegencies([]);
    }
  }, [individu.provinsi, lembaga.provinsi, mode, getIdToken]);

  // ⬇ BARU: Load districts ketika kabupaten berubah
  useEffect(() => {
    async function loadDistricts(regencyCode: string) {
      setLoadingDistricts(true);
      try {
        const token = await getIdToken();
        if (!token) return;

        const data = await areaService.getDistricts(regencyCode, token);
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    }

    const regencyCode = mode === "individu" ? individu.kabupaten : lembaga.kabupaten;
    if (regencyCode) {
      loadDistricts(regencyCode);
    } else {
      setDistricts([]);
    }
  }, [individu.kabupaten, lembaga.kabupaten, mode, getIdToken]);

  // ⬇ BARU: Load villages ketika kecamatan berubah
  useEffect(() => {
    async function loadVillages(districtCode: string) {
      setLoadingVillages(true);
      try {
        const token = await getIdToken();
        if (!token) return;

        const data = await areaService.getVillages(districtCode, token);
        setVillages(data);
      } catch (error) {
        console.error("Failed to load villages:", error);
        setVillages([]);
      } finally {
        setLoadingVillages(false);
      }
    }

    const districtCode = mode === "individu" ? individu.kecamatan : lembaga.kecamatan;
    if (districtCode) {
      loadVillages(districtCode);
    } else {
      setVillages([]);
    }
  }, [individu.kecamatan, lembaga.kecamatan, mode, getIdToken]);

  function setField(
    field: keyof IndividuData | keyof LembagaData,
    value: string
  ) {
    if (mode === "individu") {
      const fieldName = field as keyof IndividuData;

      // ⬇ BARU: Reset children ketika parent berubah (cascading)
      if (fieldName === "provinsi") {
        setIndividu((p) => ({
          ...p,
          provinsi: value,
          kabupaten: "",
          kecamatan: "",
          kelurahan: "",
        }));
      } else if (fieldName === "kabupaten") {
        setIndividu((p) => ({
          ...p,
          kabupaten: value,
          kecamatan: "",
          kelurahan: "",
        }));
      } else if (fieldName === "kecamatan") {
        setIndividu((p) => ({
          ...p,
          kecamatan: value,
          kelurahan: "",
        }));
      } else {
        setIndividu((p) => ({ ...p, [fieldName]: value }));
      }

      if (errorsInd[fieldName]) {
        setErrorsInd((e) => ({ ...e, [fieldName]: undefined }));
      }
    } else {
      const fieldName = field as keyof LembagaData;

      // ⬇ BARU: Reset children ketika parent berubah (cascading)
      if (fieldName === "provinsi") {
        setLembaga((p) => ({
          ...p,
          provinsi: value,
          kabupaten: "",
          kecamatan: "",
          kelurahan: "",
        }));
      } else if (fieldName === "kabupaten") {
        setLembaga((p) => ({
          ...p,
          kabupaten: value,
          kecamatan: "",
          kelurahan: "",
        }));
      } else if (fieldName === "kecamatan") {
        setLembaga((p) => ({
          ...p,
          kecamatan: value,
          kelurahan: "",
        }));
      } else {
        setLembaga((p) => ({ ...p, [fieldName]: value }));
      }

      if (errorsOrg[fieldName]) {
        setErrorsOrg((e) => ({ ...e, [fieldName]: undefined }));
      }
    }
  }

  function validate(): boolean {
    if (mode === "individu") {
      const e: Partial<IndividuData> = {};
      if (!individu.namaLengkap.trim())
        e.namaLengkap = "Nama lengkap wajib diisi";
      if (!individu.email.trim()) e.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(individu.email))
        e.email = "Format email tidak valid";
      if (!individu.nomorTelepon.trim())
        e.nomorTelepon = "Nomor telepon wajib diisi";
      else if (!/^[0-9]{10,15}$/.test(individu.nomorTelepon.replace(/\D/g, "")))
        e.nomorTelepon = "Nomor telepon tidak valid";
      if (!individu.jenisKelamin)
        e.jenisKelamin = "Jenis kelamin wajib dipilih";
      if (!individu.provinsi) e.provinsi = "Provinsi wajib dipilih";
      if (!individu.kabupaten) e.kabupaten = "Kabupaten/Kota wajib dipilih";
      if (!individu.kecamatan) e.kecamatan = "Kecamatan wajib dipilih";
      if (!individu.kelurahan) e.kelurahan = "Kelurahan wajib dipilih";
      if (!individu.kodePos.trim()) e.kodePos = "Kode pos wajib diisi";
      else if (!/^[0-9]{5}$/.test(individu.kodePos))
        e.kodePos = "Kode pos harus 5 digit angka";
      if (!individu.address.trim()) e.address = "Alamat wajib diisi";
      setErrorsInd(e);
      return Object.keys(e).length === 0;
    } else {
      const e: Partial<LembagaData> = {};
      if (!lembaga.namaLembaga.trim())
        e.namaLembaga = "Nama lembaga wajib diisi";
      if (!lembaga.email.trim()) e.email = "Email wajib diisi";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lembaga.email))
        e.email = "Format email tidak valid";
      if (!lembaga.nomorTelepon.trim())
        e.nomorTelepon = "Nomor telepon wajib diisi";
      else if (!/^[0-9]{10,15}$/.test(lembaga.nomorTelepon.replace(/\D/g, "")))
        e.nomorTelepon = "Nomor telepon tidak valid";
      if (!lembaga.jenisLembaga) e.jenisLembaga = "Jenis lembaga wajib dipilih";
      if (!lembaga.provinsi) e.provinsi = "Provinsi wajib dipilih";
      if (!lembaga.kabupaten) e.kabupaten = "Kabupaten/Kota wajib dipilih";
      if (!lembaga.kecamatan) e.kecamatan = "Kecamatan wajib dipilih";
      if (!lembaga.kelurahan) e.kelurahan = "Kelurahan wajib dipilih";
      if (!lembaga.kodePos.trim()) e.kodePos = "Kode pos wajib diisi";
      else if (!/^[0-9]{5}$/.test(lembaga.kodePos))
        e.kodePos = "Kode pos harus 5 digit angka";
      if (!lembaga.address.trim()) e.address = "Alamat wajib diisi";
      setErrorsOrg(e);
      return Object.keys(e).length === 0;
    }
  }

  const isFormValid = useMemo(() => {
    if (mode === "individu") {
      const v = individu;
      return !!(
        v.namaLengkap.trim() &&
        v.email.trim() &&
        v.nomorTelepon.trim() &&
        v.jenisKelamin &&
        v.provinsi &&
        v.kabupaten &&
        v.kecamatan &&
        v.kelurahan &&
        v.kodePos.trim()
      );
    }
    const v = lembaga;
    return !!(
      v.namaLembaga.trim() &&
      v.email.trim() &&
      v.nomorTelepon.trim() &&
      v.jenisLembaga &&
      v.provinsi &&
      v.kabupaten &&
      v.kecamatan &&
      v.kelurahan &&
      v.kodePos.trim()
    );
  }, [mode, individu, lembaga]);

  async function handleInitialSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setShowConfirmation(true);
  }

  async function handleConfirmedSubmit() {
    setShowConfirmation(false);
    setIsLoading(true);
    setSubmitError("");

    try {
      const token = await getIdToken();

      if (!token) {
        setSubmitError("Token tidak ditemukan. Silakan login kembali.");
        setIsLoading(false);
        return;
      }

      // Verify token works by fetching current user before submitting
      try {
        const meBefore = await userService.getMe(token);
        console.debug("[profile] GET /user/me before submit:", meBefore);
      } catch (e: unknown) {
        console.error("[profile] GET /user/me failed before submit:", e);
        setSubmitError(
          (e instanceof Error && e.message) ? `Gagal memverifikasi token: ${e.message}` : "Gagal memverifikasi token sebelum menyimpan profil."
        );
        setIsLoading(false);
        return;
      }

      // Prepare payload using nested profile objects to match backend example
      const payload =
        mode === "individu"
          ? {
            phone_number: individu.nomorTelepon,
            province: individu.provinsi,
            city: individu.kabupaten,
            district: individu.kecamatan,
            sub_district: individu.kelurahan,
            postal_code: individu.kodePos,
            user_type: mode as "individu" | "lembaga",
            address: individu.address,
            individual_profile: {
              full_name: individu.namaLengkap,
              gender: (individu.jenisKelamin === "laki-laki" ? "male" : "female") as
                | "male"
                | "female",
            },
            email: individu.email || undefined,
          }
          : {
            phone_number: lembaga.nomorTelepon,
            province: lembaga.provinsi,
            city: lembaga.kabupaten,
            district: lembaga.kecamatan,
            sub_district: lembaga.kelurahan,
            postal_code: lembaga.kodePos,
            user_type: mode as "individu" | "lembaga",
            address: lembaga.address,
            institution_profile: {
              name: lembaga.namaLembaga,
            },
            email: lembaga.email || undefined,
          };

      // Debug: mask token so we can confirm a token is present without leaking it
      try {
        const masked = token ? `${String(token).slice(0, 8)}... (len=${String(token).length})` : "<no-token>";
        console.debug("[profile] submitting with token:", masked);
      } catch {
        /* ignore debug failures */
      }

      console.log("Submitting profile to backend:", payload);

      // Call backend API - For first-time completion we PUT to /user/ as requested
      // Note: backend typings expect flat UpdateProfilePayload; we include nested
      // objects here for the server and cast to any to avoid TS-lint errors.
      const isFirstTime = !!currentUser && !currentUser.is_profile_complete;
      let updatedUser;
      if (isFirstTime) {
        updatedUser = await userService.createProfile(payload, token);
      } else {
        updatedUser = await userService.updateProfile(payload, token);
      }

      console.log("Profile updated successfully:", updatedUser);

      // If parent provided an onSaved callback, let it handle marking/syncing and redirect.
      if (onSaved) {
        try {
          await onSaved();
        } catch {
          // ignore — parent will handle errors/logging
        }
      } else {
        // ⬇ Tandai progres complete (fallback)
        markProfileCompleted();

        // ⬇ Redirect berdasarkan user_type
        if (mode === "individu") {
          router.replace("/onboarding?type=individu"); // Onboarding individu
        } else {
          router.replace("/onboarding?type=lembaga"); // Onboarding lembaga
        }
      }

    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      // Handle error message
      let errorMessage = "Gagal menyimpan profil. Silakan coba lagi.";
      const err = error as { message?: string; meta?: { message?: string } };

      if (err.message) {
        errorMessage = err.message;
      } else if (err.meta?.message) {
        errorMessage = err.meta.message;
      }

      setSubmitError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  if (!mounted || loadingUser) {
    // skeleton
    return (
      <main className="min-h-dvh bg-white px-5 py-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 h-8 w-40 animate-pulse rounded bg-gray-100" />
          <div className="space-y-6">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl bg-gray-100"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    // ⬇ PERUBAHAN PENTING: guard step = "profile"
    <RequireProgress step="complete-profile">
      <main className="min-h-dvh bg-white text-black px-5 py-8">
        <div className="mx-auto w-full max-w-sm">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Lengkapi Data Anda</h1>
            <div className="h-14 w-14">
              <Image
                src="/logo-1000-cahaya.svg"
                alt="1000 Cahaya"
                width={56}
                height={56}
                className="h-full w-full"
                priority
              />
            </div>
          </div>

          {/* Toggle Individu/Lembaga */}
          <div className="rounded-2xl bg-[#EFEFEF] p-1">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("individu")}
                className={[
                  "h-10 rounded-xl text-sm font-medium transition",
                  mode === "individu"
                    ? "bg-white text-[#10B981] shadow"
                    : "text-[#727272]",
                ].join(" ")}
              >
                Individu
              </button>
              <button
                type="button"
                onClick={() => setMode("lembaga")}
                className={[
                  "h-10 rounded-xl text-sm font-medium transition",
                  mode === "lembaga"
                    ? "bg-white text-[#10B981] shadow"
                    : "text-[#727272]",
                ].join(" ")}
              >
                Lembaga
              </button>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleInitialSubmit} className="mt-6 space-y-6">
            {mode === "individu" ? (
              <>
                <TextField
                  id="namaLengkap"
                  label="Nama Lengkap"
                  placeholder="Masukkan Nama Lengkap"
                  value={individu.namaLengkap}
                  onChange={(e) => setField("namaLengkap", e.target.value)}
                  error={errorsInd.namaLengkap}
                  required
                />
                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  placeholder="contoh@email.com"
                  value={individu.email}
                  onChange={(e) => setField("email", e.target.value)}
                  error={errorsInd.email}
                  // If user is logged in with Firebase (Google), email should be locked
                  disabled={!!currentFirebaseUser}
                  required
                />
                {currentFirebaseUser && (
                  <p className="text-xs text-muted-foreground mt-1">Email dikunci karena login menggunakan Google.</p>
                )}
                <TextField
                  id="nomorTelepon"
                  label="Nomor Telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={individu.nomorTelepon}
                  onChange={(e) => setField("nomorTelepon", e.target.value)}
                  error={errorsInd.nomorTelepon}
                  // If user logged in via WhatsApp (no Firebase user), lock phone field
                  disabled={!currentFirebaseUser}
                  required
                />
                {!currentFirebaseUser && (
                  <p className="text-xs text-muted-foreground mt-1">Nomor telepon dikunci karena login menggunakan WhatsApp.</p>
                )}
                <Select
                  id="jenisKelamin"
                  label="Jenis Kelamin"
                  placeholder="Pilih jenis kelamin"
                  options={JENIS_KELAMIN}
                  value={individu.jenisKelamin}
                  onChange={(e) => setField("jenisKelamin", e.target.value)}
                  error={errorsInd.jenisKelamin}
                  required
                />
                <Select
                  id="provinsi"
                  label="Provinsi"
                  placeholder={
                    loadingProvinces
                      ? "Memuat provinsi..."
                      : "Pilih provinsi"
                  }
                  options={provinceOptions}
                  value={individu.provinsi}
                  onChange={(e) => setField("provinsi", e.target.value)}
                  error={errorsInd.provinsi}
                  disabled={loadingProvinces}
                  required
                />
                <Select
                  id="kabupaten"
                  label="Kabupaten/Kota"
                  placeholder={
                    loadingRegencies
                      ? "Memuat kabupaten..."
                      : individu.provinsi
                        ? "Pilih kabupaten/kota"
                        : "Pilih provinsi terlebih dahulu"
                  }
                  options={regencyOptions}
                  value={individu.kabupaten}
                  onChange={(e) => setField("kabupaten", e.target.value)}
                  error={errorsInd.kabupaten}
                  disabled={!individu.provinsi || loadingRegencies}
                  required
                />
                <Select
                  id="kecamatan"
                  label="Kecamatan"
                  placeholder={
                    loadingDistricts
                      ? "Memuat kecamatan..."
                      : individu.kabupaten
                        ? "Pilih kecamatan"
                        : "Pilih kabupaten terlebih dahulu"
                  }
                  options={districtOptions}
                  value={individu.kecamatan}
                  onChange={(e) => setField("kecamatan", e.target.value)}
                  error={errorsInd.kecamatan}
                  disabled={!individu.kabupaten || loadingDistricts}
                  required
                />
                <Select
                  id="kelurahan"
                  label="Kelurahan"
                  placeholder={
                    loadingVillages
                      ? "Memuat kelurahan..."
                      : individu.kecamatan
                        ? "Pilih kelurahan"
                        : "Pilih kecamatan terlebih dahulu"
                  }
                  options={villageOptions}
                  value={individu.kelurahan}
                  onChange={(e) => setField("kelurahan", e.target.value)}
                  error={errorsInd.kelurahan}
                  disabled={!individu.kecamatan || loadingVillages}
                  required
                />
                <TextField
                  id="alamat"
                  label="Alamat"
                  placeholder="Contoh: Jl. Asia Afrika No.8, RT 01/RW 02"
                  value={individu.address}
                  onChange={(e) => setField("address", e.target.value)}
                  error={errorsInd.address as string | undefined}
                  required
                />
                <TextField
                  id="kodePos"
                  label="Kode Pos"
                  type="text"
                  inputMode="numeric"
                  placeholder="12345"
                  value={individu.kodePos}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setField("kodePos", value);
                  }}
                  error={errorsInd.kodePos}
                  maxLength={6}
                  required
                />
              </>
            ) : (
              <>
                <TextField
                  id="namaLembaga"
                  label="Nama Lembaga"
                  placeholder="Masukkan Nama Lembaga"
                  value={lembaga.namaLembaga}
                  onChange={(e) => setField("namaLembaga", e.target.value)}
                  error={errorsOrg.namaLembaga}
                  required
                />
                <TextField
                  id="emailOrg"
                  label="Email"
                  type="email"
                  placeholder="contoh@lembaga.com"
                  value={lembaga.email}
                  onChange={(e) => setField("email", e.target.value)}
                  error={errorsOrg.email}
                  // lock email when logged in via Firebase
                  disabled={!!currentFirebaseUser}
                  required
                />
                {currentFirebaseUser && (
                  <p className="text-xs text-muted-foreground mt-1">Email dikunci karena login menggunakan Google.</p>
                )}
                <TextField
                  id="nomorTeleponOrg"
                  label="Nomor Telepon"
                  type="tel"
                  placeholder="021xxxxxxxx"
                  value={lembaga.nomorTelepon}
                  onChange={(e) => setField("nomorTelepon", e.target.value)}
                  error={errorsOrg.nomorTelepon}
                  // lock phone for WA login (no Firebase user)
                  disabled={!currentFirebaseUser}
                  required
                />
                {!currentFirebaseUser && (
                  <p className="text-xs text-muted-foreground mt-1">Nomor telepon dikunci karena login menggunakan WhatsApp.</p>
                )}
                <Select
                  id="jenisLembaga"
                  label="Jenis Lembaga"
                  placeholder="Pilih jenis lembaga"
                  options={JENIS_LEMBAGA}
                  value={lembaga.jenisLembaga}
                  onChange={(e) => setField("jenisLembaga", e.target.value)}
                  error={errorsOrg.jenisLembaga}
                  required
                />
                <Select
                  id="provinsiOrg"
                  label="Provinsi"
                  placeholder={
                    loadingProvinces
                      ? "Memuat provinsi..."
                      : "Pilih provinsi"
                  }
                  options={provinceOptions}
                  value={lembaga.provinsi}
                  onChange={(e) => setField("provinsi", e.target.value)}
                  error={errorsOrg.provinsi}
                  disabled={loadingProvinces}
                  required
                />
                <Select
                  id="kabupatenOrg"
                  label="Kabupaten/Kota"
                  placeholder={
                    loadingRegencies
                      ? "Memuat kabupaten..."
                      : lembaga.provinsi
                        ? "Pilih kabupaten/kota"
                        : "Pilih provinsi terlebih dahulu"
                  }
                  options={regencyOptions}
                  value={lembaga.kabupaten}
                  onChange={(e) => setField("kabupaten", e.target.value)}
                  error={errorsOrg.kabupaten}
                  disabled={!lembaga.provinsi || loadingRegencies}
                  required
                />
                <Select
                  id="kecamatanOrg"
                  label="Kecamatan"
                  placeholder={
                    loadingDistricts
                      ? "Memuat kecamatan..."
                      : lembaga.kabupaten
                        ? "Pilih kecamatan"
                        : "Pilih kabupaten terlebih dahulu"
                  }
                  options={districtOptions}
                  value={lembaga.kecamatan}
                  onChange={(e) => setField("kecamatan", e.target.value)}
                  error={errorsOrg.kecamatan}
                  disabled={!lembaga.kabupaten || loadingDistricts}
                  required
                />
                <Select
                  id="kelurahanOrg"
                  label="Kelurahan"
                  placeholder={
                    loadingVillages
                      ? "Memuat kelurahan..."
                      : lembaga.kecamatan
                        ? "Pilih kelurahan"
                        : "Pilih kecamatan terlebih dahulu"
                  }
                  options={villageOptions}
                  value={lembaga.kelurahan}
                  onChange={(e) => setField("kelurahan", e.target.value)}
                  error={errorsOrg.kelurahan}
                  disabled={!lembaga.kecamatan || loadingVillages}
                  required
                />
                <TextField
                  id="alamatOrg"
                  label="Alamat"
                  placeholder="Contoh: Jl. Asia Afrika No.8, RT 01/RW 02"
                  value={lembaga.address}
                  onChange={(e) => setField("address", e.target.value)}
                  error={errorsOrg.address as string | undefined}
                  required
                />
                <TextField
                  id="kodePosOrg"
                  label="Kode Pos"
                  type="text"
                  inputMode="numeric"
                  placeholder="12345"
                  value={lembaga.kodePos}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                    setField("kodePos", value);
                  }}
                  error={errorsOrg.kodePos}
                  maxLength={5}
                  required
                />
              </>
            )}

            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </form>
        </div>
      </main>

      <Modal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        title="Konfirmasi Pendaftaran"
      >
        <div className="text-gray-700">
          <p className="mb-4">
            Anda akan mendaftar sebagai <span className="font-bold">{mode === 'individu' ? 'Individu' : 'Lembaga'}</span>.
            Mode ini akan menentukan alur <span className="font-bold">onboarding</span> dan jenis aset yang Anda kelola.
          </p>
          <p className="font-semibold">
            Apakah Anda yakin dengan pilihan ini?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button
              type="button"
              variant="danger"
              onClick={() => setShowConfirmation(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleConfirmedSubmit}
              disabled={isLoading}
            >
              Ya, Lanjutkan ({mode === 'individu' ? 'Individu' : 'Lembaga'})
            </Button>
          </div>
        </div>
      </Modal>
    </RequireProgress>

  );
}