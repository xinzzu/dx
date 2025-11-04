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
   * @param provinceCode - Province code (e.g., "id34" for DIY)
   * @param token - Authentication token
   * @returns Array of regencies
   */
  async getRegencies(provinceCode: string, token?: string | null): Promise<Regency[]> {
    return fetchWithAuth<Regency[]>(`/area/regencies/${provinceCode}`, token);
  },

  /**
   * Get districts (kecamatan) by regency code
   * @param regencyCode - Regency code (e.g., "id3402" for Bantul)
   * @param token - Authentication token
   * @returns Array of districts
   */
  async getDistricts(regencyCode: string, token?: string | null): Promise<District[]> {
    return fetchWithAuth<District[]>(`/area/districts/${regencyCode}`, token);
  },

  /**
   * Get villages (kelurahan/desa) by district code
   * @param districtCode - District code (e.g., "id3402130" for Banguntapan)
   * @param token - Authentication token
   * @returns Array of villages
   */
  async getVillages(districtCode: string, token?: string | null): Promise<Village[]> {
    return fetchWithAuth<Village[]>(`/area/villages/${districtCode}`, token);
  },
};
