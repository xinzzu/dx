export interface FoodTypes {
  id: string;
  name: string;
  unit: string;
  co2e_per_unit: number;
  average_serving_size_g: number;
  active?: boolean;
}
