export type UserEmissionType = 'Individu' | 'Lembaga';

export interface UserEmission {
  user_id: string;
  name: string;
  user_type: UserEmissionType;
  total_emisi_tons: number;
  avg_monthly_emisi_tons: number;
  detailUrl?: string;
}

export interface UserEmissionPagination {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  has_previous: boolean;
  has_next: boolean;
  first_page: number;
  last_page: number;
}

export interface UserEmissionLinks {
  self: string | null;
  first: string | null;
  last: string | null;
  next: string | null;
  prev: string | null;
}

export interface UserEmissionResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: UserEmission[];
  pagination: UserEmissionPagination;
  links: UserEmissionLinks;
}

export interface UserEmissionFilters {
  year?: number | 'semua';
  month?: number | 'semua';
  user_type?: 'individu' | 'lembaga' | 'semua';
  search?: string;
  page?: number;
  per_page?: number;
}

export interface EmissionOverviewItem {
  category: string;
  comparison_percent: number;
  status: 'increase' | 'decrease' | 'same';
  total_tons: number;
}

export interface EmissionOverview {
  data: EmissionOverviewItem[];
}
