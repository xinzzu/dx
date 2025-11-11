export type Accent = "blue" | "orange" | "red" | "green" | "gray";

export type CategoryStat = {
  id: string;
  name: string;
  href: string;
  valueKg: number;
  accent: Accent;
  iconSrc: string;
};

export type MonthReport = {
  id: string;
  monthLabel: string;       // "September 2025"
  periodLabel: string;      // "Laporan Bulanan"
  progressPercent: number;  // 15
  totalEmisiKg: number;     // 1250
  penguranganKg: number;    // 25.6
  // 'increase' | 'decrease' | 'equal' to indicate direction compared to previous month
  comparisonStatus?: "increase" | "decrease" | "equal" | null;
  categories: CategoryStat[];
};
