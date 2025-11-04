"use client";

import { useMemo, useState, useEffect } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import TextField from "@/components/ui/TextField";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { useOnboarding } from "@/stores/onboarding";
import useAuth from "@/hooks/useAuth";
import { vehicleService, VehicleEmissionFactor } from "@/services/vehicle";

type Props = {
  onSaved?: () => void;   // dipanggil setelah simpan sukses
  onCancel?: () => void;  // batalkan form
};

export default function VehicleForm({ onSaved, onCancel }: Props) {
  const { addVehicle, vehicles } = useAssetWizard();
  const { markAssetsVehiclesCompleted } = useOnboarding();
  const { getIdToken } = useAuth();

  const [name, setName] = useState("");
  const [vehicleType, setVehicleType] = useState(""); // Mobil, Motor, Bus, Truk
  const [capacityRange, setCapacityRange] = useState(""); // <1400cc, 1400-2000cc, >2000cc
  const [emissionFactorId, setEmissionFactorId] = useState(""); // ID dari selected fuel type

  // API Data
  const [vehicleTypes, setVehicleTypes] = useState<string[]>([]);
  const [capacityRanges, setCapacityRanges] = useState<string[]>([]);
  const [fuelOptions, setFuelOptions] = useState<Array<{ id: string; fuelType: string; factor: VehicleEmissionFactor }>>([]);
  
  // Loading states
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingCapacities, setLoadingCapacities] = useState(false);
  const [loadingFuels, setLoadingFuels] = useState(false);

  // Prepare options
  const vehicleTypeOptions = useMemo(
    () => vehicleTypes?.map((type) => ({ value: type, label: type })) || [],
    [vehicleTypes]
  );
  const capacityOptions = useMemo(
    () => capacityRanges?.map((range) => ({ value: range, label: range })) || [],
    [capacityRanges]
  );
  const fuelTypeOptions = useMemo(
    () => fuelOptions?.map((opt) => ({ value: opt.id, label: opt.fuelType })) || [],
    [fuelOptions]
  );

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

  const canSubmit = useMemo(
    () => !!(name.trim() && vehicleType && capacityRange && emissionFactorId),
    [name, vehicleType, capacityRange, emissionFactorId]
  );

  function handleSave() {
    if (!canSubmit) return;

    const wasEmpty = vehicles.length === 0;

    // Find selected emission factor for additional data
    const selectedFuel = fuelOptions.find((opt) => opt.id === emissionFactorId);

    addVehicle({
      name: name.trim(),
      // @ts-expect-error enum string ok
      type: vehicleType.toLowerCase(), // "Mobil" -> "mobil"
      emissionFactorId: emissionFactorId, // Store emission factor ID
      vehicleTypeLabel: vehicleType, // Store for display
      capacityRangeLabel: capacityRange, // Store for display
      fuelTypeLabel: selectedFuel?.fuelType || "", // Store for display
      engineCapacity: capacityRange, // Keep for compatibility
      // @ts-expect-error enum string ok
      fuelType: selectedFuel?.fuelType.toLowerCase() || "", // Keep for compatibility
    });

    if (wasEmpty) markAssetsVehiclesCompleted(); // ✅ tandai pertama kali ada kendaraan

    // reset & close
    setName(""); 
    setVehicleType(""); 
    setCapacityRange(""); 
    setEmissionFactorId("");
    onSaved?.();
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSave(); }}
      className="rounded-2xl border border-[var(--color-primary,theme(colors.emerald.500))]/60 p-4"
    >
      <div className="font-semibold mb-3">Form Kendaraan Baru</div>

      <div className="grid gap-4">
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

        <div className="flex gap-2">
          <Button
            size="lg"
            className="flex-1"
            disabled={!canSubmit}
            type="button"
            onClick={handleSave}
          >
            Simpan
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            type="button"
            onClick={onCancel}
          >
            Batal
          </Button>
        </div>
      </div>
    </form>
  );
}
