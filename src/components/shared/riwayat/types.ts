import * as React from "react"

export type Accent = "orange" | "blue" | "red" | "green" | "gray"

export interface CategoryStat {
  id: string
  name: string
  valueKg: number
  accent: Accent
  iconSrc?: string            // ← icon kategori dari page
}

export interface MonthReport {
  id: string
  monthLabel: string          // ex: "September 2025"
  periodLabel?: string        // ex: "Laporan Bulanan"
  progressPercent?: number    // ex: 15
  totalEmisiKg: number
  penguranganKg: number
  categories: CategoryStat[]
}
