"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { authService } from "@/services/auth";
import { assetsService, BuildingResponse } from "@/services/assets";
import { areaService, Province, Regency, District, Village } from "@/services/area";
import { electricityService, ElectricityCategory, ElectricityTariff } from "@/services/electricity";
import ApplianceSheet from "@/features/assets/profile/buidling/ApplianceSheet";
import type { ApplianceId } from "@/stores/assetWizard";
import { toast } from "sonner";
import { userFriendlyError } from "@/lib/userError";

export default function EditBuildingPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

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

  // Helpers: convert between object-map <-> array used by ApplianceSheet
  const normalizeKey = (name: string, idx = 0) =>
    String(name || `item_${idx}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");

  type ApplianceArrayItem = { id: string; name: string; count: number };

  const toSafeNumber = (v: unknown) => {
    const n = Number(v as unknown);
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
  };

  const appliancesToArray = (src?: unknown): ApplianceArrayItem[] => {
    if (!src) return [];

    // If source is already an array of objects (from newer flows)
    if (Array.isArray(src)) {
      return src.map((it, idx) => {
        const obj = (it ?? {}) as Record<string, unknown>;
        // Support multiple possible numeric fields coming from different flows:
        // `count`, `qty`, `quantity`, or localized `jumlah`.
        const rawCount = obj.count ?? obj.qty ?? obj.quantity ?? obj.jumlah;
        return {
          id: String(obj.id ?? `${Date.now()}-${idx}`),
          name: String(obj.name ?? `Item ${idx + 1}`),
          count: toSafeNumber(rawCount),
        };
      });
    }

    // If source is an object map { servers: 5, ac_units: 2 }
    if (typeof src === "object" && src !== null) {
      // Humanize keys for display: convert underscores/dashes to spaces
      const humanize = (s: string) =>
        String(s)
          .replace(/[_-]+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      return Object.entries(src as Record<string, unknown>).map(([k, v], i) => ({
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        name: humanize(k),
        count: toSafeNumber(v),
      }));
    }

    return [];
  };

  const arrayToAppliances = (arr: { id?: string; name: string; count: number }[]) => {
    const out: Partial<Record<ApplianceId, number>> = {};
    arr.forEach((it, i) => {
      const name = String(it?.name ?? `item_${i}`);
      const key = normalizeKey(name, i) as ApplianceId;
      out[key] = toSafeNumber(it?.count);
    });
    return out;
  };

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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch building data
  useEffect(() => {
    async function fetchBuilding() {
      try {
        const token = authService.getToken();
        if (!token) return;

        // Try to fetch a single building resource first (preferred)
        let foundBuilding = null as BuildingResponse | null;

        try {
          foundBuilding = await assetsService.getBuilding(id, token);
        } catch (err) {
          // If single-get not available or fails, fallback to listing and find
          console.warn('fetchBuilding: getBuilding failed, falling back to getBuildings', err);
          try {
            const buildings = await assetsService.getBuildings(token);
            foundBuilding = buildings.find((b) => b.id === id) || null;
          } catch (err2) {
            console.error('fetchBuilding: getBuildings fallback also failed', err2);
            foundBuilding = null;
          }
        }

        if (foundBuilding) {
          console.log(foundBuilding);

          setBuilding(foundBuilding);
          setName(foundBuilding.name || '');

          // Will set tariffId and categoryId after fetching categories
          const savedTariffId = foundBuilding.electricity_tariff_id;

          setLuas(foundBuilding.metadata?.area_sqm?.toString() || '');
          setAlamatJalan(foundBuilding.full_address || '');

          // Debug: Check area codes from backend
          console.log('📍 Building area codes from backend:', {
            province: foundBuilding.province_code,
            regency: foundBuilding.regency_code,
            district: foundBuilding.district_code,
            village: foundBuilding.village_code,
            postal_code: foundBuilding.postal_code,
          });

          // Populate area selects in sequence to avoid race/mismatch between
          // parent/child dropdowns (province -> regency -> district -> village).
          const provCode = foundBuilding.province_code.startsWith('id') ? foundBuilding.province_code : 'id' + foundBuilding.province_code;
          const regCode = foundBuilding.regency_code.startsWith('id') ? foundBuilding.regency_code : 'id' + foundBuilding.regency_code;
          const distCode = foundBuilding.district_code.startsWith('id') ? foundBuilding.district_code : 'id' + foundBuilding.district_code;
          const villCode = foundBuilding.village_code.startsWith('id') ? foundBuilding.village_code : 'id' + foundBuilding.village_code;

          setProvinsi(provCode);
          setKabKota(regCode);
          setKecamatan(distCode);
          setKelurahan(villCode);
          setPostalCode(foundBuilding.postal_code || '');

          // Load appliances from metadata.electronics_inventory
          if (foundBuilding.metadata?.electronics_inventory) {
            // Accept both legacy map shape and new array shape. Convert to
            // internal map representation so the rest of the form remains
            // unchanged. appliancesToArray handles both shapes and will
            // produce human-friendly names when converting from a map.
            const items = appliancesToArray(foundBuilding.metadata.electronics_inventory as unknown);
            setAppliances(arrayToAppliances(items));
          }

          // Try a single-shot approach: fetch all tariffs once, find the saved tariff
          // and then load tariffs for its category. This reduces requests and is
          // more robust if backend filtering is inconsistent.
          try {
            if (savedTariffId) {
              const allTariffs = await electricityService.getAllTariffs(token);
              const savedTariff = allTariffs.find((t) => t.id === savedTariffId);

              if (savedTariff) {
                // Set category from saved tariff and load tariffs for that category
                if (savedTariff.category_id) {
                  setCategoryId(savedTariff.category_id);
                  try {
                    const catTariffs = await electricityService.getTariffsByCategory(savedTariff.category_id, token);
                    // If server returns unrelated tariffs, prefer client-side filtering
                    const filtered = catTariffs.filter((t) => t.category_id === savedTariff.category_id);
                    setTariffs(filtered.length ? filtered : catTariffs.length ? catTariffs : [savedTariff]);
                  } catch (errCat) {
                    // Fallback: just put the saved tariff as the single option
                    console.warn('Failed to load tariffs for saved tariff category, falling back to single option', errCat);
                    setTariffs([savedTariff]);
                  }
                } else {
                  // No category info on tariff — still show it so user can re-select
                  setTariffs([savedTariff]);
                }

                setTariffId(savedTariffId);
              } else {
                // Saved tariff id not found in allTariffs — set id so user can correct
                console.warn('Saved tariff id not found in all tariffs:', savedTariffId);
                setTariffId(savedTariffId);
              }
            }
          } catch (err) {
            console.error('Failed to resolve saved tariff/category:', err);
            if (savedTariffId) setTariffId(savedTariffId);
          }
        }
      } catch (error) {
        console.error("Failed to fetch building:", error);
      } finally {
        setTimeout(() => {
          setIsInitialLoad(false);
          setLoading(false);
        }, 0);
      }
    }

    fetchBuilding();
  }, [id]);

  // Load electricity categories on mount
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
      // Skip if tariffs already loaded (from initial building data fetch)
      if (tariffs.length > 0 && tariffId) {
        console.log("⏭️ Skipping tariff reload, data already loaded");
        return;
      }

      setLoadingTariffs(true);

      try {
        const token = authService.getToken();
        if (!token) return;

        const masked = token ? `${String(token).slice(0, 8)}...` : 'none';
        console.log(`🔄 Loading tariffs for category: ${catId} (token: ${masked})`);
        const data = await electricityService.getTariffsByCategory(catId, token);
        console.log(`✅ Loaded ${data.length} tariffs for category ${catId}:`, data.map(t => t.power_capacity_label));

        // If backend returns all tariffs (no filtering), apply client-side filter as fallback
        const filtered = data.filter((t) => t.category_id === catId);
        if (filtered.length !== data.length) {
          console.warn(`⚠️ Backend returned ${data.length} tariffs, but ${filtered.length} match category ${catId}. Applying client-side filter.`);
          console.log('Filtered tariffs:', filtered.map(t => t.power_capacity_label));
          setTariffs(filtered);
        } else {
          setTariffs(data);
        }
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
    }
  }, [categoryId, tariffs.length, tariffId]);

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
      console.log("🔄 Loading regencies for province:", provCode);
      setLoadingRegencies(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await areaService.getRegencies(provCode, token);
        console.log(`✅ Loaded ${data.length} regencies for province ${provCode}`);
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
      console.log("⚠️ No province selected, clearing regencies");
      setRegencies([]);
      if (!isInitialLoad) {
        setKabKota("");
        setKecamatan("");
        setKelurahan("");
      }
    }
  }, [provinsi, isInitialLoad]);

  // Load districts when regency changes
  useEffect(() => {
    async function loadDistricts(regCode: string) {
      console.log("🔄 Loading districts for regency:", regCode);
      setLoadingDistricts(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await areaService.getDistricts(regCode, token);
        console.log(`✅ Loaded ${data.length} districts for regency ${regCode}`);
        setDistricts(data);
      } catch (error) {
        console.error("Failed to load districts:", error);
        setDistricts([]);
        if (!isInitialLoad) {
          setKecamatan("");
          setKelurahan("");
        }
      } finally {
        setLoadingDistricts(false);
      }
    }

    if (kabKota) {
      loadDistricts(kabKota);
    } else {
      console.log("⚠️ No regency selected, clearing districts");
      setDistricts([]);
      if (!isInitialLoad) {
        setKecamatan("");
        setKelurahan("");
      }
    }
  }, [kabKota, isInitialLoad]);

  // Load villages when district changes
  useEffect(() => {
    async function loadVillages(distCode: string) {
      console.log("🔄 Loading villages for district:", distCode);
      setLoadingVillages(true);
      try {
        const token = authService.getToken();
        if (!token) return;
        const data = await areaService.getVillages(distCode, token);
        console.log(`✅ Loaded ${data.length} villages for district ${distCode}`);
        setVillages(data);
      } catch (error) {
        console.error("Failed to load villages:", error);
        setVillages([]);
        if (!isInitialLoad) {
          setKelurahan("");
        }
      } finally {
        setLoadingVillages(false);
      }
    }

    if (kecamatan) {
      loadVillages(kecamatan);
    } else {
      console.log("⚠️ No district selected, clearing villages");
      setVillages([]);
      if (!isInitialLoad) {
        setKelurahan("");
      }
    }
  }, [kecamatan, isInitialLoad]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Peralatan listrik sekarang opsional (tidak wajib)

    setLoading(true);

    try {
      const token = authService.getToken();
      if (!token) return;

      // Get user profile to get user_id (REQUIRED by backend)
      const { userService } = await import("@/services/user");
      const profile = await userService.getMe(token);

      if (!profile.id) {
        toast.error("User ID tidak tersedia");
        return;
      }

      // WORKAROUND: Clean codes (remove leading zeros and invalid characters from backend bug)
      const cleanCode = (code: string) => code.replace(/[^0-9.]/g, '');
      const cleanUUID = (uuid: string) => {
        // Remove leading zeros and keep only valid UUID characters (0-9, a-f, -)
        return uuid.replace(/^0+/, '').replace(/[^0-9a-f-]/gi, '');
      };

      if (isNaN(Number(postalCode))) {
        toast.error("Kode Pos harus berupa angka.");
        return;
      }

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
          // Convert internal appliances map -> array of { name, qty }
          electronics_inventory: appliancesToArray(appliances).map((it) => ({ name: it.name, qty: toSafeNumber(it.count) })),
        },
      };

      console.log("Update building payload:", payload);
      console.log("👤 User ID:", profile.id);

      await assetsService.updateBuilding(id, payload, token);

      toast.error("Bangunan berhasil diperbarui!");
      router.push("/app/profile/manajemen-bangunan");
    } catch (error) {
  console.error("Failed to update building:", error);
  toast.error(userFriendlyError(error, "Gagal memperbarui bangunan. Silakan coba lagi."));
    } finally {
      setLoading(false);
    }
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
    label: tariff.rate_per_kwh
      ? `${tariff.power_capacity_label} (Rp ${Number(tariff.rate_per_kwh).toLocaleString("id-ID")}/kWh)`
      : tariff.power_capacity_label,
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
        <button onClick={() => router.push('/app/profile/manajemen-bangunan')} aria-label="Kembali" className="grid h-9 w-9 place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold text-black">Edit Bangunan</h1>
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
          // Don't lock the tariff select just because categoryId is missing
          // If tariffs were loaded (including fallback single saved-tariff), allow user to select
          disabled={loadingTariffs || tariffs.length === 0}
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
            console.log(e.target.value);

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
          inputMode="numeric"
          maxLength={6}
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
        // pass a normalized array so ApplianceSheet can render safely
        initial={appliancesToArray(appliances)}
        onClose={() => setShowApplianceSheet(false)}
        // ApplianceSheet returns array -> convert back to mapping for backend shape
        onApply={(vals) => {
          setAppliances(arrayToAppliances(vals));
          setShowApplianceSheet(false);
        }}
      />
    </main>
  );
}
