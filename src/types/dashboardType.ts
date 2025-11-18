// types/dashboardType.ts

export interface CategoryDistribution {
  category: string;
  percentage: number;
  total_kgco2e: number;
}

export interface OverviewCard {
  comparison_percent: number;
  status: 'increase' | 'decrease' | 'same';
  value_tons?: number;
  value_count?: number;
  value_tons_per_month?: number;
  value_name?: string;
  percentage?: number;
}

export interface OverviewCards {
  avg_emisi_provinsi: OverviewCard;
  kategori_dominan: OverviewCard;
  total_emisi: OverviewCard;
  total_pengguna: OverviewCard;
}

export interface TopProvince {
  province: string;
  total_kgco2e: number;
}

export interface DashboardMainOverview {
  category_distribution: CategoryDistribution[];
  overview_cards: OverviewCards;
  top_provinces: TopProvince[];
}

export interface DashboardFilters {
  year?: number | 'semua';
  month?: number | 'semua';
  user_type?: 'individu' | 'lembaga' | 'semua';
  provinces?: string[]; // ✅ Array of province codes (e.g., ["id33", "id34"])
}

// ✅ Tambahkan type untuk National Trend
export interface NationalTrendDataset {
  name: string;
  data: number[]; // 12 bulan (Jan - Des)
}

export interface NationalTrend {
  labels: string[]; // ["Januari", "Februari", ...]
  datasets: NationalTrendDataset[];
}
