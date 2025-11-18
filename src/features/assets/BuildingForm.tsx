// src/features/assets/BuildingForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useOnboarding } from "@/stores/onboarding";
import useAuth from "@/hooks/useAuth";
import { areaService, Province, Regency, District, Village } from "@/services/area";
import { electricityService, ElectricityCategory, ElectricityTariff } from "@/services/electricity";
import { toast } from "sonner";

type Props = { onSaved?: () => void; onCancel?: () => void };

export default function BuildingForm({ onSaved, onCancel }: Props) {
  const { addBuilding, buildings } = useAssetWizard();
  const { markAssetsBuildingsCompleted } = useOnboarding();
  const { getIdToken } = useAuth();

  // existing fields
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(""); // Changed from 'gol'
  const [tariffId, setTariffId] = useState(""); // Changed from 'daya'
  const [luas, setLuas] = useState("");

  // API Data for electricity
  const [categories, setCategories] = useState<ElectricityCategory[]>([]);
  const [tariffs, setTariffs] = useState<ElectricityTariff[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingTariffs, setLoadingTariffs] = useState(false);

  // alamat
  const [alamatJalan, setAlamatJalan] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kabKota, setKabKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // API Data
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [regencies, setRegencies] = useState<Regency[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // options
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

  // Prepare electricity options
  const categoryOptions = useMemo(
    () => categories?.map((c) => ({ value: c.id, label: c.category_name })) || [],
    [categories]
  );
  const tariffOptions = useMemo(
    () =>
      tariffs?.map((t) => ({
        value: t.id,
        // Include rate per kWh similar to profile edit page for clearer selection
        label: t.rate_per_kwh
          ? `${t.power_capacity_label} (Rp ${Number(t.rate_per_kwh).toLocaleString("id-ID")}/kWh)`
          : t.power_capacity_label,
      })) || [],
    [tariffs]
  );

  // Load electricity categories on mount
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const token = await getIdToken();
        if (!token) {
          console.warn("No token available");
          return;
        }
        const data = await electricityService.getCategories(token);
        setCategories(data);
      } catch (error) {
        console.error("Failed to load electricity categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [getIdToken]);

  // Load tariffs when category changes
  useEffect(() => {
    async function loadTariffs(catId: string) {
      setLoadingTariffs(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const data = await electricityService.getTariffsByCategory(catId, token);
        // Some backends may return extra tariffs not strictly filtered by category_id.
        // Apply a client-side filter (same behavior as NewBuildingPage) so the VA list
        // matches the selected golongan (Industri, Pelayanan Sosial, Non-subsidi, dll.).
        const filtered = data.filter((t) => t.category_id === catId);
        setTariffs(filtered.length > 0 ? filtered : data);
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
      setTariffs([]);
      setTariffId(""); // Reset tariff when category changes
    }
  }, [categoryId, getIdToken]);

  // Load provinces saat mount
  useEffect(() => {
    async function loadProvinces() {
      setLoadingProvinces(true);
      try {
        const token = await getIdToken();
        if (!token) {
          console.warn("No token available");
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
    loadProvinces();
  }, [getIdToken]);

  // Load regencies ketika provinsi berubah
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

    if (provinsi) {
      loadRegencies(provinsi);
    } else {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
    }
  }, [provinsi, getIdToken]);

  // Load districts ketika kabupaten berubah
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

    if (kabKota) {
      loadDistricts(kabKota);
    } else {
      setDistricts([]);
      setVillages([]);
    }
  }, [kabKota, getIdToken]);

  // Load villages ketika kecamatan berubah
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

    if (kecamatan) {
      loadVillages(kecamatan);
    } else {
      setVillages([]);
    }
  }, [kecamatan, getIdToken]);

  // reset cascade
  const onProvChange = (v: string) => {
    setProvinsi(v); setKabKota(""); setKecamatan(""); setKelurahan("");
  };
  const onKabChange = (v: string) => {
    setKabKota(v); setKecamatan(""); setKelurahan("");
  };
  const onKecChange = (v: string) => {
    setKecamatan(v); setKelurahan("");
  };

  const canSubmit = useMemo(
    () =>
      !!(
        name.trim() &&
        categoryId &&
        tariffId &&
        alamatJalan.trim() &&
        provinsi &&
        kabKota &&
        kecamatan &&
        kelurahan
      ),
    [name, categoryId, tariffId, alamatJalan, provinsi, kabKota, kecamatan, kelurahan]
  );

  function handleSave() {
    if (!canSubmit) return;
    const wasEmpty = buildings.length === 0;

    // Debug: log the building about to be added
    console.debug("[building-form] adding building:", {
      name: name.trim(),
      categoryId,
      tariffId,
      luas: luas ? Number(luas) : undefined,
      alamatJalan: alamatJalan.trim(),
      provinsi,
      kabKota,
      kecamatan,
      kelurahan,
    });

    // Find the selected category and tariff to get display labels and power value
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedTariff = tariffs.find((t) => t.id === tariffId);
    const powerVa = selectedTariff?.min_power_va || 0;

    if (isNaN(Number(postalCode))) {
      toast.error("Kode Pos harus berupa angka.");
      return;
    }

    addBuilding({
      name: name.trim(),
      categoryId: categoryId,        // store category ID
      categoryName: selectedCategory?.category_name || "", // store for display
      tariffId: tariffId,            // store tariff ID
      tariffLabel: selectedTariff?.power_capacity_label || "", // store for display
      dayaVa: powerVa,               // store actual power value from tariff
      luasM2: luas ? Number(luas) : undefined,
      postalCode: Number(postalCode) || undefined,
      // alamat simpan ke store
      alamatJalan: alamatJalan.trim(),
      provinsi,
      kabKota,
      kecamatan,
      kelurahan,
    });

    // Immediately log the current persisted store for debugging (sync read)
    try {
      // useAssetWizard.getState() is available from Zustand to synchronously read
      const getter = (useAssetWizard as unknown as { getState: () => { buildings: unknown[] } }).getState;
      const state = getter();
      console.debug("[building-form] asset-wizard store after add:", state.buildings);
    } catch (e) {
      console.debug("[building-form] failed to read asset-wizard state after add", e);
    }

    if (wasEmpty) markAssetsBuildingsCompleted();

    // reset form
    setName(""); setCategoryId(""); setTariffId(""); setLuas("");
    setAlamatJalan(""); setProvinsi(""); setKabKota(""); setKecamatan(""); setKelurahan("");

    onSaved?.();
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      className="rounded-2xl border border-[var(--color-primary,theme(colors.emerald.500))]/60 p-4"
    >
      <div className="font-semibold mb-3">Form Bangunan Baru</div>

      <div className="grid gap-4">
        <TextField
          id="namaBangunan"
          label="Nama Bangunan"
          placeholder="Contoh: Bangunan Utama"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="golPln"
          label="Jenis Golongan Listrik PLN"
          placeholder={loadingCategories ? "Memuat..." : "Pilih jenis layanan"}
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setTariffId(""); }}
          disabled={loadingCategories}
          required
        />

        <Select
          id="daya"
          label="Daya Bangunan (VA)"
          placeholder={
            loadingTariffs
              ? "Memuat..."
              : categoryId
                ? "Pilih daya bangunan"
                : "Pilih golongan dulu"
          }
          options={tariffOptions}
          value={tariffId}
          onChange={(e) => setTariffId(e.target.value)}
          required
          disabled={!categoryId || loadingTariffs}
        />

        <TextField
          id="luas"
          label="Luas Bangunan (m²) (Opsional)"
          placeholder="Contoh: 120"
          inputMode="numeric"
          value={luas}
          onChange={(e) => setLuas(e.target.value)}
        />

        {/* ===== Alamat ===== */}
        <TextField
          id="alamat"
          label="Alamat Bangunan"
          placeholder="Jalan Cempaka No.xx"
          value={alamatJalan}
          onChange={(e) => setAlamatJalan(e.target.value)}
          required
        />

        <Select
          id="provinsi"
          label="Provinsi"
          placeholder={loadingProvinces ? "Memuat..." : "Pilih provinsi"}
          options={provOptions}
          value={provinsi}
          onChange={(e) => onProvChange(e.target.value)}
          disabled={loadingProvinces}
          required
        />

        <Select
          id="kabkota"
          label="Kabupaten/Kota"
          placeholder={
            loadingRegencies
              ? "Memuat..."
              : provinsi
                ? "Pilih kabupaten/kota"
                : "Pilih provinsi dulu"
          }
          options={kabOptions}
          value={kabKota}
          onChange={(e) => onKabChange(e.target.value)}
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
                : "Pilih kab/kota dulu"
          }
          options={kecOptions}
          value={kecamatan}
          onChange={(e) => onKecChange(e.target.value)}
          disabled={!kabKota || loadingDistricts}
          required
        />

        <Select
          id="kelurahan"
          label="Kelurahan"
          placeholder={
            loadingVillages
              ? "Memuat..."
              : kecamatan
                ? "Pilih kelurahan"
                : "Pilih kecamatan dulu"
          }
          options={kelOptions}
          value={kelurahan}
          onChange={(e) => setKelurahan(e.target.value)}
          disabled={!kecamatan || loadingVillages}
          required
        />

        <TextField
          id="postalCode"
          label="Kode Pos"
          placeholder="Contoh 5542"
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          required

        />

        <div className="flex gap-2">
          <Button size="lg" className="flex-1" type="submit" disabled={!canSubmit}>
            Simpan
          </Button>
          <Button size="lg" variant="outline" className="flex-1" type="button" onClick={onCancel}>
            Batal
          </Button>
        </div>
      </div>
    </form>
  );
}
