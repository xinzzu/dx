import { fetchWithAuth } from '@/lib/api/client';

export interface CreateTransportReportPayload {
  report_date: string; // ISO8601 timestamp
  vehicle_asset_id: string; // UUID of vehicle asset
  total_cost_rp: number; // total cost in IDR
  fuel_product_id?: string;
}

export interface TransportReportResponse {
  id: string;
  user_id?: string;
  report_date: string;
  vehicle_asset_id: string;
  total_cost_rp: number;
  created_at?: string;
}

/**
 * Create a transportation report for the current user.
 * The function uses the project's fetchWit hAuth helper which adds the
 * Authorization header when a token is supplied.
 */
export async function createTransportReport(
  token: string,
  payload: CreateTransportReportPayload
): Promise<TransportReportResponse> {
  return await fetchWithAuth<TransportReportResponse>(
    '/reports/transportation',
    token,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

// Note: prefer named exports (reportsService, createTransportReport) instead of default export
/**
 * Reports Service
 * Service untuk manage laporan emisi karbon
 */

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
  // include transport creation helper for convenience
  async createTransportReport(
    token: string,
    payload: CreateTransportReportPayload
  ): Promise<TransportReportResponse> {
    return await fetchWithAuth<TransportReportResponse>(
      '/reports/transportation',
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },
  /**
   * List transport reports for current user
   */
  async listTransportReports(token: string): Promise<TransportReportResponse[]> {
    return fetchWithAuth<TransportReportResponse[]>('/reports/transportation', token);
  },

  /**
   * Update a transport report by id (if backend supports PUT)
   */
  async updateTransportReport(
    id: string,
    token: string,
    payload: Partial<CreateTransportReportPayload>
  ): Promise<TransportReportResponse> {
    return fetchWithAuth<TransportReportResponse>(`/reports/transportation/${encodeURIComponent(id)}`, token, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
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
  /**
   * Dashboard data for given timeframe. Example timeframe: 'month'
   * Maps directly to backend /reports/dashboard/?timeframe=... endpoint.
   */
  async getDashboard(token: string, timeframe = 'month') {
    return fetchWithAuth<{
      timeframe: string;
      trend_chart: { labels: string[]; data: number[] };
      breakdown_chart: {
        total_kg_co2e: number;
        categories: Array<{
          name: string;
          value_kg_co2e: number;
          percentage: number;
        }>;
      };
    }>(`/reports/dashboard?timeframe=${encodeURIComponent(timeframe)}`, token);
  },
};
