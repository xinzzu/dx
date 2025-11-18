/**
 * Assets Service
 * Service untuk create building dan vehicle assets
 */

import { fetchWithAuth } from '@/lib/api/client';
import type { Building, Vehicle } from '@/stores/assetWizard';

// === Type Definitions ===

export interface BuildingMetadata {
  area_sqm?: number;
  floors?: number;
  construction_year?: number;
  building_type?: string;
  // Electronics inventory can be either a keyed map (legacy) or
  // an array of items { name, qty } (newer flow).
  electronics_inventory?: Record<string, number> | { name: string; qty: number }[]; // { ac_units: 25, computers: 80, ... } or [{ name, qty }]
  facilities?: string[];
}

export interface CreateBuildingPayload {
  name: string; // REQUIRED
  user_id: string; // REQUIRED - Must be provided explicitly
  description?: string;
  electricity_tariff_id: string; // REQUIRED - tariffId from store
  has_renewables?: boolean;
  province_code: string; // REQUIRED - provinsi
  regency_code: string; // REQUIRED - kabKota
  district_code: string; // REQUIRED - kecamatan
  village_code: string; // REQUIRED - kelurahan
  address_label: string; // REQUIRED - label for address
  postal_code?: string;
  full_address: string; // REQUIRED - concatenated address
  latitude?: number;
  longitude?: number;
  metadata?: BuildingMetadata;
}

export interface VehicleMetadata {
  year?: number;
  model?: string;
  fuel_type?: string;
  vehicle_type?: string; // "Mobil Bensin", "Sepeda Motor", etc.
  capacity_range?: string; // "1000-1500cc", "≤250cc", etc.
  license_plate?: string;
  usage?: string;
  odometer_km?: number;
  notes?: string[];
  [key: string]: unknown; // Allow additional custom fields
}

export interface CreateVehiclePayload {
  name: string; // REQUIRED
  user_id: string; // REQUIRED - Must be provided explicitly
  description?: string;
  emission_factor_id: string; // REQUIRED - emissionFactorId from store
  /** Mark vehicle as active/inactive */
  active?: boolean;
  metadata?: VehicleMetadata;
}

