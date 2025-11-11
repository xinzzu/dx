"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { authService } from "@/services/auth";
import { areaService, Province, Regency, District, Village } from "@/services/area";
import { electricityService, ElectricityCategory, ElectricityTariff } from "@/services/electricity";
import { assetsService } from "@/services/assets";
import ApplianceSheet from "@/features/assets/profile/buidling/ApplianceSheet";
import type { ApplianceId } from "@/stores/assetWizard";

export default function NewBuildingPage() {
  const router = useRouter();

  // Form fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tariffId, setTariffId] = useState("");
  const [luas, setLuas] = useState("");
  const [alamatJalan, setAlamatJalan] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kabKota, setKabKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Appliances (electronics inventory)
  const [appliances, setAppliances] = useState<Partial<Record<ApplianceId, number>>>({});
  const [showApplianceSheet, setShowApplianceSheet] = useState(false);

  // API Data
  const [categories, setCategories] = useState<ElectricityCategory[]>([]);
  const [tariffs, setTariffs] = useState<ElectricityTariff[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTariffs, setLoadingTariffs] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Options for dropdowns
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.category_name })),
    [categories]
  );
  const tariffOptions = useMemo(
    () => tariffs.map((t) => ({ value: t.id, label: t.power_capacity_label })),
    [tariffs]
  );
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

  // Load categories on mount
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await electricityService.getCategories(token);
        setCategories(data);
      } catch (error) {
        console.error("Failed to load categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Load tariffs when category changes
  useEffect(() => {
    async function loadTariffs(catId: string) {
      setLoadingTariffs(true);
      setTariffs([]);
      
      try {
        const token = authService.getToken();
        if (!token) return;
        
        const data = await electricityService.getTariffsByCategory(catId, token);
        
        // Client-side filter as fallback
        const filtered = data.filter((t) => t.category_id === catId);
        setTariffs(filtered);
      } catch (error) {
        console.error("Failed to load tariffs:", error);
        setTariffs([]);
      } finally {
        setLoadingTariffs(false);
      }
    }

    if (categoryId) {
      loadTariffs(categoryId);
      setTariffId(""); // Reset tariff when category changes
    } else {
      setTariffs([]);
      setTariffId("");
    }
  }, [categoryId]);

  // Load provinces on mount
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const token = authService.getToken();
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
  }, []);

  // Load regencies when province changes
  useEffect(() => {
    async function loadRegencies(provCode: string) {
      setLoadingRegencies(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await areaService.getRegencies(provCode, token);
        setRegencies(data);
      } catch (error) {
        console.error("Failed to load regencies:", error);
        setRegencies([]);
      } finally {
        setLoadingRegencies(false);
      }
    }

    if (provinsi) {
      loadRegencies(provinsi);
    } else {
      setRegencies([]);
      setKabKota("");
    }
  }, [provinsi]);

  // Load districts when regency changes
  useEffect(() => {
    async function loadDistricts(regCode: string) {
      setLoadingDistricts(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await areaService.getDistricts(regCode, token);
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
      } finally {
        setLoadingDistricts(false);
      }
    }

    if (kabKota) {
      loadDistricts(kabKota);
    } else {
      setDistricts([]);
      setKecamatan("");
    }
  }, [kabKota]);

  // Load villages when district changes
  useEffect(() => {
    async function loadVillages(distCode: string) {
      setLoadingVillages(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await areaService.getVillages(distCode, token);
        setVillages(data);
      } catch (error) {
        console.error("Failed to load villages:", error);
        setVillages([]);
      } finally {
        setLoadingVillages(false);
      }
    }

    if (kecamatan) {
      loadVillages(kecamatan);
    } else {
      setVillages([]);
      setKelurahan("");
    }
  }, [kecamatan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Peralatan listrik sekarang opsional (tidak wajib)

    setSubmitting(true);

    try {
      const token = authService.getToken();
      if (!token) return;

      // Get user profile to get user_id (REQUIRED by backend)
      const { userService } = await import("@/services/user");
      const profile = await userService.getMe(token);
      
      if (!profile.id) {
        alert("User ID tidak tersedia");
        return;
      }

      // WORKAROUND: Clean codes (remove leading zeros and invalid characters from backend bug)
      const cleanCode = (code: string) => code.replace(/[^0-9.]/g, '');
      const cleanUUID = (uuid: string) => {
        // Remove leading zeros and keep only valid UUID characters (0-9, a-f, -)
        return uuid.replace(/^0+/, '').replace(/[^0-9a-f-]/gi, '');
      };
      
      const payload = {
        name,
        user_id: profile.id, // REQUIRED: User ID from backend
        electricity_tariff_id: cleanUUID(tariffId),
        province_code: cleanCode(provinsi),
        regency_code: cleanCode(kabKota),
        district_code: cleanCode(kecamatan),
        village_code: cleanCode(kelurahan),
        address_label: name, // REQUIRED: Use building name as address label
        postal_code: postalCode || undefined, // String, not number
        full_address: alamatJalan,
        metadata: {
          area_sqm: luas ? parseFloat(luas) : undefined,
          electronics_inventory: appliances,
        },
      };

      console.log("📋 Create building payload:", payload);
      console.log("👤 User ID:", profile.id);
      console.log("🗺️ Area codes:", {
        provinsi,
        kabKota,
        kecamatan,
        kelurahan,
      });
      console.log("📍 Selected from dropdown:", {
        provinsiOptions: provOptions.find(p => p.value === provinsi),
        kabKotaOptions: kabOptions.find(k => k.value === kabKota),
        kecamatanOptions: kecOptions.find(k => k.value === kecamatan),
        kelurahanOptions: kelOptions.find(k => k.value === kelurahan),
      });

      await assetsService.createBuildingDirect(payload, token);
      
      alert("Bangunan berhasil ditambahkan!");
      router.push("/app/profile/manajemen-bangunan");
    } catch (error) {
      console.error("Failed to create building:", error);
      alert(error instanceof Error ? error.message : "Gagal menambahkan bangunan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      {/* Header */}
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-black">
          Tambah Bangunan
        </h1>
        <div className="h-9 w-9" />
      </header>
      <div
        className="mx-auto mt-3 h-0.5 w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          label="Nama Bangunan"
          placeholder="Contoh: Bangunan Utama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          label="Kategori Tarif Listrik"
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={loadingCategories}
          required
        />

        <Select
          label="Daya & Tarif Listrik"
          options={tariffOptions}
          value={tariffId}
          onChange={(e) => setTariffId(e.target.value)}
          disabled={!categoryId || loadingTariffs}
          required
        />

        <TextField
          label="Luas Bangunan (m²)"
          type="number"
          placeholder="Contoh: 112"
          value={luas}
          onChange={(e) => setLuas(e.target.value)}
        />

        <TextField
          label="Alamat Jalan"
          placeholder="Contoh: Blok M1"
          value={alamatJalan}
          onChange={(e) => setAlamatJalan(e.target.value)}
          required
        />

        <Select
          label="Provinsi"
          options={provOptions}
          value={provinsi}
          onChange={(e) => {
            setProvinsi(e.target.value);
            setKabKota("");
            setKecamatan("");
            setKelurahan("");
          }}
          disabled={loadingProvinces}
          required
        />

        <Select
          label="Kabupaten/Kota"
          options={kabOptions}
          value={kabKota}
          onChange={(e) => {
            setKabKota(e.target.value);
            setKecamatan("");
            setKelurahan("");
          }}
          disabled={!provinsi || loadingRegencies}
          required
        />

        <Select
          label="Kecamatan"
          options={kecOptions}
          value={kecamatan}
          onChange={(e) => {
            setKecamatan(e.target.value);
            setKelurahan("");
          }}
          disabled={!kabKota || loadingDistricts}
          required
        />

        <Select
          label="Kelurahan/Desa"
          options={kelOptions}
          value={kelurahan}
          onChange={(e) => setKelurahan(e.target.value)}
          disabled={!kecamatan || loadingVillages}
          required
        />

        <TextField
          label="Kode Pos"
          placeholder="Contoh: 54473"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        {/* Appliances Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Peralatan Listrik <span className="text-xs text-gray-500">(Opsional)</span>
          </label>
          <p className="text-xs text-gray-500 mb-2">Tambahkan peralatan listrik yang ada di bangunan ini</p>
          <button
            type="button"
            onClick={() => setShowApplianceSheet(true)}
            className="w-full rounded-xl border-2 border-dashed border-emerald-500/60 bg-white p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-emerald-600">
                  {Object.values(appliances).some(count => count > 0)
                    ? "Peralatan Listrik"
                    : "+ Peralatan Listrik"}
                </div>
                <div className="text-xs text-black/60 mt-1">
                  {Object.values(appliances).some(count => count > 0)
                    ? `${Object.values(appliances).filter(count => count > 0).length} peralatan terdaftar`
                    : "0 peralatan terdaftar"}
                </div>
              </div>
              <span className="text-emerald-600">➜</span>
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            fullWidth
            disabled={submitting || !name || !tariffId || !alamatJalan || !provinsi || !kabKota || !kecamatan || !kelurahan}
          >
            {submitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>

      {/* Appliance Sheet */}
      <ApplianceSheet
        open={showApplianceSheet}
        initial={appliances}
        onClose={() => setShowApplianceSheet(false)}
        onApply={(vals) => {
          setAppliances(vals);
          setShowApplianceSheet(false);
        }}
      />
    </main>
  );
}
