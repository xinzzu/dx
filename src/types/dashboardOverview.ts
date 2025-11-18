export interface DashboardOverview {
  total_user: number;
  total_individual_user: number;
  total_institution_user: number;
  total_emissions: number;
}

export interface DashboardOverviewResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: DashboardOverview;
}
