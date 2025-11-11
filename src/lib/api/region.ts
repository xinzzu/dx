import { Province, Regency, District, Village } from '@/types/locationTypes';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function getAuthHeader(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Cache untuk menyimpan hasil fetch agar tidak perlu request ulang
const cache = {
  provinces: null as Record<string, string> | null,
  regencies: new Map<string, Record<string, string>>(), // key: provinceCode
  districts: new Map<string, Record<string, string>>(), // key: regencyCode
  villages: new Map<string, Record<string, string>>(), // key: districtCode
};

// ==============================
// 🏙️ PROVINSI
// ==============================
export async function getProvinces(): Promise<Record<string, string>> {
  if (cache.provinces) return cache.provinces;

  const res = await fetch(`${API_URL}/area/provinces`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: { data: Province[]; meta?: { success: boolean; message?: string } } = await res.json();

  if (!res.ok || !json.data) {
    throw new Error(json.meta?.message || 'Failed to fetch provinces');
  }

  const map = json.data.reduce((acc: Record<string, string>, p: Province) => {
    acc[p.Code] = p.Name;
    return acc;
  }, {});

  cache.provinces = map;
  return map;
}

export async function getProvinceName(code: string): Promise<string> {
  const provinces = await getProvinces();
  return provinces[code] || '-';
}

// ==============================
// 🏡 KABUPATEN / KOTA
// ==============================
export async function getRegencies(provinceCode: string): Promise<Record<string, string>> {
  if (cache.regencies.has(provinceCode)) {
    return cache.regencies.get(provinceCode)!;
  }

  const res = await fetch(`${API_URL}/area/regencies/${provinceCode}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: { data: Regency[]; meta?: { success: boolean; message?: string } } = await res.json();

  if (!res.ok || !json.data) {
    throw new Error(json.meta?.message || 'Failed to fetch regencies');
  }

  const map = json.data.reduce((acc: Record<string, string>, r: Regency) => {
    acc[r.Code] = r.Name;
    return acc;
  }, {});

  cache.regencies.set(provinceCode, map);
  return map;
}

export async function getRegencyName(code: string, provinceCode: string): Promise<string> {
  const regencies = await getRegencies(provinceCode);
  return regencies[code] || '-';
}

// ==============================
// 🏘️ KECAMATAN
// ==============================
export async function getDistricts(regencyCode: string): Promise<Record<string, string>> {
  if (cache.districts.has(regencyCode)) {
    return cache.districts.get(regencyCode)!;
  }

  const res = await fetch(`${API_URL}/area/districts/${regencyCode}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: { data: District[]; meta?: { success: boolean; message?: string } } = await res.json();

  if (!res.ok || !json.data) {
    throw new Error(json.meta?.message || 'Failed to fetch districts');
  }

  const map = json.data.reduce((acc: Record<string, string>, d: District) => {
    acc[d.Code] = d.Name;
    return acc;
  }, {});

  cache.districts.set(regencyCode, map);
  return map;
}

export async function getDistrictName(code: string, regencyCode: string): Promise<string> {
  const districts = await getDistricts(regencyCode);
  return districts[code] || '-';
}

// ==============================
// 🏠 KELURAHAN / DESA
// ==============================
export async function getVillages(districtCode: string): Promise<Record<string, string>> {
  if (cache.villages.has(districtCode)) {
    return cache.villages.get(districtCode)!;
  }

  const res = await fetch(`${API_URL}/area/villages/${districtCode}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
    },
  });

  const json: { data: Village[]; meta?: { success: boolean; message?: string } } = await res.json();

  if (!res.ok || !json.data) {
    throw new Error(json.meta?.message || 'Failed to fetch villages');
  }

  const map = json.data.reduce((acc: Record<string, string>, v: Village) => {
    acc[v.Code] = v.Name;
    return acc;
  }, {});

  cache.villages.set(districtCode, map);
  return map;
}

export async function getVillageName(code: string, districtCode: string): Promise<string> {
  const villages = await getVillages(districtCode);
  return villages[code] || '-';
}
