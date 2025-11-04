/**
 * Reports Service
 * Service untuk manage laporan emisi karbon
 */

import { fetchWithAuth } from '@/lib/api/client';

// === Type Definitions ===

export interface ElectricityReportPayload {
  report_date: string; // YYYY-MM-DD
  building_asset_id: string;
  total_cost_rp: number;
}

export interface ElectricityReportResponse {
  id: string;
  user_id: string;
  building_asset_id: string;
  report_date: string;
  total_cost_rp: number;
  total_kwh: number;
  emission_kgco2e: number;
  created_at: string;
  updated_at: string;
}

export interface CarbonFootprintCurrent {
  current_month_total_kgco2e: number;
  previous_month_total_kgco2e: number;
  comparison: {
    difference_kgco2e: number;
    difference_percent: number | null;
    status: 'increase' | 'decrease' | 'same';
  };
}

// === Reports Service ===

export const reportsService = {
  /**
   * Submit electricity report
   * @param payload - Electricity report data
   * @param token - Authentication token
   * @returns Created report data
   */
  async submitElectricityReport(
    payload: ElectricityReportPayload,
    token: string
  ): Promise<ElectricityReportResponse> {
    return fetchWithAuth<ElectricityReportResponse>('/reports/electricity', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Get current month carbon footprint
   * @param token - Authentication token
   * @returns Carbon footprint data for current month
   */
  async getCurrentCarbonFootprint(token: string): Promise<CarbonFootprintCurrent> {
    return fetchWithAuth<CarbonFootprintCurrent>(
      '/reports/carbon-footprint/current',
      token
    );
  },
};
