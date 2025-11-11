export type VehicleType = "mobil" | "motor" | "bus" | "pesawat" | "kereta";
export type Fuel = "bensin" | "solar" | "listrik" | null;

export type TransportEntry = {
  type: VehicleType;
  usesPerMonth: number;      // berapa kali per bulan
  dailyDistanceKm: number;   // estimasi jarak per hari (km)
  fuel: Fuel;                // hanya untuk mobil/motor, selain itu null
  updatedAt: number;         // epoch ms
};
