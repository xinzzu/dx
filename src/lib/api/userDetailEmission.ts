import type { UserDetailResponse, UserStatsResponse, UserStats } from '@/types/userDetailEmissionType';
import type { BuildingAsset } from '@/types/buildingAssetType';
import type { VehicleAsset } from '@/types/vehicleAssetType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * ✅ Fetch user profile + assets (building & vehicle)
 */
export async function getUserDetailById(userId: string): Promise<{
  profile: UserDetailResponse['data']['profile'];
  building_assets: BuildingAsset[];
  vehicle_assets: VehicleAsset[];
}> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: UserDetailResponse = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch user detail');
  }

  return json.data;
}

/**
 * ✅ Fetch user emission stats
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: UserStatsResponse = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch user stats');
  }

  return json.data;
}
