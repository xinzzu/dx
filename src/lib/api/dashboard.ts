// lib/api/dashboard.ts
import type { DashboardMainOverview, DashboardFilters, NationalTrend } from '@/types/dashboardType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch dashboard main overview dengan filters
 */
export async function getDashboardMainOverview(filters: DashboardFilters = {}): Promise<DashboardMainOverview> {
  const { year, month, user_type, provinces } = filters;

  // Build query params
  const params = new URLSearchParams();

  if (year && year !== 'semua') {
    params.set('year', String(year));
  }

  if (month && month !== 'semua') {
    params.set('month', String(month));
  }

  if (user_type && user_type !== 'semua') {
    params.set('user_type', user_type);
  }

  // ✅ Update: Kirim multiple provinces dengan format ?province=id33&province=id34
  if (provinces && provinces.length > 0) {
    provinces.forEach((provinceId) => {
      params.append('province', provinceId);
    });
  }

  const url = `${API_URL}/admin/dashboard/main/overview${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('🔍 Fetching dashboard overview:', url);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch dashboard overview');
  }

  return data.data;
}

/**
 * ✅ Fetch national trend (line chart data)
 * Filter: hanya year
 */
export async function getNationalTrend(year?: number | 'semua'): Promise<NationalTrend> {
  const params = new URLSearchParams();

  if (year && year !== 'semua') {
    params.set('year', String(year));
  }

  const url = `${API_URL}/admin/dashboard/national-trend${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('🔍 Fetching national trend:', url);

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
    });

    const data = await res.json();
    console.log('📊 National trend response:', data);

    if (!res.ok) {
      throw new Error('Failed to fetch national trend');
    }

    // ✅ Response langsung berisi { datasets, labels }, TIDAK ADA wrapper meta/data
    if (!data.datasets || !data.labels) {
      throw new Error('Invalid response structure from national trend API');
    }

    return data; // ✅ Return langsung, bukan data.data
  } catch (error) {
    console.error('❌ Fetch national trend failed:', error);
    throw error;
  }
}
