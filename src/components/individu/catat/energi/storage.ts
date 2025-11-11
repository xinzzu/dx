import { EnergyEntry } from "./types";

const KEY = "catat.energy.entry";

export function loadEnergy(): EnergyEntry | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as EnergyEntry; } catch { return null; }
}

export function saveEnergy(entry: EnergyEntry) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(entry));
}

export function clearEnergy() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
