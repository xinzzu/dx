"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";

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

export default function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getIdToken, currentUser: currentFirebaseUser } = useAuth();

  const initialType = (searchParams?.get("type") as Mode) || "individu";
  const phone = searchParams?.get("phone") || "";

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

  const [individu, setIndividu] = useState<IndividuData>({
    namaLengkap: "",
    email: "",
    nomorTelepon: "",
    jenisKelamin: "",
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
    provinsi: "",
    kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    kodePos: "",
  });

  const [errorsInd, setErrorsInd] = useState<Partial<IndividuData>>({});
  const [errorsOrg, setErrorsOrg] = useState<Partial<LembagaData>>({});

  // ⬇ TAMBAHAN: ambil action progress
  const { markProfileCompleted } = useOnboarding();

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
        let token = await getIdToken();
        
        // Jika tidak ada backend token, coba exchange Firebase token
        if (!token && currentFirebaseUser) {
          try {
            console.log("No backend token found. Exchanging Firebase token...");
            const firebaseIdToken = await currentFirebaseUser.getIdToken(true);
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
        
        if (!token) {
          console.warn("No backend token. User must login first.");
          setLoadingUser(false);
          return;
        }

        const userData = await userService.getMe(token);
        setCurrentUser(userData);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError("");

    try {
      const token = await getIdToken();
      
      if (!token) {
        setSubmitError("Token tidak ditemukan. Silakan login kembali.");
        setIsLoading(false);
        return;
      }

      // Prepare payload sesuai format backend API
      const payload: {
        name: string;
        phone_number: string;
        user_type: 'individu' | 'lembaga';
        province: string;
        city: string;
        district: string;
        sub_district: string;
        postal_code: string;
        is_profile_complete: boolean;
      } = mode === "individu" 
        ? {
            name: individu.namaLengkap,
            phone_number: individu.nomorTelepon,
            user_type: mode,
            province: individu.provinsi,
            city: individu.kabupaten,
            district: individu.kecamatan,
            sub_district: individu.kelurahan,
            postal_code: individu.kodePos,
            is_profile_complete: true,
          }
        : {
            name: lembaga.namaLembaga,
            phone_number: lembaga.nomorTelepon,
            user_type: mode,
            province: lembaga.provinsi,
            city: lembaga.kabupaten,
            district: lembaga.kecamatan,
            sub_district: lembaga.kelurahan,
            postal_code: lembaga.kodePos,
            is_profile_complete: true,
          };

      console.log("Submitting profile to backend:", payload);

      // Call backend API
      const updatedUser = await userService.updateProfile(payload, token);
      
      console.log("Profile updated successfully:", updatedUser);

      // ⬇ Tandai progres complete
      markProfileCompleted();

      // ⬇ Redirect berdasarkan user_type
      if (mode === "individu") {
        router.replace("/onboarding?type=individu"); // Onboarding individu
      } else {
        router.replace("/onboarding?type=lembaga"); // Onboarding lembaga
      }

    } catch (error: unknown) {
      console.error("Failed to update profile:", error);
      
      // Handle error message
      let errorMessage = "Gagal menyimpan profil. Silakan coba lagi.";
      const err = error as {message?: string; meta?: {message?: string}};
      
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
                    ? "bg-white text-[color:var(--color-primary)] shadow"
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
                    ? "bg-white text-[color:var(--color-primary)] shadow"
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
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
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
                  disabled={!!currentUser?.email}
                  required
                />
                <TextField
                  id="nomorTelepon"
                  label="Nomor Telepon"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={individu.nomorTelepon}
                  onChange={(e) => setField("nomorTelepon", e.target.value)}
                  error={errorsInd.nomorTelepon}
                  required
                />
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
                  maxLength={5}
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
                  disabled={!!currentUser?.email}
                  required
                />
                <TextField
                  id="nomorTeleponOrg"
                  label="Nomor Telepon"
                  type="tel"
                  placeholder="021xxxxxxxx"
                  value={lembaga.nomorTelepon}
                  onChange={(e) => setField("nomorTelepon", e.target.value)}
                  error={errorsOrg.nomorTelepon}
                  required
                />
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
    </RequireProgress>
    
  );
}