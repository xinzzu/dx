/**
 * Vehicle Service
 * Service untuk manage vehicle emission factors
 */

import { fetchWithAuth } from '@/lib/api/client';

// === Type Definitions ===

export interface VehicleEmissionFactor {
  id: string;
  vehicle_type: string; // "Mobil", "Motor", "Bus", "Truk"
  fuel_type: string; // "Bensin", "Solar", "Listrik"
  capacity_range_label: string; // "<1400cc", "1400-2000cc", ">2000cc", "-"
  default_km_per_liter?: number;
  default_kwh_per_km?: number;
  g_co2e_per_km: number;
  active: boolean;
}

// Fuel product returned by backend
export interface FuelProduct {
  id: string;
  product_name: string;
  fuel_type: string;
  unit?: string;
  active?: boolean;
  [key: string]: unknown;
}

// === Vehicle Service ===

export const vehicleService = {
  /**
   * Get all vehicle emission factors
   * @param token - Authentication token
   * @returns List of vehicle emission factors
   */
  async getAllFactors(token: string): Promise<VehicleEmissionFactor[]> {
    return await fetchWithAuth<VehicleEmissionFactor[]>(
      '/vehicle-emission-factors?per_page=100',
      token
    );
  },

  /**
   * Get vehicle emission factors by vehicle type
   * @param vehicleType - Vehicle type to filter ("Mobil", "Motor", "Bus", "Truk")
   * @param token - Authentication token
   * @returns List of emission factors for the vehicle type
   */
  async getFactorsByVehicleType(
    vehicleType: string,
    token: string
  ): Promise<VehicleEmissionFactor[]> {
    const allFactors = await this.getAllFactors(token);
    return allFactors.filter((f) => f.vehicle_type === vehicleType);
  },

  /**
   * Get unique vehicle types
   * @param token - Authentication token
   * @returns List of unique vehicle types
   */
  async getVehicleTypes(token: string): Promise<string[]> {
    const allFactors = await this.getAllFactors(token);
    const types = [...new Set(allFactors.map((f) => f.vehicle_type))];
    return types.sort();
  },

  /**
   * Get unique capacity ranges for a vehicle type
   * @param vehicleType - Vehicle type
   * @param token - Authentication token
   * @returns List of unique capacity ranges
   */
  async getCapacityRanges(
    vehicleType: string,
    token: string
  ): Promise<string[]> {
    const factors = await this.getFactorsByVehicleType(vehicleType, token);
    const ranges = [...new Set(factors.map((f) => f.capacity_range_label))];
    return ranges;
  },

  /**
   * Get fuel types for a vehicle type and capacity range
   * @param vehicleType - Vehicle type
   * @param capacityRange - Capacity range
   * @param token - Authentication token
   * @returns List of fuel types with their emission factor IDs
   */
  async getFuelTypes(
    vehicleType: string,
    capacityRange: string,
    token: string
  ): Promise<Array<{ id: string; fuelType: string; factor: VehicleEmissionFactor }>> {
    const factors = await this.getFactorsByVehicleType(vehicleType, token);
    return factors
      .filter((f) => f.capacity_range_label === capacityRange)
      .map((f) => ({
        id: f.id,
        fuelType: f.fuel_type,
        factor: f,
      }));
  },

  /**
   * Get emission factor by ID
   * @param factorId - Emission factor ID
   * @param token - Authentication token
   * @returns Emission factor details
   */
  async getFactorById(
    factorId: string,
    token: string
  ): Promise<VehicleEmissionFactor | undefined> {
    const allFactors = await this.getAllFactors(token);
    return allFactors.find((f) => f.id === factorId);
  },

  /**
   * Get vehicle fuel products from backend
   * @param token - Authentication token
   * @returns Array of fuel product objects
   */
  async getFuelProducts(token: string): Promise<FuelProduct[]> {
    // Backend provides /vehicle-fuel-products
    return await fetchWithAuth<FuelProduct[]>(`/vehicle-fuel-products`, token);
  },
};
