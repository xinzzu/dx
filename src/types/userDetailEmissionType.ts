import type { BuildingAsset } from './buildingAssetType';
import type { VehicleAsset } from './vehicleAssetType';

// ✅ User Profile
export interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  user_type: 'individu' | 'lembaga';
  joined_date: string;
  address: string; // Format: "id3171090002, id3171090, id3171, id31"
}

// ✅ User Detail Response
export interface UserDetailResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: {
    profile: UserProfile;
    building_assets: BuildingAsset[];
    vehicle_assets: VehicleAsset[];
  };
}

// ✅ User Stats
export interface UserStats {
  header_total_emisi_tons: number;
  overview_cards: {
    avg_emisi_per_bulan_tons: number;
    total_bangunan: number;
    total_emisi_semua_periode_tons: number;
    total_kendaraan: number;
    total_laporan_emisi: number;
  };
}

// ✅ User Stats Response
export interface UserStatsResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: UserStats;
}
