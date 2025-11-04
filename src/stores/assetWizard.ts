// src/stores/assetWizard.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ====== Tambahan tipe peralatan (untuk bottom sheet) ======
export type ApplianceId =
  | "lampu"
  | "kipas"
  | "ac"
  | "kulkas"
  | "kompor"
  | "magiccom"
  | "pemanas"
  | "blender"
  | "mesin_cuci"
  | "setrika"
  | "pompa_air"
  | "komputer"
  | "proyektor"
  | "sound_system";

// ====== ENTITAS ======
export type Building = {
  id: string;
  name: string;
  categoryId: string;     // ID from electricity-tariff-categories API
  categoryName: string;   // Display name (e.g., "Rumah Tangga Subsidi")
  tariffId: string;       // ID from electricity-tariffs API
  tariffLabel: string;    // Display label (e.g., "1300 VA")
  dayaVa: number;         // Actual power value from selected tariff
  luasM2?: number;

  // Alamat
  alamatJalan: string;
  provinsi: string;
  kabKota: string;
  kecamatan: string;
  kelurahan: string;
  postalCode?: number;

  // Peralatan listrik (opsional, by id → jumlah)
  appliances?: Partial<Record<ApplianceId, number>>;
};

export type Vehicle = {
  id: string;
  name: string;
  type: "mobil" | "motor" | "bus" | "truk" | "lainnya";

  emissionFactorId: string;       // ID from vehicle-emission-factors API
  vehicleTypeLabel: string;       // Display label (e.g., "Mobil", "Motor")
  capacityRangeLabel: string;     // Display label (e.g., "<1400cc", "1400-2000cc")
  fuelTypeLabel: string;          // Display label (e.g., "Bensin", "Solar")

  // Keep for backward compatibility
  engineCapacity?: string;
  engineCapacityCc?: number;
  fuelType?: "bensin" | "diesel" | "listrik" | "hybrid" | "lainnya";
};

// ====== STATE & ACTIONS ======
type State = {
  buildings: Building[];
  vehicles: Vehicle[];

  addBuilding: (b: Omit<Building, "id">) => void;
  updateBuilding: (id: string, patch: Partial<Building>) => void;
  setBuildingAppliances: (
    id: string,
    aps: Partial<Record<ApplianceId, number>>
  ) => void;
  removeBuilding: (id: string) => void;

  addVehicle: (v: Omit<Vehicle, "id">) => void;
  updateVehicle: (id: string, patch: Partial<Vehicle>) => void;
  removeVehicle: (id: string) => void;

  reset: () => void;
};

export const useAssetWizard = create<State>()(
  persist(
    (set, get) => ({
      buildings: [],
      vehicles: [],

      // ===== Building =====
      addBuilding: (b) =>
        set({
          buildings: [...get().buildings, { ...b, id: crypto.randomUUID() }],
        }),

      updateBuilding: (id, patch) =>
        set({
          buildings: get().buildings.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        }),

      setBuildingAppliances: (id, aps) =>
        set({
          buildings: get().buildings.map((x) =>
            x.id === id
              ? { ...x, appliances: { ...(x.appliances ?? {}), ...aps } }
              : x
          ),
        }),

      removeBuilding: (id) =>
        set({ buildings: get().buildings.filter((x) => x.id !== id) }),

      // ===== Vehicle =====
      addVehicle: (v) =>
        set({
          vehicles: [...get().vehicles, { ...v, id: crypto.randomUUID() }],
        }),

      updateVehicle: (id, patch) =>
        set({
          vehicles: get().vehicles.map((x) =>
            x.id === id ? { ...x, ...patch } : x
          ),
        }),

      removeVehicle: (id) =>
        set({ vehicles: get().vehicles.filter((x) => x.id !== id) }),

      // ===== Utils =====
      reset: () => set({ buildings: [], vehicles: [] }),
    }),
    { name: "asset-wizard" }
  )
);
