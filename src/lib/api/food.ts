import { FoodTypes } from '@/types/foodType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getFoodList(): Promise<FoodTypes[]> {
  const res = await fetch(`${API_URL}/food-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch food data');
  }

  return data.data;
}

export async function getFoodById(id: string | number): Promise<FoodTypes> {
  const res = await fetch(`${API_URL}/food-types/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch food data by ID');
  }

  return data.data;
}

export async function createFood(payload: Omit<FoodTypes, 'id'>) {
  const res = await fetch(`${API_URL}/food-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create food data');
  }

  return data.data;
}

export async function updateFood(id: string, payload: Partial<FoodTypes>) {
  const res = await fetch(`${API_URL}/food-types/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update food data');
  }

  return data.data;
}

export async function deleteFood(id: string) {
  const res = await fetch(`${API_URL}/food-types/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete food data');
  }

  return data.data;
}
