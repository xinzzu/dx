'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BackButton } from './BackButton';
import { UserEmissionInfo } from './UserProfile/UserEmissionInfo';
import { EmissionStatsGrid } from './StatsCard/EmissionStatGrid';
import { BuildingAssetSection } from './UserAsset/BuildingAssetSection';
import { VehicleAssetSection } from './UserAsset/VehicleAssetSection';
import { EmissionMonthlyReport } from './MonthlyReport/EmissionMonthlyReport';
import { TrendEmisiLineChart } from './EmissionChart/LineChartEmisi';
import { getUserDetailById, getUserStats } from '@/lib/api/userDetailEmission';
import type { UserProfile, UserStats } from '@/types/userDetailEmissionType';
import type { BuildingAsset } from '@/types/buildingAssetType';
import type { VehicleAsset } from '@/types/vehicleAssetType';

interface DetailEmissionContentProps {
  id?: string;
}

export function DetailEmissionContent({ id }: DetailEmissionContentProps) {
  const params = useParams<{ id: string }>();

  const effectiveId = useMemo(() => {
    const candidate = (id ?? params?.id ?? '').toString().trim();
    return candidate && candidate !== 'undefined' && candidate !== 'null' ? candidate : '';
  }, [id, params]);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [buildingAssets, setBuildingAssets] = useState<BuildingAsset[]>([]);
  const [vehicleAssets, setVehicleAssets] = useState<VehicleAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!effectiveId) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);

        // ✅ Fetch profile + assets dan stats secara parallel
        const [userDetail, userStats] = await Promise.all([getUserDetailById(effectiveId), getUserStats(effectiveId)]);

        if (mounted) {
          setProfile(userDetail.profile);
          setBuildingAssets(userDetail.building_assets);
          setVehicleAssets(userDetail.vehicle_assets);
          setStats(userStats);
        }
      } catch (error) {
        console.error('Failed to fetch user detail:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [effectiveId]);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col gap-6">
      <BackButton />

      <UserEmissionInfo profile={profile} headerTotalEmisi={stats?.header_total_emisi_tons ?? 0} loading={loading} />

      <EmissionStatsGrid
        total_emission={stats?.overview_cards.total_emisi_semua_periode_tons ?? 0}
        avg_emission={stats?.overview_cards.avg_emisi_per_bulan_tons ?? 0}
        report_count={stats?.overview_cards.total_laporan_emisi ?? 0}
        building_count={stats?.overview_cards.total_bangunan ?? 0}
        vehicle_count={stats?.overview_cards.total_kendaraan ?? 0}
        loading={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BuildingAssetSection assets={buildingAssets} loading={loading} />
        <VehicleAssetSection assets={vehicleAssets} loading={loading} />
      </div>

      <EmissionMonthlyReport userId={effectiveId} />
      <TrendEmisiLineChart userId={effectiveId} />
    </div>
  );
}
