export type EmissionType = 'Individu' | 'Lembaga';

export interface EmissionRecord {
  id: string;
  name: string;
  type: EmissionType;
  emission: string;
  emission_avg: string;
  address: string;
  date: string;
}
