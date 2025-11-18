import type { EmissionTrendResponse, EmissionTrendData } from '@/types/emissionTrendUserType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * ✅ Fetch emission trend by user ID and year
 */
export async function getEmissionTrend(userId: string, year: number): Promise<EmissionTrendData> {
  const url = `${API_URL}/admin/users/${userId}/emission-trend?year=${year}`;

  console.log('🔍 Fetching emission trend:', url);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: EmissionTrendResponse = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch emission trend');
  }

  return json.data;
}
