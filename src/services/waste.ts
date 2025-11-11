import { fetchWithAuth } from "@/lib/api/client";

export type WasteType = {
  id: string;       // UUID dari BE
  name: string;     // mis. "Plastik"
  active?: boolean;
};

export type WasteReportRequest = {
  report_date: string; // "YYYY-MM-DD"
  report_type: "weekly" | "monthly";
  items: Array<{
    waste_type_id: string;
    total_weight_kg: number;
  }>;
};

export type WasteReportResponse = {
  report_date: string;
  report_type: "weekly" | "monthly";
  items: Array<{
    waste_type_id: string;
    total_weight_kg: number;
    total_co2e: number;
  }>;
  total_co2e: number;
};

async function listWasteTypes(token: string | null): Promise<WasteType[]> {
  return fetchWithAuth<WasteType[]>("/waste-types", token, { method: "GET" });
}

async function createReport(
  payload: WasteReportRequest,
  token: string | null
): Promise<WasteReportResponse> {
  return fetchWithAuth<WasteReportResponse>("/reports/waste", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export const wasteService = {
  listWasteTypes,
  createReport,
};
