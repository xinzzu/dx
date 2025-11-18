'use client';
import { useMemo, useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';
import { BuildingAssetCard } from './BuildingAssetCard';
import { getElectricityEmissionTariffsWithCategoryName } from '@/lib/api/electricityEmissionTarif';
import { getProvinceName, getRegencyName, getDistrictName, getVillageName } from '@/lib/api/region';
import type { BuildingAsset } from '@/types/buildingAssetType';
import type { ElectricityEmissionTarifWithCategoryName } from '@/types/electricityEmissionTarif';

interface BuildingAssetSectionProps {
  assets: BuildingAsset[]; // ✅ Terima assets langsung dari parent
  loading?: boolean;
}

type EnrichedBuildingAsset = BuildingAsset & {
  __long_address: string;
};

interface CardData {
  key: string;
  name: string;
  electricityType: string;
  electricityPower: string;
  area: string;
  address: string;
  equipments: { name: string; unit: string }[];
}

export function BuildingAssetSection({ assets, loading = false }: BuildingAssetSectionProps) {
  const [enrichedAssets, setEnrichedAssets] = useState<EnrichedBuildingAsset[]>([]);
  const [tariffMap, setTariffMap] = useState<Map<string, ElectricityEmissionTarifWithCategoryName>>(new Map());
  const [enriching, setEnriching] = useState(false);

  // ✅ Fetch tariff mapping
  useEffect(() => {
    (async () => {
      try {
        const tariffsResponse = await getElectricityEmissionTariffsWithCategoryName(1, 1000);
        const tariffMapLocal = new Map<string, ElectricityEmissionTarifWithCategoryName>();
        (tariffsResponse?.data ?? []).forEach((t) => {
          tariffMapLocal.set(t.id, t);
        });
        setTariffMap(tariffMapLocal);
      } catch (error) {
        console.error('Failed to fetch tariffs:', error);
      }
    })();
  }, []);

  // ✅ Enrich assets dengan alamat lengkap
  useEffect(() => {
    if (assets.length === 0) {
      setEnrichedAssets([]);
      return;
    }

    (async () => {
      try {
        setEnriching(true);

        const enriched: EnrichedBuildingAsset[] = await Promise.all(
          assets.map(async (a) => {
            const addressCore = a.full_address || a.address_label || '-';
            try {
              const provinceCode = a.province_code.startsWith('id') ? a.province_code : `id${a.province_code}`;
              const regencyCode = a.regency_code.startsWith('id') ? a.regency_code : `id${a.regency_code}`;
              const districtCode = a.district_code.startsWith('id') ? a.district_code : `id${a.district_code}`;
              const villageCode = a.village_code.startsWith('id') ? a.village_code : `id${a.village_code}`;

              const [provinceName, regencyName, districtName, villageName] = await Promise.all([
                getProvinceName(provinceCode),
                getRegencyName(regencyCode, provinceCode),
                getDistrictName(districtCode, regencyCode),
                getVillageName(villageCode, districtCode),
              ]);

              const postal = a.postal_code ? ` ${a.postal_code}` : '';
              const longAddress = [addressCore, villageName, districtName, regencyName, provinceName].filter(Boolean).join(', ') + postal;

              return { ...a, __long_address: longAddress };
            } catch {
              return { ...a, __long_address: addressCore };
            }
          })
        );

        setEnrichedAssets(enriched);
      } catch (error) {
        console.error('Failed to enrich building assets:', error);
      } finally {
        setEnriching(false);
      }
    })();
  }, [assets]);

  const cards: CardData[] = useMemo(() => {
    return enrichedAssets.map((a) => {
      const tariff = a.electricity_tariff_id ? tariffMap.get(a.electricity_tariff_id) : undefined;
      const area = typeof a.metadata?.area_sqm === 'number' ? `${a.metadata.area_sqm} m²` : '-';

      // ✅ Handle both formats: Record<string, number> dan { name: string; qty: number }[]
      let equipments: { name: string; unit: string }[] = [];

      if (a.metadata?.electronics_inventory) {
        if (Array.isArray(a.metadata.electronics_inventory)) {
          // Format array: { name: string; qty: number }[]
          equipments = a.metadata.electronics_inventory.map((item) => ({
            name: item.name,
            unit: `${item.qty} unit`,
          }));
        } else {
          // Format object: Record<string, number>
          equipments = Object.entries(a.metadata.electronics_inventory).map(([name, qty]) => ({
            name,
            unit: `${qty} unit`,
          }));
        }
      }

      return {
        key: a.id,
        name: a.name,
        electricityType: tariff?.category_name ?? '-',
        electricityPower: a.power_capacity_label ?? '-',
        area,
        address: a.__long_address,
        equipments,
      };
    });
  }, [enrichedAssets, tariffMap]);

  if (loading || enriching) {
    return (
      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-gray-700" />
          <h2 className="font-semibold text-gray-800">Aset Bangunan</h2>
        </div>
        <div className="h-24 bg-gray-100 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Building2 className="w-5 h-5 text-gray-700" />
        <h2 className="font-semibold text-gray-800">Aset Bangunan ({assets.length})</h2>
      </div>

      <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
        {cards.map((c) => (
          <BuildingAssetCard key={c.key} name={c.name} electricityType={c.electricityType} electricityPower={c.electricityPower} area={c.area} address={c.address} equipments={c.equipments} />
        ))}
        {assets.length === 0 && <p className="text-sm text-gray-500">Tidak ada aset bangunan.</p>}
      </div>
    </div>
  );
}
