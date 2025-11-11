import { FuelProductTypes } from '@/types/fuelProductTypes';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get All Fuel Products
export async function getFuelProducts(): Promise<FuelProductTypes[]> {
  const res = await fetch(`${API_URL}/vehicle-fuel-products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch fuel products');
  }

  return data.data;
}

// ✅ Get by ID
export async function getFuelProductById(id: string): Promise<FuelProductTypes> {
  const res = await fetch(`${API_URL}/vehicle-fuel-products/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch fuel product by ID');
  }

  return data.data;
}

// ✅ Create
export async function createFuelProduct(payload: Omit<FuelProductTypes, 'id'>) {
  const res = await fetch(`${API_URL}/vehicle-fuel-products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create fuel product');
  }

  return data.data;
}

// ✅ Update
export async function updateFuelProduct(id: string, payload: Partial<FuelProductTypes>) {
  const res = await fetch(`${API_URL}/vehicle-fuel-products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update fuel product');
  }

  return data.data;
}

// ✅ Delete
export async function deleteFuelProduct(id: string) {
  const res = await fetch(`${API_URL}/vehicle-fuel-products/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete fuel product');
  }

  return data.data;
}
