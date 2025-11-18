import type { UserEmission, UserEmissionPagination, UserEmissionFilters, EmissionOverviewItem } from '@/types/userEmissionType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Fetch user emission data dengan filter
 */
export async function getUserEmissions(filters: UserEmissionFilters = {}): Promise<{
  data: UserEmission[];
  pagination: UserEmissionPagination;
}> {
  const params = new URLSearchParams();

  // Filter year
  if (filters.year && filters.year !== 'semua') {
    params.set('year', String(filters.year));
  }

  // Filter month
  if (filters.month && filters.month !== 'semua') {
    params.set('month', String(filters.month));
  }

  // Filter user_type
  if (filters.user_type && filters.user_type !== 'semua') {
    params.set('user_type', filters.user_type);
  }

  // Search
  if (filters.search) {
    params.set('search', filters.search);
  }

  // Pagination
  params.set('page', String(filters.page ?? 1));
  params.set('per_page', String(filters.per_page ?? 10));

  const res = await fetch(`${API_URL}/admin/dashboard/emissions/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch user emissions');
  }

  return {
    data: json.data,
    pagination: json.pagination,
  };
}

/**
 * Fetch emission data untuk satu user berdasarkan user_id
 * Menggunakan filter dari list API (karena kemungkinan tidak ada endpoint detail)
 */
export async function getUserEmissionById(userId: string, filters?: { year?: number | 'semua'; month?: number | 'semua' }): Promise<UserEmission | null> {
  const now = new Date();
  const params = new URLSearchParams();

  // Default ke tahun sekarang jika tidak ada atau 'semua'
  const year = filters?.year && filters.year !== 'semua' ? filters.year : now.getFullYear();

  params.set('year', String(year));

  // Hanya set month jika bukan 'semua'
  if (filters?.month && filters.month !== 'semua') {
    params.set('month', String(filters.month));
  }

  params.set('per_page', '100'); // Ambil banyak data untuk ensure user ditemukan

  const res = await fetch(`${API_URL}/admin/dashboard/emissions/users?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch user emission');
  }

  const userEmission = json.data.find((u: UserEmission) => u.user_id === userId);
  return userEmission || null;
}

/**
 * ✅ Fetch emission overview dengan filter year & month
 */
export async function getEmissionOverview(filters?: { year?: number | 'semua'; month?: number | 'semua' }): Promise<EmissionOverviewItem[]> {
  const params = new URLSearchParams();

  // ✅ Tambahkan filter year & month
  if (filters?.year && filters.year !== 'semua') {
    params.set('year', String(filters.year));
  }

  if (filters?.month && filters.month !== 'semua') {
    params.set('month', String(filters.month));
  }

  const res = await fetch(`${API_URL}/admin/dashboard/emissions/overview?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
    cache: 'no-store',
  });

  const json = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch emission overview');
  }

  return json.data;
}
