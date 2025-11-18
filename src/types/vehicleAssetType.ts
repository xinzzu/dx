import type { VehicleEmissionFactorTypes } from './vehicleEmissionFactorTypes';

export interface VehicleAssetMetadata {
  fuel_type: string;
  vehicle_type: string;
  capacity_range: string;
}

export interface VehicleAsset {
  id: string;
  user_id: string;
  name: string;
  emission_factor_id: string;
  metadata: VehicleAssetMetadata;
  active: boolean;

  // ✅ Relasi opsional ke emission factor
  emission_factor?: VehicleEmissionFactorTypes;
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
 * Struktur response list /vehicle-assets
 */
export interface VehicleAssetResponse {
  reqId?: string;
  meta: ApiMeta;
  data: VehicleAsset[];
  links?: ApiLinks;
  pagination?: ApiPagination;
}
