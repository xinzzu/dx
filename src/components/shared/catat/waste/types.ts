// src/components/shared/catat/waste/types.ts
// Unit used in waste inputs. We support kg and g in the UI.
export type Unit = "kg" | "g";
// Backwards-compatible alias
export type WasteUnit = Unit;

export type WasteCategoryDef = {
  id: string;                // id lokal utk UI
  label: string;
  hint?: string;
  wasteTypeId?: string;      // ← UUID dari BE (wajib utk submit ke BE)
};

export type WasteItemInput = {
  category_id: string;       // id lokal
  quantity: number;
  unit: Unit;           // unit (kg or g)
};

export type WasteReportPayload = {
  report_date: string;       // "YYYY-MM-DD"
  period: "weekly" | "monthly";
  items: WasteItemInput[];
};

/** Convert input amount (string or number-like) and unit to kilograms. */
export const toKg = (amount: string | number, unit: Unit) => {
  const v = typeof amount === 'number' ? amount : parseFloat(String(amount || "0"));
  if (Number.isNaN(v)) return 0;
  return unit === 'kg' ? v : v / 1000;
};
