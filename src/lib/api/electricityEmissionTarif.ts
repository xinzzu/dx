import { ElectricityEmissionTarifTypes, ElectricityEmissionTarifWithCategoryName } from '@/types/electricityEmissionTarif';
import { getElectricityCategories } from '@/lib/api/electricityCategory';
import { ElectricityCategoryTypes } from '@/types/electricityCategoryType';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ✅ Get Electricity Emission Tariffs with Pagination
export async function getElectricityEmissionTariffs(
  page: number = 1,
  per_page: number = 10
): Promise<{
  data: ElectricityEmissionTarifTypes[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}> {
  const res = await fetch(`${API_URL}/electricity-tariffs?page=${page}&per_page=${per_page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const response = await res.json();

  if (!res.ok || !response.meta?.success) {
    throw new Error(response.meta?.message || 'Failed to fetch Electricity Emission Tariffs');
  }

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
export async function getElectricityEmissionTariffById(id: string): Promise<ElectricityEmissionTarifTypes> {
  const res = await fetch(`${API_URL}/electricity-tariffs/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to fetch Electricity Emission Tarif by ID');
  }

  return data.data;
}

// ✅ Create
export async function createElectricityEmissionTariff(payload: Omit<ElectricityEmissionTarifTypes, 'id'>) {
  const res = await fetch(`${API_URL}/electricity-tariffs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to create Electricity Emission Tarif');
  }

  return data.data;
}

// ✅ Update
export async function updateElectricityEmissionTariff(id: string, payload: Partial<ElectricityEmissionTarifTypes>) {
  const res = await fetch(`${API_URL}/electricity-tariffs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to update Electricity Emission Tarif');
  }

  return data.data;
}

// ✅ Delete
export async function deleteElectricityEmissionTariff(id: string) {
  const res = await fetch(`${API_URL}/electricity-tariffs/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    } as HeadersInit,
  });

  const data = await res.json();

  if (!res.ok || !data.meta?.success) {
    throw new Error(data.meta?.message || 'Failed to delete Electricity Emission Tarif');
  }

  return data.data;
}

export async function getElectricityEmissionTariffsWithCategoryName(
  page: number = 1,
  per_page: number = 10
): Promise<{
  data: ElectricityEmissionTarifWithCategoryName[];
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}> {
  // Ambil data tarif berdasarkan pagination
  const { data: tariffs, meta } = await getElectricityEmissionTariffs(page, per_page);
  const categories = await getElectricityCategories();

  // Gabungkan berdasarkan category_id
  const combined = tariffs.map((tarif) => {
    const category = categories.find((cat: ElectricityCategoryTypes) => cat.id === tarif.category_id);
    return {
      ...tarif,
      category_name: category?.category_name ?? '-',
    };
  });

  return {
    data: combined,
    meta,
  };
}