export interface BuildingResponse {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  electricity_tariff_id: string;
  electricity_tariff_rate_per_kwh: string;
  power_capacity_label: string;
  has_renewables?: boolean;
  province_code: string;
  regency_code: string;
  district_code: string;
  village_code: string;
  address_label?: string;
  postal_code?: string;
  full_address?: string;
  latitude?: number;
  longitude?: number;
  metadata?: BuildingMetadata;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VehicleResponse {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  emission_factor_id: string; // Changed from vehicle_emission_factor_id
  metadata?: VehicleMetadata;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// === Assets Service ===

export const assetsService = {
  /**
   * Get all building assets for current user
   * @param token - Authentication token
   * @returns Array of building assets
   */
  async getBuildings(token: string): Promise<BuildingResponse[]> {
    return await fetchWithAuth<BuildingResponse[]>('/me/building-assets', token);
  },

  /**
   * Get all vehicle assets for current user
   * @param token - Authentication token
   * @returns Array of vehicle assets
   */
  async getVehicles(token: string): Promise<VehicleResponse[]> {
    return await fetchWithAuth<VehicleResponse[]>('/me/vehicle-assets', token);
  },

  /**
   * Create a building asset (direct from form)
   * @param payload - Building payload
   * @param token - Authentication token
   * @returns Created building response
   */
  async createBuildingDirect(
    payload: Partial<CreateBuildingPayload>,
    token: string
  ): Promise<BuildingResponse> {
    console.log('🏢 Creating building with payload:', JSON.stringify(payload, null, 2));

    return await fetchWithAuth<BuildingResponse>(
      '/building-assets',
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Update a building asset
   * @param id - Building ID
   * @param payload - Building payload
   * @param token - Authentication token
   * @returns Updated building response
   */
  async updateBuilding(
    id: string,
    payload: Partial<CreateBuildingPayload>,
    token: string
  ): Promise<BuildingResponse> {
    console.log('🏢 Updating building with payload:', JSON.stringify(payload, null, 2));

    return await fetchWithAuth<BuildingResponse>(
      `/building-assets/${id}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Delete a building asset
   * @param id - Building ID
   * @param token - Authentication token
   */
  async deleteBuilding(id: string, token: string): Promise<void> {
    await fetchWithAuth<void>(
      `/building-assets/${id}`,
      token,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Delete a vehicle asset
   * @param id - Vehicle ID
   * @param token - Authentication token
   */
  async deleteVehicle(id: string, token: string): Promise<void> {
    await fetchWithAuth<void>(
      `/vehicle-assets/${id}`,
      token,
      {
        method: 'DELETE',
      }
    );
  },

  /**
   * Get a single vehicle asset by id
   * @param id - Vehicle ID
   * @param token - Authentication token
   * @returns Vehicle response
   */
  async getVehicle(id: string, token: string): Promise<VehicleResponse> {
    return await fetchWithAuth<VehicleResponse>(`/vehicle-assets/${id}`, token);
  },

  /**
   * Get a single building asset
   * @param id - Building ID
   * @param token - Authentication token
   * @returns Building response
   */
  async getBuilding(id: string, token: string): Promise<BuildingResponse> {
    return await fetchWithAuth<BuildingResponse>(
      `/building-assets/${id}`,
      token
    );
  },

  /**
   * Create a building asset
   * @param building - Building data from store
   * @param userId - User ID from backend
   * @param token - Authentication token
   * @returns Created building response
   */
  async createBuilding(
    building: Building,
    userId: string,
    token: string
  ): Promise<BuildingResponse> {
    // Build electronics inventory from appliances
    const electronics_inventory: Record<string, number> = {};
    if (building.appliances) {
      Object.entries(building.appliances).forEach(([key, value]) => {
        if (value) {
          electronics_inventory[key] = value;
        }
      });
    }

    const payload: CreateBuildingPayload = {
      name: building.name,
      user_id: userId, // REQUIRED - from backend user profile
      electricity_tariff_id: building.tariffId,
      province_code: building.provinsi,
      regency_code: building.kabKota,
      district_code: building.kecamatan,
      village_code: building.kelurahan,
      address_label: building.name, // REQUIRED: Use building name as address label
      postal_code: building.postalCode?.toString(),
      full_address: building.alamatJalan, // REQUIRED: Use street address as full_address
      metadata: {
        area_sqm: building.luasM2,
        electronics_inventory: Object.keys(electronics_inventory).length > 0
          ? electronics_inventory
          : undefined,
      },
    };

    console.log('🏢 Creating building with payload:', JSON.stringify(payload, null, 2));

    return await fetchWithAuth<BuildingResponse>(
      '/building-assets',
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Create multiple building assets
   * @param buildings - Array of buildings from store
   * @param userId - User ID from backend
   * @param token - Authentication token
   * @returns Array of created buildings
   */
  async createBuildings(
    buildings: Building[],
    userId: string,
    token: string
  ): Promise<BuildingResponse[]> {
    const promises = buildings.map((building) =>
      this.createBuilding(building, userId, token)
    );
    return await Promise.all(promises);
  },

  /**
   * Create a vehicle asset
   * @param vehicle - Vehicle data from store
   * @param userId - User ID from backend
   * @param token - Authentication token
   * @returns Created vehicle response
   */
  async createVehicle(
    vehicle: Vehicle,
    userId: string,
    token: string,
    extraMetadata?: Record<string, unknown>
  ): Promise<VehicleResponse> {
    const baseMetadata: VehicleMetadata = {
      fuel_type: vehicle.fuelTypeLabel?.toLowerCase(), // "Bensin" -> "bensin"
      vehicle_type: vehicle.vehicleTypeLabel,
      capacity_range: vehicle.capacityRangeLabel,
    };

    const payload: CreateVehiclePayload = {
      name: vehicle.name,
      user_id: userId, // REQUIRED - from backend user profile
      emission_factor_id: vehicle.emissionFactorId, // Changed from vehicle_emission_factor_id
      // Newly created vehicles should be active by default
      active: true,
      metadata: {
        ...baseMetadata,
        // Merge any extra metadata provided by caller (e.g., fuel_product_id)
        ...(extraMetadata || {}),
      },
    };

    console.log('🚗 Creating vehicle with payload:', JSON.stringify(payload, null, 2));

    return await fetchWithAuth<VehicleResponse>(
      '/vehicle-assets',
      token,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Update a vehicle asset
   * @param id - Vehicle ID
   * @param payload - Partial create vehicle payload
   * @param token - Authentication token
   * @returns Updated vehicle response
   */
  async updateVehicle(
    id: string,
    payload: Partial<CreateVehiclePayload>,
    token: string
  ): Promise<VehicleResponse> {
    console.log('🚗 Updating vehicle with payload:', JSON.stringify(payload, null, 2));

    return await fetchWithAuth<VehicleResponse>(
      `/vehicle-assets/${id}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      }
    );
  },

  /**
   * Create multiple vehicle assets
   * @param vehicles - Array of vehicles from store
   * @param userId - User ID from backend
   * @param token - Authentication token
   * @returns Array of created vehicles
   */
  async createVehicles(
    vehicles: Vehicle[],
    userId: string,
    token: string
  ): Promise<VehicleResponse[]> {
    const promises = vehicles.map((vehicle) =>
      this.createVehicle(vehicle, userId, token)
    );
    return await Promise.all(promises);
  },

  /**
   * Submit all assets (buildings and vehicles)
   * @param buildings - Array of buildings from store
   * @param vehicles - Array of vehicles from store
   * @param userId - User ID from backend
   * @param token - Authentication token
   * @returns Object with created buildings and vehicles
   */
  async submitAllAssets(
    buildings: Building[],
    vehicles: Vehicle[],
    userId: string,
    token: string
  ): Promise<{
    buildings: BuildingResponse[];
    vehicles: VehicleResponse[];
  }> {
    const [createdBuildings, createdVehicles] = await Promise.all([
      buildings.length > 0 ? this.createBuildings(buildings, userId, token) : Promise.resolve([]),
      vehicles.length > 0 ? this.createVehicles(vehicles, userId, token) : Promise.resolve([]),
    ]);

    return {
      buildings: createdBuildings,
      vehicles: createdVehicles,
    };
  },
};
