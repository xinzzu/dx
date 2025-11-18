import type { VehicleAsset } from '@/types/vehicleAssetType';

interface VehicleAssetCardProps {
  asset: VehicleAsset;
}

export function VehicleAssetCard({ asset }: VehicleAssetCardProps) {
  const { name, metadata } = asset;
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">{name}</h3>
      <div className="grid grid-cols-2 text-sm text-gray-700 gap-y-1">
        <p>Jenis:</p>
        <p className="font-semibold">{metadata?.vehicle_type || '-'}</p>
        <p>Kapasitas Mesin:</p>
        <p className="font-semibold">{metadata?.capacity_range || '-'}</p>
        <p>Bahan Bakar:</p>
        <p className="font-semibold">{metadata?.fuel_type || '-'}</p>
      </div>
    </div>
  );
}
