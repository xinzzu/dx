import { ElectricityEmissionTarifWithCategoryName } from './electricityEmissionTarif';

export interface BuildingAssetMetadata {
  area_sqm: number;
  floors?: number;
  facilities?: string[];
  building_type?: string;
  construction_year?: number;
  electronics_inventory?: Record<string, number> | { name: string; qty: number }[];
}

export interface BuildingAsset {
  id: string;
  user_id: string;
  name: string;
  description?: string;

  electricity_tariff_id?: string;
  electricity_tariff_rate_per_kwh: number;
  power_capacity_label?: string;
  has_renewables: boolean;

  electricity_tariff?: ElectricityEmissionTarifWithCategoryName;

  // 👉 Lokasi
  province_code: string;
  regency_code: string;
  district_code: string;
  village_code: string;
  address_label?: string;
  postal_code?: string;
  full_address?: string;
  latitude?: number;
  longitude?: number;

  metadata: BuildingAssetMetadata;
  active?: boolean;
}

export interface ApiLinks {
  next?: string | null;
  prev?: string | null;
}

export interface ApiMeta {
  success: boolean;
  message?: string;
}

export interface ApiPagination {
  page?: number;
  per_page?: number;
  total_items?: number;
  total_pages?: number;
}

/**
 * Struktur response list /building-assets
 */
export interface BuildingAssetResponse {
  reqId?: string;
  meta: ApiMeta;
  data: BuildingAsset[];
  links?: ApiLinks;
  pagination?: ApiPagination;
}
