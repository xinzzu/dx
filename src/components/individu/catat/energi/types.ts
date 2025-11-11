export type EnergySource = "pln" | "clean";

export type EnergyEntry = {
  source: EnergySource;   // PLN / Energi Bersih
  powerVA: number;        // 450, 900, 1300, dst
  billRp: number;         // nominal rupiah (tanpa titik)
};
