// Transportation Report
export interface TransportationReport {
  report_date: string; // ISO date string
  asset_name: string;
  total_cost_rp: number;
  estimasi_liter: number;
  total_co2e: number;
}

// Electricity Report
export interface ElectricityReport {
  report_date: string;
  asset_name: string;
  total_cost_rp: number;
  consumed_grid_kwh: number;
  total_co2e: number;
  renewable_energy?: {
    type: string;
    energy_produced: number;
  };
}

// Food Report
export interface FoodReportItem {
  frequency: string;
  name: string;
}

export interface FoodReport {
  report_date: string;
  periode_laporan: string; // "Weekly" | "Monthly"
  total_co2e_for_this_report: number;
  items: FoodReportItem[];
}

// Waste Report
export interface WasteReportItem {
  name: string;
  weight_kg: number;
}

export interface WasteReport {
  report_date: string;
  periode_laporan: string;
  total_co2e_for_this_report: number;
  items: WasteReportItem[];
}

// Monthly Report Data
export interface MonthlyReportData {
  total_emisi_kgco2e: number;
  transportation_reports: TransportationReport[];
  electricity_reports: ElectricityReport[];
  food_reports: FoodReport[];
  waste_reports: WasteReport[];
}

// API Response
export interface MonthlyReportResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: MonthlyReportData;
}
