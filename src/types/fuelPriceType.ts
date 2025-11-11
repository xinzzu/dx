import { FuelProductTypes } from './fuelProductTypes';

export interface FuelPriceTypes {
  id: string;
  fuel_product_id: string;
  price_per_unit: number;
  effective_date: string;
  active: boolean;
}

// 👉 Extended type (untuk tabel admin)
export interface FuelPriceWithProductName extends FuelPriceTypes {
  product_name?: string;
  fuel_product?: FuelProductTypes; // optional: kalau kamu mau akses seluruh objek produk
}
