import { FuelPriceTypes } from '@/types/fuelPriceType';
import { getFuelProducts } from './fuelProduct';
import { FuelPriceWithProductName } from '@/types/fuelPriceType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get All Fuel Prices
export async function getFuelPrices(): Promise<FuelPriceTypes[]> {
  const res = await fetch(`${API_URL}/fuel-prices`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch fuel prices');
  }

  return data.data;
}

export async function getFuelPricesWithProductName(): Promise<FuelPriceWithProductName[]> {
  const [prices, products] = await Promise.all([getFuelPrices(), getFuelProducts()]);

  // gabungkan data berdasarkan fuel_product_id
  const merged = prices.map((price) => {
    const product = products.find((p) => p.id === price.fuel_product_id);
    return {
      ...price,
      product_name: product?.product_name || '-',
      fuel_product: product,
    };
  });

  return merged;
}

// ✅ Get by ID
export async function getFuelPriceById(id: string): Promise<FuelPriceTypes> {
  const res = await fetch(`${API_URL}/fuel-prices/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch fuel price by ID');
  }

  return data.data;
}

// ✅ Create
export async function createFuelPrice(payload: Omit<FuelPriceTypes, 'id'>) {
  const res = await fetch(`${API_URL}/fuel-prices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create fuel price');
  }

  return data.data;
}

// ✅ Update
export async function updateFuelPrice(id: string, payload: Partial<FuelPriceTypes>) {
  const res = await fetch(`${API_URL}/fuel-prices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update fuel price');
  }

  return data.data;
}

// ✅ Delete
export async function deleteFuelPrice(id: string) {
  const res = await fetch(`${API_URL}/fuel-prices/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete fuel price');
  }

  return data.data;
}
