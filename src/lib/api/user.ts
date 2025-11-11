import { UserTypes, UserWithRegion } from '@/types/userType';
import { getProvinceName, getRegencyName, getDistrictName, getVillageName } from './region';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ==============================
// 👥 Ambil user dengan pagination
// ==============================
export async function getUserList(
  page = 1,
  perPage = 10
): Promise<{
  data: UserTypes[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
    has_previous: boolean;
    has_next: boolean;
  };
}> {
  const res = await fetch(`${API_URL}/admin/users?page=${page}&per_page=${perPage}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch user data');
  }

  return {
    data: data.data,
    pagination: data.pagination,
  };
}

// ==============================
// 👤 Ambil user berdasarkan ID
// ==============================
export async function getUserById(id: string): Promise<UserTypes> {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch user detail');
  }

  return data.data;
}

// ==============================
// 🌍 Gabungkan data user + wilayah (nama lengkap)
// ==============================
export async function enrichUserWithRegion(user: UserTypes): Promise<UserWithRegion> {
  const [provinceName, cityName, districtName, subDistrictName] = await Promise.all([
    user.province ? getProvinceName(user.province) : Promise.resolve('-'),
    user.city ? getRegencyName(user.city, user.province) : Promise.resolve('-'),
    user.district ? getDistrictName(user.district, user.city) : Promise.resolve('-'),
    user.sub_district ? getVillageName(user.sub_district, user.district) : Promise.resolve('-'),
  ]);

  return {
    ...user,
    province_name: provinceName,
    city_name: cityName,
    district_name: districtName,
    sub_district_name: subDistrictName,
  };
}
