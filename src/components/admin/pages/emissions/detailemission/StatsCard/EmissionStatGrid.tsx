import { Flame, BarChart3, FileText, Building2, Car } from 'lucide-react';
import { EmissionStatsCard } from './EmissionStatCard';

interface EmissionStatsGridProps {
  total_emission: number;
  avg_emission: number;
  report_count: number;
  building_count: number;
  vehicle_count: number; // ✅ Tambah vehicle count
  loading?: boolean;
}

export function EmissionStatsGrid({ total_emission, avg_emission, report_count, building_count, vehicle_count, loading = false }: EmissionStatsGridProps) {
  const formatEmission = (value: number) => {
    return value.toLocaleString('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <EmissionStatsCard icon={<Flame className="w-6 h-6 text-red-500" />} label="Total Emisi Semua Periode" value={loading ? '...' : formatEmission(total_emission)} unit="ton CO₂e" color="bg-red-50" />

      <EmissionStatsCard icon={<BarChart3 className="w-6 h-6 text-blue-500" />} label="Rata-rata Emisi per Bulan" value={loading ? '...' : formatEmission(avg_emission)} unit="ton CO₂e" color="bg-blue-50" />

      <EmissionStatsCard icon={<FileText className="w-6 h-6 text-green-600" />} label="Laporan Emisi" value={loading ? '...' : report_count} unit="laporan" color="bg-green-50" />

      <EmissionStatsCard icon={<Building2 className="w-6 h-6 text-purple-500" />} label="Total Bangunan" value={loading ? '...' : building_count} unit="bangunan" color="bg-purple-50" />

      {/* ✅ Tambah vehicle count */}
      <EmissionStatsCard icon={<Car className="w-6 h-6 text-orange-500" />} label="Total Kendaraan" value={loading ? '...' : vehicle_count} unit="kendaraan" color="bg-orange-50" />
    </div>
  );
}
