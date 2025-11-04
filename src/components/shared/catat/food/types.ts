export type Unit = "kg" | "g"

export interface WasteCategoryDef {
  id: string
  label: string
  hint?: string
}

export interface WasteItemState {
  amount: string  // string agar input number tetap controlled ("" | "0.5" | ...)
  unit: Unit
}

export const toKg = (amount: string, unit: Unit) => {
  const v = parseFloat(amount || "0")
  if (Number.isNaN(v)) return 0
  return unit === "kg" ? v : v / 1000
}
