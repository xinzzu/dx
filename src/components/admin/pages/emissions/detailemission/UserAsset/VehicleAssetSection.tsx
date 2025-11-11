import { Car } from 'lucide-react';
import { VehicleAssetCard } from './VehicleAssetCard';

interface VehicleAsset {
  name: string;
  type: string;
  engineCapacity: string;
  fuelType: string;
}

interface VehicleAssetSectionProps {
  assets: VehicleAsset[];
}

export function VehicleAssetSection({ assets }: VehicleAssetSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-gray-700" />
        <h2 className="font-semibold text-gray-800">Aset Kendaraan ({assets.length})</h2>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {assets.map((item, index) => (
          <VehicleAssetCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
