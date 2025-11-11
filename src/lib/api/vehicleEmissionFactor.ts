import { VehicleEmissionFactorTypes } from '@/types/vehicleEmissionFactorTypes';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get Vehicle Emission Factors with Pagination
export async function getVehicleEmissionFactors(
  page: number = 1,
  per_page: number = 10
): Promise<{
  data: VehicleEmissionFactorTypes[];
  meta: { totalItems: number; totalPages: number; currentPage: number };
}> {
  const res = await fetch(`${API_URL}/vehicle-emission-factors?page=${page}&per_page=${per_page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const response = await res.json();

  if (!res.ok || !response.meta?.success) {
    throw new Error(response.meta?.message || 'Failed to fetch Vehicle Emission Factor');
  }

  // Ambil info pagination dari response.pagination
  const pagination = response.pagination || {};
  return {
    data: response.data,
    meta: {
      totalItems: pagination.total_items ?? 0,
      totalPages: pagination.total_pages ?? 1,
      currentPage: pagination.current_page ?? 1,
    },
  };
}

// ✅ Get by ID
export async function getVehicleEmissionFactorById(id: string): Promise<VehicleEmissionFactorTypes> {
  const res = await fetch(`${API_URL}/vehicle-emission-factors/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch Vehicle Emission Factor by ID');
  }

  return data.data;
}

// ✅ Create
export async function createVehicleEmissionFactor(payload: Omit<VehicleEmissionFactorTypes, 'id'>) {
  const res = await fetch(`${API_URL}/vehicle-emission-factors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create Vehicle Emission Factor');
  }

  return data.data;
}

// ✅ Update
export async function updateVehicleEmissionFactor(id: string, payload: Partial<VehicleEmissionFactorTypes>) {
  const res = await fetch(`${API_URL}/vehicle-emission-factors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update Vehicle Emission Factor');
  }

  return data.data;
}

// ✅ Delete
export async function deleteVehicleEmissionFactor(id: string) {
  const res = await fetch(`${API_URL}/vehicle-emission-factors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete Vehicle Emission Factor');
  }

  return data.data;
}
