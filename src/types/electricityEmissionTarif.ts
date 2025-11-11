export interface ElectricityEmissionTarifTypes {
  id: string;
  category_id: string;
  power_capacity_label: string;
  min_power_va: number;
  max_power_va: number;
  rate_per_kwh: number;
  active: boolean;
}

// 👉 Extended type (untuk tabel admin)
export interface ElectricityEmissionTarifWithCategoryName extends ElectricityEmissionTarifTypes {
  category_name?: string;
}
