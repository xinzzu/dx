import { ElectricityCategoryTypes } from '@/types/electricityCategoryType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get All
export async function getElectricityCategories(): Promise<ElectricityCategoryTypes[]> {
  const res = await fetch(`${API_URL}/electricity-tariff-categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch electricity category');
  }

  return data.data;
}

// ✅ Get by ID
export async function getElectricityCategoryById(id: string): Promise<ElectricityCategoryTypes> {
  const res = await fetch(`${API_URL}/electricity-tariff-categories/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch electricity category by ID');
  }

  return data.data;
}

// ✅ Create
export async function createElectricityCategory(payload: Omit<ElectricityCategoryTypes, 'id'>) {
  const res = await fetch(`${API_URL}/electricity-tariff-categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create fuel electricity category');
  }

  return data.data;
}

// ✅ Update
export async function updateElectricityCategory(id: string, payload: Partial<ElectricityCategoryTypes>) {
  const res = await fetch(`${API_URL}/electricity-tariff-categories/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update electricity category');
  }

  return data.data;
}

// ✅ Delete
export async function deleteElectricityCategory(id: string) {
  const res = await fetch(`${API_URL}/electricity-tariff-categories/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete electricity category');
  }

  return data.data;
}
