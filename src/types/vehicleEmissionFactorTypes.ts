export interface VehicleEmissionFactorTypes {
  id: string;
  vehicle_type: string;
  fuel_type: string;
  capacity_range_label: string;
  default_km_per_liter: number;
  g_co2e_per_km: number;
  active: boolean;
}
