"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import { assetsService, VehicleResponse } from "@/services/assets";
import { vehicleService, VehicleEmissionFactor } from "@/services/vehicle";

export default function EditVehiclePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { getIdToken } = useAuth();

  // Vehicle data
  const [vehicle, setVehicle] = useState<VehicleResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [name, setName] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [capacityRange, setCapacityRange] = useState("");
  const [emissionFactorId, setEmissionFactorId] = useState("");

  // API Data
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [capacityRanges, setCapacityRanges] = useState<string[]>([]);
  const [fuelOptions, setFuelOptions] = useState<Array<{ id: string; fuelType: string; factor: VehicleEmissionFactor }>>([]);

  // Loading states
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCapacities, setLoadingCapacities] = useState(false);
  const [loadingFuels, setLoadingFuels] = useState(false);

  // Fetch vehicle data
  useEffect(() => {
    async function fetchVehicle() {
      try {
        const token = await getIdToken();
        if (!token) return;

        const vehicles = await assetsService.getVehicles(token);
        const foundVehicle = vehicles.find((v) => v.id === id);

        if (foundVehicle) {
          setVehicle(foundVehicle);
          setName(foundVehicle.name);
          setEmissionFactorId(foundVehicle.emission_factor_id);
        }
      } catch (error) {
        console.error("Failed to fetch vehicle:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicle();
  }, [id, getIdToken]);

  // Load vehicle types on mount
  useEffect(() => {
    async function loadVehicleTypes() {
      setLoadingTypes(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const types = await vehicleService.getVehicleTypes(token);
        setVehicleTypes(types);
      } catch (error) {
        console.error("Failed to load vehicle types:", error);
      } finally {
        setLoadingTypes(false);
      }
    }
    loadVehicleTypes();
  }, [getIdToken]);

  // Load capacity ranges when vehicle type changes
  useEffect(() => {
    async function loadCapacities(type: string) {
      setLoadingCapacities(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const ranges = await vehicleService.getCapacityRanges(type, token);
        setCapacityRanges(ranges);
      } catch (error) {
        console.error("Failed to load capacity ranges:", error);
        setCapacityRanges([]);
      } finally {
        setLoadingCapacities(false);
      }
    }

    if (vehicleType) {
      loadCapacities(vehicleType);
    } else {
      setCapacityRanges([]);
      setCapacityRange("");
    }
  }, [vehicleType, getIdToken]);

  // Load fuel types when capacity range changes
  useEffect(() => {
    async function loadFuelTypes(type: string, capacity: string) {
      setLoadingFuels(true);
      try {
        const token = await getIdToken();
        if (!token) return;
        const fuels = await vehicleService.getFuelTypes(type, capacity, token);
        setFuelOptions(fuels);
      } catch (error) {
        console.error("Failed to load fuel types:", error);
        setFuelOptions([]);
      } finally {
        setLoadingFuels(false);
      }
    }

    if (vehicleType && capacityRange) {
      loadFuelTypes(vehicleType, capacityRange);
    } else {
      setFuelOptions([]);
      setEmissionFactorId("");
    }
  }, [vehicleType, capacityRange, getIdToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: Implement PUT /vehicle-assets/:id
    console.log("Update vehicle:", {
      id,
      name,
      emissionFactorId,
    });

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

  if (!vehicle) {
    return (
      <main className="mx-auto max-w-screen-sm px-4 py-8">
        <p className="text-center text-sm text-black/60">Kendaraan tidak ditemukan.</p>
        <div className="mt-4 text-center">
          <Button onClick={() => router.back()}>Kembali</Button>
        </div>
      </main>
    );
  }

  const vehicleTypeOptions = vehicleTypes?.map((type) => ({ value: type, label: type })) || [];
  const capacityOptions = capacityRanges?.map((range) => ({ value: range, label: range })) || [];
  const fuelTypeOptions = fuelOptions?.map((opt) => ({ value: opt.id, label: opt.fuelType })) || [];

  return (
    <main className="mx-auto max-w-screen-sm px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Kembali" className="grid h-9 w-9 place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">Edit Kendaraan</h1>
        <div className="h-9 w-9" />
      </header>
      <div className="mx-auto mt-3 h-0.5 w-full" style={{ backgroundColor: "var(--color-primary)" }} />

      <form className="mt-4 space-y-4 rounded-2xl border border-emerald-500/60 p-4" onSubmit={handleSubmit}>
        <TextField
          id="vehicleName"
          label="Nama Kendaraan"
          placeholder="Contoh: Mobil Avanza 1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Select
          id="vehicleType"
          label="Jenis Kendaraan"
          placeholder={loadingTypes ? "Memuat..." : "Pilih jenis kendaraan"}
          options={vehicleTypeOptions}
          value={vehicleType}
          onChange={(e) => {
            setVehicleType(e.target.value);
            setCapacityRange("");
            setEmissionFactorId("");
          }}
          disabled={loadingTypes}
          required
        />

        <Select
          id="engineCapacity"
          label="Kapasitas Mesin"
          placeholder={
            loadingCapacities
              ? "Memuat..."
              : vehicleType
              ? "Pilih kapasitas mesin"
              : "Pilih jenis kendaraan dulu"
          }
          options={capacityOptions}
          value={capacityRange}
          onChange={(e) => {
            setCapacityRange(e.target.value);
            setEmissionFactorId("");
          }}
          disabled={!vehicleType || loadingCapacities}
          required
        />

        <Select
          id="fuelType"
          label="Jenis Bahan Bakar"
          placeholder={
            loadingFuels
              ? "Memuat..."
              : capacityRange
              ? "Pilih jenis bahan bakar"
              : "Pilih kapasitas mesin dulu"
          }
          options={fuelTypeOptions}
          value={emissionFactorId}
          onChange={(e) => setEmissionFactorId(e.target.value)}
          disabled={!capacityRange || loadingFuels}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Batal
          </Button>
          <Button type="submit" size="lg">
            Simpan
          </Button>
        </div>
      </form>
    </main>
  );
}
