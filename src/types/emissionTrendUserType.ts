export interface EmissionTrendDataset {
  name: string;
  data: number[]; // 12 months data
}

export interface EmissionTrendData {
  datasets: EmissionTrendDataset[];
  labels: string[]; // ["Jan", "Feb", ..., "Des"]
}

export interface EmissionTrendResponse {
  reqId: string;
  meta: {
    success: boolean;
    message: string;
  };
  data: EmissionTrendData;
}
