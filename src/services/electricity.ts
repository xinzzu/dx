/**
 * Electricity Service
 * Service untuk manage tarif listrik PLN
 */

import { fetchWithAuth } from '@/lib/api/client';

// === Type Definitions ===

export interface ElectricityCategory {
  id: string;
  category_name: string;
  active: boolean;
}

export interface ElectricityTariff {
  id: string;
  category_id: string;
  power_capacity_label: string;
  min_power_va: number;
  max_power_va: number | null;
  rate_per_kwh: number;
  active: boolean;
}

export interface PaginatedResponse<T> {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: T[];
  pagination: {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
    has_previous: boolean;
    has_next: boolean;
    first_page: number;
    last_page: number;
  };
  links: {
    self: string;
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
}

// === Electricity Service ===

export const electricityService = {
  /**
   * Get all electricity tariff categories
   * @param token - Authentication token
   * @returns List of categories
   */
  async getCategories(token: string): Promise<ElectricityCategory[]> {
    // fetchWithAuth already unwraps json.data, so we get the array directly
    return await fetchWithAuth<ElectricityCategory[]>(
      '/electricity-tariff-categories?per_page=100',
      token
    );
  },

  /**
   * Get electricity tariffs by category
   * @param categoryId - Category ID to filter
   * @param token - Authentication token
   * @returns List of tariffs for the category
   */
  async getTariffsByCategory(
    categoryId: string,
    token: string
  ): Promise<ElectricityTariff[]> {
    // fetchWithAuth already unwraps json.data, so we get the array directly
    return await fetchWithAuth<ElectricityTariff[]>(
      `/electricity-tariffs?category_id=${categoryId}&per_page=100`,
      token
    );
  },

  /**
   * Get all electricity tariffs
   * @param token - Authentication token
   * @returns List of all tariffs
   */
  async getAllTariffs(token: string): Promise<ElectricityTariff[]> {
    // fetchWithAuth already unwraps json.data, so we get the array directly
    return await fetchWithAuth<ElectricityTariff[]>(
      '/electricity-tariffs?per_page=100',
      token
    );
  },
  /**
   * List electricity reports for current user
   * @param token - Authentication token
   */
  async listReports(token: string | null) {
    return fetchWithAuth<Array<Record<string, unknown>>>("/me/reports/electricity", token, { method: "GET" });
  },

  /**
   * Delete an electricity report by id
   * @param reportId - Report identifier
   * @param token - Authentication token
   */
  async deleteReport(reportId: string, token: string | null) {
    return fetchWithAuth<unknown>(`/me/reports/electricity/${encodeURIComponent(reportId)}`, token, {
      method: "DELETE",
    });
  },
};
