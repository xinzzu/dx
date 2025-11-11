"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import { vehicleService, VehicleEmissionFactor } from "@/services/vehicle";
import { assetsService } from "@/services/assets";
import { userService } from "@/services/user";
import type { Vehicle } from "@/stores/assetWizard";
import Image from "next/image";

export default function NewVehiclePage() {
  const router = useRouter();
  const { getIdToken } = useAuth();

  const [name, setName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [capacityRange, setCapacityRange] = useState("");
  const [emissionFactorId, setEmissionFactorId] = useState("");

  // API data
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [capacityRanges, setCapacityRanges] = useState<string[]>([]);
  const [fuelOptions, setFuelOptions] = useState<
    Array<{ id: string; fuelType: string; factor: VehicleEmissionFactor }>
  >([]);

  // fuel products (from /vehicle-fuel-products)
  // fuel product selection removed — we no longer collect specific product at vehicle creation

  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCapacities, setLoadingCapacities] = useState(false);
  const [loadingFuels, setLoadingFuels] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vehicleTypeOptions = useMemo(
    () => vehicleTypes.map((t) => ({ value: t, label: t })),
    [vehicleTypes]
  );
  const capacityOptions = useMemo(
    () => capacityRanges.map((r) => ({ value: r, label: r })),
    [capacityRanges]
  );
  const fuelTypeOptions = useMemo(
    () => fuelOptions.map((f) => ({ value: f.id, label: f.fuelType })),
    [fuelOptions]
  );

  // productOptions removed

  useEffect(() => {
    async function load() {
      setLoadingTypes(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const types = await vehicleService.getVehicleTypes(token);
        setVehicleTypes(types);
      } catch (err) {
        console.error("Failed to load vehicle types", err);
      } finally {
        setLoadingTypes(false);
      }
    }
    load();
  }, [getIdToken]);

  useEffect(() => {
    async function loadCapacities(type: string) {
      setLoadingCapacities(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const ranges = await vehicleService.getCapacityRanges(type, token);
        setCapacityRanges(ranges);
      } catch (err) {
        console.error("Failed to load capacity ranges", err);
        setCapacityRanges([]);
      } finally {
        setLoadingCapacities(false);
      }
    }

    if (vehicleType) loadCapacities(vehicleType);
    else {
      setCapacityRanges([]);
      setCapacityRange("");
    }
  }, [vehicleType, getIdToken]);

  useEffect(() => {
    async function loadFuels(type: string, capacity: string) {
      setLoadingFuels(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const fuels = await vehicleService.getFuelTypes(type, capacity, token);
        // vehicleService returns array of {id, fuelType, factor}
        setFuelOptions(fuels || []);
      } catch (err) {
        console.error("Failed to load fuel types", err);
        setFuelOptions([]);
      } finally {
        setLoadingFuels(false);
      }
    }

    if (vehicleType && capacityRange) loadFuels(vehicleType, capacityRange);
    else {
      setFuelOptions([]);
      setEmissionFactorId("");
    }
  }, [vehicleType, capacityRange, getIdToken]);

  // fuel products are not loaded — selection removed

  const canSubmit =
    !!(name.trim() && vehicleType && capacityRange && emissionFactorId) &&
    !isSubmitting;

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Token tidak tersedia");

      // get current user to extract user_id
      const profile = await userService.getMe(token);
      const userId = profile?.id;
      if (!userId) throw new Error("User ID tidak ditemukan");

      // build vehicle object matching store Vehicle type (generate an id so it satisfies the Vehicle type)
      const chosenFuel = fuelOptions.find((f) => f.id === emissionFactorId);
      const vehicle: Vehicle = {
        id: crypto.randomUUID(),
        name: name.trim(),
        type: vehicleType.toLowerCase() as Vehicle["type"],
        emissionFactorId: emissionFactorId,
        vehicleTypeLabel: vehicleType,
        capacityRangeLabel: capacityRange,
        fuelTypeLabel: chosenFuel?.fuelType || "",
        engineCapacity: capacityRange,
        fuelType: (
          chosenFuel?.fuelType || ""
        ).toLowerCase() as Vehicle["fuelType"],
      };
      await assetsService.createVehicle(vehicle, userId, token);

      router.push("/app/profile/manajemen-kendaraan");
    } catch (err: unknown) {
      console.error("Failed to create vehicle", err);
      const message =
        err instanceof Error
          ? err.message
          : String(err) || "Gagal menambahkan kendaraan";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="grid h-9 w-9 place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Tambah Kendaraan
        </h1>
        <div className="h-9 w-9" />
      </header>

      <div
        className="mx-auto mt-3 h-0.5 w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      <form className="rounded-2xl  p-4 space-y-4" onSubmit={handleSubmit}>
        <TextField
          id="vehicleName"
          label="Nama Kendaraan"
          placeholder="Masukan Nama Kendaraan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="vehicleType"
          label="Jenis Kendaraan"
          options={vehicleTypeOptions}
          value={vehicleType}
          onChange={(e) => {
            setVehicleType(e.target.value);
            setCapacityRange("");
            setEmissionFactorId("");
          }}
          placeholder={loadingTypes ? "Memuat..." : "Pilih jenis kendaraan"}
          required
        />

        <Select
          id="engineCapacity"
          label="Kapasitas Mesin"
          options={capacityOptions}
          value={capacityRange}
          onChange={(e) => {
            setCapacityRange(e.target.value);
            setEmissionFactorId("");
          }}
          placeholder={
            loadingCapacities
              ? "Memuat..."
              : vehicleType
              ? "Pilih kapasitas mesin"
              : "Pilih jenis kendaraan dulu"
          }
          disabled={!vehicleType || loadingCapacities}
          required
        />

        <Select
          id="fuelType"
          label="Jenis Bahan Bakar"
          options={fuelTypeOptions}
          value={emissionFactorId}
          onChange={(e) => setEmissionFactorId(e.target.value)}
          placeholder={
            loadingFuels
              ? "Memuat..."
              : capacityRange
              ? "Pilih jenis bahan bakar"
              : "Pilih kapasitas mesin dulu"
          }
          disabled={!capacityRange || loadingFuels}
          required
        />

        {/* Produk bahan bakar (opsional) removed per request */}

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
          >
            Batal
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            disabled={!canSubmit}
          >
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </main>
  );
}
