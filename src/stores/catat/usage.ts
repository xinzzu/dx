"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { genId } from "@/utils/id"; // gunakan helper dari poin #1

const ym = (d: Date | string) => {
  const x = typeof d === "string" ? new Date(d) : d;
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}`;
};

// ----- Tipe data -----
export type TransportReport = {
  id: string;
  date: string;            // ISO
  monthKey: string;        // "YYYY-MM"
  vehicleId: string;
  fuelType: "bensin" | "diesel" | "listrik" | "bbm_lain";
  fuelProductId?: string | null;
  monthlyCost: number;     // rupiah
};

export type EnergyReport = {
  id: string;
  date: string;            // ISO
  monthKey: string;        // "YYYY-MM"
  buildingId: string;
  billCost: number;        // rupiah
  useClean?: boolean;
  cleanType?: "solar" | "angin" | "air" | "lainnya";
  cleanKwh?: number;
};

// Tetap pakai struktur lokalmu (akan dipetakan saat kirim ke API)
export type FoodReport = {
  id: string;
  date: string;            // ISO
  monthKey: string;        // "YYYY-MM"
  period: "weekly" | "monthly";
  items: Array<{ id: string; freq: "1-3" | "4-5" }>;
};

type State = {
  transport: TransportReport[];
  energy: EnergyReport[];
  food: FoodReport[];

  // Transport CRUD
  addTransport: (r: Omit<TransportReport, "id" | "monthKey">) => void;
  updateTransport: (id: string, patch: Partial<TransportReport>) => void;
  removeTransport: (id: string) => void;

  // Energy CRUD
  addEnergy: (r: Omit<EnergyReport, "id" | "monthKey">) => void;
  updateEnergy: (id: string, patch: Partial<EnergyReport>) => void;
  removeEnergy: (id: string) => void;

  // Food CRUD
  addFood: (r: Omit<FoodReport, "id" | "monthKey">) => void;
  updateFood: (id: string, patch: Partial<FoodReport>) => void;
  removeFood: (id: string) => void;
};

export const useUsage = create<State>()(
  persist(
    (set, get) => ({
      transport: [],
      energy: [],
      food: [],

      addTransport: (r) =>
        set({
          transport: [
            ...get().transport,
            { ...r, id: genId(), monthKey: ym(r.date) },
          ],
        }),

      updateTransport: (id, patch) =>
        set({
          transport: get().transport.map((x) =>
            x.id === id
              ? { ...x, ...patch, monthKey: patch.date ? ym(patch.date) : x.monthKey }
              : x
          ),
        }),

      removeTransport: (id) =>
        set({ transport: get().transport.filter((x) => x.id !== id) }),

      addEnergy: (r) =>
        set({
          energy: [
            ...get().energy,
            { ...r, id: genId(), monthKey: ym(r.date) },
          ],
        }),

      updateEnergy: (id, patch) =>
        set({
          energy: get().energy.map((x) =>
            x.id === id
              ? { ...x, ...patch, monthKey: patch.date ? ym(patch.date) : x.monthKey }
              : x
          ),
        }),

      removeEnergy: (id) =>
        set({ energy: get().energy.filter((x) => x.id !== id) }),

      addFood: (r) =>
        set({
          food: [
            ...get().food,
            { ...r, id: genId(), monthKey: ym(r.date) },
          ],
        }),

      updateFood: (id, patch) =>
        set({
          food: get().food.map((x) =>
            x.id === id
              ? { ...x, ...patch, monthKey: patch.date ? ym(patch.date) : x.monthKey }
              : x
          ),
        }),

      removeFood: (id) =>
        set({ food: get().food.filter((x) => x.id !== id) }),
    }),
    { name: "usage-reports" }
  )
);

// Selector bulanan — sekarang termasuk FOOD juga
export const useMonthlyUsage = (monthKey?: string) =>
  useUsage((s) => {
    const mk = monthKey ?? ym(new Date());
    return {
      transport: s.transport.filter((x) => x.monthKey === mk),
      energy: s.energy.filter((x) => x.monthKey === mk),
      food: s.food.filter((x) => x.monthKey === mk),
      monthKey: mk,
    };
  });
