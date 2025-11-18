import type { MonthlyReportResponse, MonthlyReportData } from '@/types/monthlyReportType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * ✅ Fetch monthly emission reports by user ID
 * @param userId - User ID
 * @param month - Month (1-12), optional
 * @param year - Year (e.g., 2025), optional
 */
export async function getMonthlyReports(userId: string, month?: number, year?: number): Promise<MonthlyReportData> {
  const params = new URLSearchParams();

  if (month) params.set('month', String(month));
  if (year) params.set('year', String(year));

  const queryString = params.toString();
  const url = `${API_URL}/reports/monthly/${userId}${queryString ? `?${queryString}` : ''}`;

  console.log('🔍 Fetching monthly reports:', url);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: MonthlyReportResponse = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch monthly reports');
  }

  return json.data;
}
