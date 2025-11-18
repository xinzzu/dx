"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import ScrollContainer from "@/components/nav/ScrollContainer";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import { UserProfile } from "@/services/user";
import { areaService, Province, Regency, District, Village } from "@/services/area";

const ICONS = {
  name: "/icons/profile/ic-user.svg",
  email: "/icons/profile/ic-mail.svg",
  phone: "/icons/profile/ic-phone.svg",
};

function FieldLabel({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-[13px] font-medium text-black">
      <Image src={icon} alt="" width={16} height={16} aria-hidden />
      <span>{children}</span>
    </div>
  );
}

export default function EditProfilePage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initialPhone, setInitialPhone] = useState("");
  const [submitError, setSubmitError] = useState("");

  const [avatarUrl, setAvatarUrl] = useState<string>("/images/user.png");

  const [provinceCode, setProvinceCode] = useState("");
  const [regencyCode, setRegencyCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [villageCode, setVillageCode] = useState("");

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [existingProfileData, setExistingProfileData] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'individu' | 'lembaga' | null>(null);
  const [isDisableEmail, setIsDisableEmail] = useState(false);
  const [isDisablePhone, setIsDisablePhone] = useState(false);

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  const cleanCode = (code: string | undefined): string => {
    if (!code) return '';
    return code.replace(/[^0-9]/g, '');
  };

  const getBackendToken = useCallback(async (): Promise<string | null> => {
    const { authService } = await import("@/services/auth");
    let backendToken = authService.getToken();

    if (!backendToken) {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) return null;

      backendToken = await authService.loginWithGoogle(firebaseToken);
      authService.saveToken(backendToken);
    }

    return backendToken;
  }, [getIdToken]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = await getBackendToken();
        if (!token) {
          toast.error("Token tidak ditemukan. Silakan login ulang.");
          return;
        }

        const { userService } = await import("@/services/user");
        const userData = await userService.getMe(token);

        setExistingProfileData(userData);
        setUserType(userData.user_type as 'individu' | 'lembaga');

        setName(userData.individual_profile?.full_name || userData.institution_profile?.name || "");
        setEmail(userData.email || "");
        setPhone(userData.phone_number || "");
        setInitialPhone(userData.phone_number || "");

        setProvinceCode(userData.province || "");
        setRegencyCode(userData.city || "");
        setDistrictCode(userData.district || "");
        setVillageCode(userData.sub_district || "");

        const emailExists = !!userData.email?.trim();
        const phoneExists = !!userData.phone_number?.trim();

        setIsDisableEmail(emailExists);
        setIsDisablePhone(phoneExists);
      } catch (error) {
        console.error("Failed to load user profile:", error);
        toast.error("Gagal memuat data profil.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [getBackendToken]);

  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const token = await getBackendToken();
        if (!token) return;
        const data = await areaService.getProvinces(token);
        setProvinces(data);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setLoadingProvinces(false);
      }
    }
    loadProvinces();
  }, [getBackendToken]);

  useEffect(() => {
    async function loadRegencies(provCode: string) {
      setLoadingRegencies(true);
      setRegencies([]);
      try {
        const token = await getBackendToken();
        if (!token) return;
        const code = cleanCode(provCode);
        if (code) {
          const data = await areaService.getRegencies(code, token);
          setRegencies(data);
        }
      } catch (error) {
        console.error("Failed to load regencies:", error);
        setRegencies([]);
      } finally {
        setLoadingRegencies(false);
      }
    }

    if (provinceCode) {
      loadRegencies(provinceCode);
    } else {
      setRegencies([]);
      setRegencyCode("");
    }
  }, [provinceCode, getBackendToken]);

  useEffect(() => {
    async function loadDistricts(regCode: string) {
      setLoadingDistricts(true);
      setDistricts([]);
      try {
        const token = await getBackendToken();
        if (!token) return;
        const code = cleanCode(regCode);
        if (code) {
          const data = await areaService.getDistricts(code, token);
          setDistricts(data);
        }
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    }

    if (regencyCode) {
      loadDistricts(regencyCode);
    } else {
      setDistricts([]);
      setDistrictCode("");
    }
  }, [regencyCode, getBackendToken]);

  useEffect(() => {
    async function loadVillages(distCode: string) {
      setLoadingVillages(true);
      setVillages([]);
      try {
        const token = await getBackendToken();
        if (!token) return;
        const code = cleanCode(distCode);
        if (code) {
          const data = await areaService.getVillages(code, token);
          setVillages(data);
        }
      } catch (error) {
        console.error("Failed to load villages:", error);
        setVillages([]);
      } finally {
        setLoadingVillages(false);
      }
    }

    if (districtCode) {
      loadVillages(districtCode);
    } else {
      setVillages([]);
      setVillageCode("");
    }
  }, [districtCode, getBackendToken]);

  const provOptions = useMemo(
    () => provinces.map((p) => ({ value: p.Code, label: p.Name })),
    [provinces]
  );
  const kabOptions = useMemo(
    () => regencies.map((r) => ({ value: r.Code, label: r.Name })),
    [regencies]
  );
  const kecOptions = useMemo(
    () => districts.map((d) => ({ value: d.Code, label: d.Name })),
    [districts]
  );
  const kelOptions = useMemo(
    () => villages.map((v) => ({ value: v.Code, label: v.Name })),
    [villages]
  );

  function handlePickAvatar() {
    return;
    // fileRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setAvatarUrl(url);
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !existingProfileData || !userType) return;

    setSaving(true);
    setSubmitError("");

    try {
      const token = await getBackendToken();
      if (!token) {
        setSubmitError("Token tidak ditemukan. Silakan login kembali.");
        setSaving(false);
        return;
      }

      const { userService } = await import("@/services/user");

      const basePayload = {
        phone_number: phone !== initialPhone ? phone.trim() : undefined,
        province: provinceCode || "",
        city: regencyCode || "",
        district: districtCode || "",
        sub_district: villageCode || "",
        user_type: userType,
        email: existingProfileData.email || "",
      };

      let profileSpecificPayload = {};

      if (userType === 'individu') {
        profileSpecificPayload = {
          individual_profile: {
            full_name: name.trim(),
            gender: existingProfileData.individual_profile?.gender || undefined,
          }
        };
      } else if (userType === 'lembaga') {
        profileSpecificPayload = {
          institution_profile: {
            name: name.trim(),
          }
        };
      }

      const finalPayload = {
        ...basePayload,
        ...profileSpecificPayload
      };

      console.log("Payload Update Profile:", finalPayload);

      await userService.updateProfile(finalPayload, token);

      toast.success("Profil berhasil diperbarui!");
      router.back();

    } catch (error: unknown) {
      console.error("Failed to update profile:", error);

      let errorMessage = "Gagal menyimpan profil. Silakan coba lagi.";
      const err = error as { message?: string; meta?: { message?: string } };

      if (err.message && (err.message.toLowerCase().includes('already exists') || err.message.toLowerCase().includes('duplicate'))) {
        errorMessage = "Nomor telepon/WA ini sudah terdaftar di akun lain.";
      } else if (err.meta?.message && (err.meta.message.toLowerCase().includes('already exists') || err.meta.message.toLowerCase().includes('duplicate'))) {
        errorMessage = "Nomor telepon/WA ini sudah terdaftar di akun lain.";
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.meta?.message) {
        errorMessage = err.meta.message;
      }

      setSubmitError(errorMessage);
      toast.error(errorMessage);

    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScrollContainer headerTitle="Edit Profil">
        <div className="text-center py-10 text-gray-500">Memuat data profil...</div>
      </ScrollContainer>
    );
  }

  return (
    <ScrollContainer
      headerTitle="Edit Profil"
      leftContainer={
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
      }
    >

      <form onSubmit={handleEditSubmit} className="mt-4 space-y-5">
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={handlePickAvatar}
            className="relative h-28 w-28 overflow-hidden rounded-full ring-1 ring-black/10 group"
            aria-label="Ubah foto profil"
          >
            <Image
              src={avatarUrl}
              alt="Foto profil"
              fill
              sizes="112px"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
              <Image src="/icons/camera-white.svg" alt="Ganti" width={24} height={24} />
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleFileChange}
          />
          <div className="mt-2 text-sm text-black/50 hidden">Ketuk untuk mengubah foto</div>
        </div>

        <div className="space-y-4 rounded-2xl border border-black/10 p-4">
          <div>
            <FieldLabel icon={ICONS.name}>
              {userType === 'individu' ? "Nama Lengkap" : "Nama Institusi"}
            </FieldLabel>
            <TextField
              id="fullName"
              placeholder={userType === 'individu' ? "Masukkan nama lengkap" : "Masukkan nama institusi"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <FieldLabel icon={ICONS.email}>Email</FieldLabel>
            <TextField
              id="email"
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isDisableEmail}
              className={isDisableEmail ? "!bg-gray-100 !text-gray-600" : ""}
            />
          </div>

          <div>
            <FieldLabel icon={ICONS.phone}>Nomor Telepon (WA)</FieldLabel>
            <TextField
              id="phone"
              placeholder="+62xxxxxxxxxxx"
              value={phone}
              disabled={isDisablePhone}
              onChange={(e) => setPhone(e.target.value)}
              className={isDisablePhone ? "!bg-gray-100 !text-gray-600" : ""}
              inputMode="tel"
            />
          </div>

          <div>
            <Select
              label="Provinsi"
              options={provOptions}
              value={provinceCode}
              onChange={(e) => {
                setProvinceCode(e.target.value);
                setRegencyCode("");
                setDistrictCode("");
                setVillageCode("");
              }}
              disabled={loadingProvinces}
              placeholder="Pilih Provinsi"
            />

          </div>

          <div>
            <Select
              label="Kabupaten/Kota"
              options={kabOptions}
              value={regencyCode}
              onChange={(e) => {
                setRegencyCode(e.target.value);
                setDistrictCode("");
                setVillageCode("");
              }}
              disabled={!provinceCode || loadingRegencies || regencies.length === 0}
              placeholder="Pilih Kabupaten/Kota"
            />
          </div>

          <div>
            <Select
              label="Kecamatan"
              options={kecOptions}
              value={districtCode}
              onChange={(e) => {
                setDistrictCode(e.target.value);
                setVillageCode("");
              }}
              disabled={!regencyCode || loadingDistricts || districts.length === 0}
              placeholder="Pilih Kecamatan"
            />
          </div>

          <div>
            <Select
              label="Kelurahan/Desa"
              options={kelOptions}
              value={villageCode}
              onChange={(e) => setVillageCode(e.target.value)}
              disabled={!districtCode || loadingVillages || villages.length === 0}
              placeholder="Pilih Kelurahan/Desa"
            />
          </div>

        </div>

        {submitError && (
          <p className="text-sm text-center text-red-500 pt-2">{submitError}</p>
        )}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button
            type="button"
            variant="outline"
            className="!bg-emerald-50 !border-emerald-200 !text-emerald-700"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button type="submit" disabled={!canSubmit || saving}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </ScrollContainer>
  );
}