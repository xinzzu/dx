import { GridEmissionTypes } from '@/types/gridEmissionType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get All grid emission factor
export async function getGridEmissionFactors(): Promise<GridEmissionTypes[]> {
  const res = await fetch(`${API_URL}/grid-emission-factors`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch grid emission factors');
  }

  return data.data;
}

// ✅ Get by ID
export async function getGridEmissionFactorById(id: string): Promise<GridEmissionTypes> {
  const res = await fetch(`${API_URL}/grid-emission-factors/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch grid emission factor by ID');
  }

  return data.data;
}

// ✅ Create
export async function createGridEmissionFactor(payload: Omit<GridEmissionTypes, 'id'>) {
  const res = await fetch(`${API_URL}/grid-emission-factors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create grid emission factor');
  }

  return data.data;
}

// ✅ Update
export async function updateGridEmissionFactor(id: string, payload: Partial<GridEmissionTypes>) {
  const res = await fetch(`${API_URL}/grid-emission-factors/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update grid emission factor');
  }

  return data.data;
}

// ✅ Delete
export async function deleteGridEmissionFactor(id: string) {
  const res = await fetch(`${API_URL}/grid-emission-factors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete grid emission factor');
  }

  return data.data;
}
