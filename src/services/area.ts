/**
 * Area Service
 * Service untuk mengambil data wilayah (Provinsi, Kabupaten, Kecamatan, Kelurahan)
 * dari API Backend dengan cascading relationship
 */

import { fetchWithAuth } from '@/lib/api/client';

// === Type Definitions ===

export interface Province {
  Code: string;
  Name: string;
}

export interface Regency {
  Code: string;
  Name: string;
  ProvinceCode: string;
}

export interface District {
  Code: string;
  Name: string;
  RegencyCode: string;
}

export interface Village {
  Code: string;
  Name: string;
  DistrictCode: string;
}

// === Area Service ===

export const areaService = {
  /**
   * Get all provinces in Indonesia
   * @param token - Authentication token
   * @returns Array of provinces
   */
  async getProvinces(token?: string | null): Promise<Province[]> {
    return fetchWithAuth<Province[]>('/area/provinces', token);
  },

  /**
   * Get regencies (kabupaten/kota) by province code
   * @param provinceCode - Province code (e.g., "id34" for DIY or "51")
   * @param token - Authentication token
   * @returns Array of regencies
   */
  async getRegencies(provinceCode: string, token?: string | null): Promise<Regency[]> {
    // Fix: API expects "id" prefix. Add it if code is numeric
    const normalizedCode = /^\d+$/.test(provinceCode) ? `id${provinceCode}` : provinceCode;
    if (normalizedCode !== provinceCode) {
      console.log(`🔧 Normalized province code: ${provinceCode} → ${normalizedCode}`);
    }
    
    const result = await fetchWithAuth<Regency[] | null>(`/area/regencies/${normalizedCode}`, token);
    return result || []; // Return empty array if null
  },

  /**
   * Get districts (kecamatan) by regency code
   * @param regencyCode - Regency code (e.g., "id3402" for Bantul or "5102")
   * @param token - Authentication token
   * @returns Array of districts
   */
  async getDistricts(regencyCode: string, token?: string | null): Promise<District[]> {
    // Fix: API expects "id" prefix. Add it if code is numeric
    const normalizedCode = /^\d+$/.test(regencyCode) ? `id${regencyCode}` : regencyCode;
    if (normalizedCode !== regencyCode) {
      console.log(`🔧 Normalized regency code: ${regencyCode} → ${normalizedCode}`);
    }
    
    const result = await fetchWithAuth<District[] | null>(`/area/districts/${normalizedCode}`, token);
    return result || []; // Return empty array if null
  },

  /**
   * Get villages (kelurahan/desa) by district code
   * @param districtCode - District code (e.g., "id3402130" for Banguntapan or "5102040")
   * @param token - Authentication token
   * @returns Array of villages
   */
  async getVillages(districtCode: string, token?: string | null): Promise<Village[]> {
    let normalizedCode = districtCode;
    
    // Fix 1: API expects "id" prefix. Add it if code is numeric
    if (/^\d+$/.test(normalizedCode)) {
      normalizedCode = `id${normalizedCode}`;
    }
    
    // Fix 2: Backend may save 7-digit district code but API expects 8-digit
    // Convert "id5102040" to "id51020400" or "5102040" to "id51020400"
    if (/^id\d{7}$/.test(normalizedCode)) {
      normalizedCode = normalizedCode + '0';
    }
    
    if (normalizedCode !== districtCode) {
      console.log(`🔧 Normalized district code: ${districtCode} → ${normalizedCode}`);
    }
    
    const result = await fetchWithAuth<Village[] | null>(`/area/villages/${normalizedCode}`, token);
    return result || []; // Return empty array if null
  },
};
