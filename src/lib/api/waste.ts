import { WasteTypes } from '@/types/wasteType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getWasteList(): Promise<WasteTypes[]> {
  const res = await fetch(`${API_URL}/waste-types`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch waste data');
  }

  return data.data;
}

export async function getWasteById(id: string | number): Promise<WasteTypes> {
  const res = await fetch(`${API_URL}/waste-types/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch waste data by ID');
  }

  return data.data;
}

export async function createWaste(payload: Omit<WasteTypes, 'id'>) {
  const res = await fetch(`${API_URL}/waste-types`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create waste data');
  }

  return data.data;
}

export async function updateWaste(id: string, payload: Partial<WasteTypes>) {
  const res = await fetch(`${API_URL}/waste-types/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update waste data');
  }

  return data.data;
}

export async function deleteWaste(id: string) {
  const res = await fetch(`${API_URL}/waste-types/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete waste data');
  }

  return data.data;
}
