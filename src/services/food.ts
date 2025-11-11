// src/services/food.ts (baru, clean)
// ==============================
import { fetchWithAuth } from "@/lib/api/client";


export type FrequencyKey = "1-3-weekly" | "3-5-weekly";
export type FoodType = { id: string; name: string };
export type FoodReportItem = { food_type_id: string; frequency_key: FrequencyKey };


/** Ambil daftar jenis makanan (hanya id & name yang dipakai di UI) */
export async function listFoodTypes(token?: string | null): Promise<FoodType[]> {
const rows = await fetchWithAuth<Array<{ id: string; name: string }>>("/food-types", token);
return rows.map((x) => ({ id: x.id, name: x.name }));
}


/** Buat laporan konsumsi makanan */
export type FoodReportRequest = {
	report_date: string;
	report_type: "weekly" | "monthly";
	items: FoodReportItem[];
};

export async function createFoodReport(
	payload: FoodReportRequest,
	token?: string | null
) {
	return fetchWithAuth<unknown>("/reports/food", token, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}


export const FREQUENCY_OPTIONS: Array<{ key: FrequencyKey; label: string }> = [
{ key: "1-3-weekly", label: "1–3x per minggu" },
{ key: "3-5-weekly", label: "3–5x per minggu" },
];