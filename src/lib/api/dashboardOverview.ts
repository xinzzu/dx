import type { DashboardOverview } from '@/types/dashboardOverview';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch dashboard overview statistics
 */
export async function getDashboardOverview(): Promise<DashboardOverview> {
  const res = await fetch(`${API_URL}/admin/dashboard/overview`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store', // Always fetch fresh data
  });

  const json = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch dashboard overview');
  }

  return json.data;
}
