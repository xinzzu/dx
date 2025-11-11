// DEPRECATED: `services/me` has been simplified. Please use `assetsService` directly
// The assetsService already calls the /me endpoints for list operations.
import { assetsService } from '@/services/assets'

export const getMyVehicleResponses = assetsService.getVehicles;
export const getMyAssets = assetsService.getVehicles;
export const getMyVehicleAssets = assetsService.getVehicles;
export const getMyBuildingAssets = assetsService.getBuildings;
export const getMyBuildings = assetsService.getBuildings;

export async function getMyVehicleById(id: string, token: string) {
  // assetsService doesn't provide a /me/:id endpoint, so fetch the list and find by id
  const items = await assetsService.getVehicles(token);
  return items.find((i) => i.id === id) ?? null;
}

export async function getMyBuildingById(id: string, token: string) {
  const items = await assetsService.getBuildings(token);
  return items.find((i) => i.id === id) ?? null;
}

export async function getMyAssetById(id: string, token: string) {
  return (await getMyVehicleById(id, token)) ?? (await getMyBuildingById(id, token));
}
