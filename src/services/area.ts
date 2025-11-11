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
    // Build a list of candidate codes to try, ordered by most-likely
    const candidates: string[] = [];

    // Raw input first
    candidates.push(districtCode);

    // If purely numeric, try prefixing with 'id'
    if (/^\d+$/.test(districtCode)) {
      candidates.push(`id${districtCode}`);
    }

    // If starts with 'id' and has 7 digits after, try appending a trailing zero (7->8)
    if (/^id\d{7}$/.test(districtCode)) {
      candidates.push(districtCode + '0');
    }

    // If numeric 7-digit, try appending a zero and prefixed variants
    if (/^\d{7}$/.test(districtCode)) {
      candidates.push(districtCode + '0');
      candidates.push(`id${districtCode}0`);
    }

    // If starts with id + 8 digits, also try the version without trailing zero
    if (/^id\d{8}$/.test(districtCode)) {
      candidates.push(districtCode.slice(0, -1));
      candidates.push(districtCode.replace(/^id/, ''));
    }

    // If starts with 'id', also try raw numeric without prefix
    if (/^id\d+$/.test(districtCode)) {
      candidates.push(districtCode.replace(/^id/, ''));
    }

    // Dedupe while preserving order
    const uniqueCandidates = Array.from(new Set(candidates));

    // Try each candidate until we get a non-empty response
    for (const cand of uniqueCandidates) {
      try {
        if (cand !== districtCode) {
          console.log(`🔧 Trying village lookup with candidate: ${districtCode} -> ${cand}`);
        } else {
          console.log(`🔎 Loading villages for district code: ${cand}`);
        }
        const result = await fetchWithAuth<Village[] | null>(`/area/villages/${cand}`, token);
        const arr = result || [];
        console.log(`🔁 Received ${arr.length} villages for code ${cand}`);
        if (arr.length > 0) return arr;
      } catch (err) {
        console.warn(`Request for /area/villages/${cand} failed:`, err);
      }
    }

    // Nothing worked — return empty array
    return [];
  },
};
