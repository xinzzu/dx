'use client';

import { BackButton } from './BackButton';
import { UserEmissionInfo } from './UserProfile/UserEmissionInfo';
import { EmissionStatsGrid } from './StatsCard/EmissionStatGrid';
import { BuildingAssetSection } from './UserAsset/BuildingAssetSection';
import { VehicleAssetSection } from './UserAsset/VehicleAssetSection';
import { EmissionMonthlyReport } from './MonthlyReport/EmissionMonthlyReport';
import { TrendEmisiLineChart } from './EmissionChart/LineChartEmisi';

interface DetailEmissionContentProps {
  id: string;
}

export function DetailEmissionContent({ id }: DetailEmissionContentProps) {
  const userData = {
    name: 'Ahmad Rizki',
    id,
    type: 'Individu',
    date_joined: '15/09/2025',
    total_emission: 420.85,
    emission_avg: 315.6,
    report_count: 8,
    building_count: 2,
    address: 'Jl. Melati No. 12, Cipete Utara, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150',
  };

  const buildingAssets = [
    {
      name: 'Rumah Tinggal Ahmad',
      electricityType: 'Rumah Tangga Non-Subsidi',
      electricityPower: '2200 VA',
      area: '120 m²',
      address: 'Jl. Melati No. 12, Cipete Utara, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150',
      equipments: [
        { name: 'AC 1 PK', unit: '2 unit' },
        { name: 'Kulkas 2 Pintu', unit: '1 unit' },
        { name: 'TV LED 42 inch', unit: '1 unit' },
        { name: 'Mesin Cuci', unit: '1 unit' },
        { name: 'Pompa Air', unit: '1 unit' },
      ],
    },
    {
      name: 'Rumah Tinggal Ahmad',
      electricityType: 'Rumah Tangga Non-Subsidi',
      electricityPower: '2200 VA',
      area: '120 m²',
      address: 'Jl. Melati No. 12, Cipete Utara, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150',
      equipments: [
        { name: 'AC 1 PK', unit: '2 unit' },
        { name: 'Kulkas 2 Pintu', unit: '1 unit' },
        { name: 'TV LED 42 inch', unit: '1 unit' },
        { name: 'Mesin Cuci', unit: '1 unit' },
        { name: 'Pompa Air', unit: '1 unit' },
      ],
    },
  ];

  const vehicleAssets = [
    {
      name: 'Honda Vario 150',
      type: 'Motor',
      engineCapacity: '150cc',
      fuelType: 'Bensin',
    },
    {
      name: 'Toyota Avanza G',
      type: 'Mobil',
      engineCapacity: '<1400cc',
      fuelType: 'Bensin',
    },
    {
      name: 'Toyota Avanza G',
      type: 'Mobil',
      engineCapacity: '<1400cc',
      fuelType: 'Bensin',
    },
  ];

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col gap-6">
      <BackButton />
      <UserEmissionInfo {...userData} />
      <EmissionStatsGrid total_emission={userData.total_emission} avg_emission={userData.emission_avg} report_count={userData.report_count} building_count={userData.building_count} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BuildingAssetSection assets={buildingAssets} />
        <VehicleAssetSection assets={vehicleAssets} />
      </div>

      {/* Laporan Emisi per Bulan */}
      <EmissionMonthlyReport />
      <TrendEmisiLineChart />
    </div>
  );
}
