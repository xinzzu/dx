import { Flame, BarChart3, FileText, Building2 } from 'lucide-react';
import { EmissionStatsCard } from './EmissionStatCard';

interface EmissionStatsGridProps {
  total_emission: number;
  avg_emission: number;
  report_count: number;
  building_count: number;
}

export function EmissionStatsGrid({ total_emission, avg_emission, report_count, building_count }: EmissionStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <EmissionStatsCard icon={<Flame className="w-6 h-6 text-red-500" />} label="Total Emisi" value={total_emission.toFixed(2)} unit="kg CO₂e" color="bg-red-50" />

      <EmissionStatsCard icon={<BarChart3 className="w-6 h-6 text-blue-500" />} label="Rata-rata Emisi" value={avg_emission.toFixed(2)} unit="kg CO₂e" color="bg-blue-50" />

      <EmissionStatsCard icon={<FileText className="w-6 h-6 text-green-600" />} label="Laporan Emisi" value={report_count} unit="laporan" color="bg-green-50" />

      <EmissionStatsCard icon={<Building2 className="w-6 h-6 text-purple-500" />} label="Total Bangunan" value={building_count} unit="bangunan" color="bg-purple-50" />
    </div>
  );
}
