"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import { assetsService, BuildingResponse } from "@/services/assets";
import { areaService, Province, Regency, District, Village } from "@/services/area";
import { electricityService, ElectricityCategory, ElectricityTariff } from "@/services/electricity";
import ApplianceSheet from "@/features/assets/profile/buidling/ApplianceSheet";
import type { ApplianceId } from "@/stores/assetWizard";

export default function EditBuildingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getIdToken } = useAuth();
  
  // Helper to get backend token (not Firebase token)
  // Wrapped with useCallback to prevent recreating on every render
  const getBackendToken = useCallback(async (): Promise<string | null> => {
    const { authService } = await import("@/services/auth");
    let backendToken = authService.getToken();
    
    // If no backend token, register with Firebase token
    if (!backendToken) {
      const firebaseToken = await getIdToken();
      if (!firebaseToken) return null;
      
      backendToken = await authService.loginWithGoogle(firebaseToken);
      authService.saveToken(backendToken);
    }
    
    return backendToken;
  }, [getIdToken]);

  // Building data
  const [building, setBuilding] = useState<BuildingResponse | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Appliance state
  const [appliances, setAppliances] = useState<Partial<Record<ApplianceId, number>>>({});
  const [showApplianceSheet, setShowApplianceSheet] = useState(false);

  // API Data for electricity
  const [categories, setCategories] = useState<ElectricityCategory[]>([]);
  const [tariffs, setTariffs] = useState<ElectricityTariff[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTariffs, setLoadingTariffs] = useState(false);

  // API Data for area
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Fetch building data
  useEffect(() => {
    async function fetchBuilding() {
      try {
        const token = await getBackendToken();
        if (!token) return;

        const buildings = await assetsService.getBuildings(token);
        const foundBuilding = buildings.find((b) => b.id === id);

        if (foundBuilding) {
          setBuilding(foundBuilding);
          setName(foundBuilding.name);
          
          // Will set tariffId and categoryId after fetching categories
          const savedTariffId = foundBuilding.electricity_tariff_id;
          
          setLuas(foundBuilding.metadata?.area_sqm?.toString() || "");
          setAlamatJalan(foundBuilding.full_address || "");
          setProvinsi(foundBuilding.province_code);
          setKabKota(foundBuilding.regency_code);
          setKecamatan(foundBuilding.district_code);
          setKelurahan(foundBuilding.village_code);
          setPostalCode(foundBuilding.postal_code || "");
          
          // Load appliances from metadata.electronics_inventory
          if (foundBuilding.metadata?.electronics_inventory) {
            setAppliances(foundBuilding.metadata.electronics_inventory as Partial<Record<ApplianceId, number>>);
          }
          
          // Fetch all tariffs to find category_id for saved tariff_id
          try {
            // We need to load all tariffs to find which category the saved tariff belongs to
            // This is a workaround since backend doesn't return category_id in building response
            const allCategories = await electricityService.getCategories(token);
            
            for (const cat of allCategories) {
              const catTariffs = await electricityService.getTariffsByCategory(cat.id, token);
              const matchedTariff = catTariffs.find(t => t.id === savedTariffId);
              
              if (matchedTariff) {
                setCategoryId(cat.id);
                setTariffId(savedTariffId);
                break;
              }
            }
          } catch (err) {
            console.error("Failed to find category for tariff:", err);
            // Fallback: just set tariffId, user will need to select category manually
            setTariffId(savedTariffId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch building:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBuilding();
  }, [id]);

  // Load electricity categories on mount
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const token = await getBackendToken();
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
      // Clear tariffs first to avoid showing stale data
      setTariffs([]);
      
      try {
        const token = await getBackendToken();
        if (!token) return;
        
        console.log(`🔄 Loading tariffs for category: ${catId}`);
        const data = await electricityService.getTariffsByCategory(catId, token);
        console.log(`✅ Loaded ${data.length} tariffs for category ${catId}:`, data.map(t => t.power_capacity_label));
        
        setTariffs(data);
      } catch (error) {
        console.error("Failed to load tariffs:", error);
        setTariffs([]);
      } finally {
        setLoadingTariffs(false);
      }
    }

    if (categoryId) {
      loadTariffs(categoryId);
    } else {
      console.log("⚠️ No category selected, clearing tariffs");
      setTariffs([]);
      setTariffId("");
    }
  }, [categoryId]);

  // Load provinces on mount
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
  }, []);

  // Load regencies when province changes
  useEffect(() => {
    async function loadRegencies(provCode: string) {
      setLoadingRegencies(true);
      try {
        const token = await getBackendToken();
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
        const token = await getBackendToken();
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
        const token = await getBackendToken();
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
    
    // Validasi: minimal 1 peralatan listrik harus dipilih
    const hasAppliances = Object.values(appliances).some(count => count > 0);
    if (!hasAppliances) {
      alert("Silakan pilih minimal 1 peralatan listrik");
      return;
    }
    
    // TODO: Implement PUT /building-assets/:id
    // When implementing, send appliances as electronics_inventory in metadata
    const payload = {
      id,
      name,
      electricity_tariff_id: tariffId,
      province_code: provinsi,
      regency_code: kabKota,
      district_code: kecamatan,
      village_code: kelurahan,
      postal_code: postalCode,
      full_address: alamatJalan,
      metadata: {
        area_sqm: luas ? parseFloat(luas) : undefined,
        electronics_inventory: appliances, // Simpan appliances ke electronics_inventory
      },
    };
    
    console.log("Update building payload:", payload);

    // For now, just go back
    router.back();
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 py-8">
        <div className="text-center py-8 text-gray-500">Memuat data...</div>
      </main>
    );
  }

  if (!building) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 py-8">
        <p className="text-center text-sm text-black/60">Bangunan tidak ditemukan.</p>
        <div className="mt-4 text-center">
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </main>
    );
  }

  const categoryOptions = categories?.map((cat) => ({
    value: cat.id,
    label: cat.category_name,
  })) || [];

  const tariffOptions = tariffs?.map((tariff) => ({
    value: tariff.id,
    label: `${tariff.power_capacity_label} (Rp ${tariff.rate_per_kwh.toLocaleString("id-ID")}/kWh)`,
  })) || [];

  const provinceOptions = provinces?.map((p) => ({
    value: p.Code,
    label: p.Name,
  })) || [];

  const regencyOptions = regencies?.map((r) => ({
    value: r.Code,
    label: r.Name,
  })) || [];

  const districtOptions = districts?.map((d) => ({
    value: d.Code,
    label: d.Name,
  })) || [];

  const villageOptions = villages?.map((v) => ({
    value: v.Code,
    label: v.Name,
  })) || [];

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Kembali" className="grid h-9 w-9 place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Edit Bangunan</h1>
        <div className="h-9 w-9" />
      </header>
      <div className="mx-auto mt-3 h-0.5 w-full" style={{ backgroundColor: "var(--color-primary)" }} />

      <form className="mt-4 space-y-4 rounded-2xl border border-emerald-500/60 p-4" onSubmit={handleSubmit}>
        <TextField 
          id="nama" 
          label="Nama Bangunan" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
        />

        <Select
          id="category"
          label="Kategori Tarif Listrik"
          placeholder={loadingCategories ? "Memuat..." : "Pilih kategori tarif"}
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setTariffId("");
          }}
          disabled={loadingCategories}
          required
        />

        <Select
          id="tariff"
          label="Daya & Tarif Listrik"
          placeholder={
            loadingTariffs
              ? "Memuat..."
              : categoryId
              ? "Pilih daya listrik"
              : "Pilih kategori dulu"
          }
          options={tariffOptions}
          value={tariffId}
          onChange={(e) => setTariffId(e.target.value)}
          disabled={!categoryId || loadingTariffs}
          required
        />

        <TextField
          id="luas"
          label="Luas Bangunan (m²)"
          type="number"
          placeholder="Contoh: 150"
          value={luas}
          onChange={(e) => setLuas(e.target.value)}
        />

        <TextField
          id="alamatJalan"
          label="Alamat Jalan"
          placeholder="Jl. Contoh No. 123"
          value={alamatJalan}
          onChange={(e) => setAlamatJalan(e.target.value)}
          required
        />

        <Select
          id="provinsi"
          label="Provinsi"
          placeholder={loadingProvinces ? "Memuat..." : "Pilih provinsi"}
          options={provinceOptions}
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
          id="kabKota"
          label="Kabupaten/Kota"
          placeholder={
            loadingRegencies
              ? "Memuat..."
              : provinsi
              ? "Pilih kabupaten/kota"
              : "Pilih provinsi dulu"
          }
          options={regencyOptions}
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
          id="kecamatan"
          label="Kecamatan"
          placeholder={
            loadingDistricts
              ? "Memuat..."
              : kabKota
              ? "Pilih kecamatan"
              : "Pilih kabupaten/kota dulu"
          }
          options={districtOptions}
          value={kecamatan}
          onChange={(e) => {
            setKecamatan(e.target.value);
            setKelurahan("");
          }}
          disabled={!kabKota || loadingDistricts}
          required
        />

        <Select
          id="kelurahan"
          label="Kelurahan/Desa"
          placeholder={
            loadingVillages
              ? "Memuat..."
              : kecamatan
              ? "Pilih kelurahan/desa"
              : "Pilih kecamatan dulu"
          }
          options={villageOptions}
          value={kelurahan}
          onChange={(e) => setKelurahan(e.target.value)}
          disabled={!kecamatan || loadingVillages}
          required
        />

        <TextField
          id="postalCode"
          label="Kode Pos"
          type="text"
          placeholder="12345"
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
        />

        {/* Appliance Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-black">
            Peralatan Listrik
            <span className="ml-1 text-red-600">*</span>
          </label>
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

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg">
            Simpan
          </Button>
        </div>
      </form>

      {/* Appliance Sheet Modal */}
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
