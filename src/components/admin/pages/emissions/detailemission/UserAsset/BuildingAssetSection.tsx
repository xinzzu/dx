import { Building2 } from 'lucide-react';
import { BuildingAssetCard } from './BuildingAssetCard';

interface BuildingAsset {
  name: string;
  electricityType: string;
  electricityPower: string;
  area: string;
  address: string;
  equipments: { name: string; unit: string }[];
}

interface BuildingAssetSectionProps {
  assets: BuildingAsset[];
}

export function BuildingAssetSection({ assets }: BuildingAssetSectionProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-700" />
        <h2 className="font-semibold text-gray-800">Aset Bangunan ({assets.length})</h2>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {assets.map((item, index) => (
          <BuildingAssetCard key={index} {...item} />
        ))}
      </div>
    </div>
  );
}
