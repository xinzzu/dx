'use client';

import { Car } from 'lucide-react';
import { VehicleAssetCard } from './VehicleAssetCard';
import type { VehicleAsset } from '@/types/vehicleAssetType';

interface VehicleAssetSectionProps {
  assets: VehicleAsset[]; // ✅ Terima assets langsung dari parent
  loading?: boolean;
}

export function VehicleAssetSection({ assets, loading = false }: VehicleAssetSectionProps) {
  if (loading) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Car className="w-5 h-5 text-gray-700" />
          <h2 className="font-semibold text-gray-800">Aset Kendaraan</h2>
        </div>
        <div className="h-24 bg-gray-100 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Car className="w-5 h-5 text-gray-700" />
        <h2 className="font-semibold text-gray-800">Aset Kendaraan ({assets.length})</h2>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {assets.map((asset) => (
          <VehicleAssetCard key={asset.id} asset={asset} />
        ))}
        {assets.length === 0 && <p className="text-sm text-gray-500">Tidak ada aset kendaraan.</p>}
      </div>
    </div>
  );
}
