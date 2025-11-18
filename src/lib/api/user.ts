import type { UserTypes, UserFilters, UserListResponse } from '@/types/userType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * ✅ Fetch user list dengan pagination & filters
 */
export async function getUserList(filters: UserFilters = {}): Promise<{
  data: UserTypes[];
  pagination: UserListResponse['pagination'];
}> {
  const { page = 1, per_page = 10, user_type, search } = filters; // ✅ Ganti 'name' jadi 'search'

  // ✅ Build query params
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(per_page),
  });

  if (user_type && user_type !== 'semua') {
    params.set('user_type', user_type);
  }

  if (search && search.trim()) {
    params.set('search', search.trim()); // ✅ Ganti 'name' jadi 'search'
  }

  const url = `${API_URL}/admin/users?${params.toString()}`;
  console.log('🔍 Fetching users:', url);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: UserListResponse = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch user data');
  }

  return {
    data: json.data,
    pagination: json.pagination,
  };
}

/**
 * ✅ Fetch user by ID
 */
export async function getUserById(id: string): Promise<UserTypes> {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json = await res.json();

  if (!res.ok || !json.meta?.success) {
    throw new Error(json.meta?.message || 'Failed to fetch user detail');
  }

  return json.data;
}
