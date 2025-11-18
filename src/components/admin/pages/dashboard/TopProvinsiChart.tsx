'use client';

import type { TopProvince } from '@/types/dashboardType';

interface TopProvinsiCardProps {
  data: TopProvince[];
  loading?: boolean;
}

export const TopProvinsiCard = ({ data, loading }: TopProvinsiCardProps) => {
  // Sort data (jaga-jaga kalau backend belum urut)
  const sortedData = [...data].sort((a, b) => b.total_kgco2e - a.total_kgco2e).slice(0, 5);

  // Cari nilai maksimum untuk hitung lebar bar
  const maxValue = sortedData.length > 0 ? sortedData[0].total_kgco2e : 0;

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Top 5 Provinsi – Emisi Tertinggi</h3>
      <p className="text-sm text-gray-500 mb-4">Total emisi CO₂e (ton)</p>

      {loading ? (
        <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">Memuat data...</div>
      ) : sortedData.length === 0 ? (
        // ✅ Tambahkan kondisi tidak ada data
        <div className="flex items-center justify-center h-[200px] text-gray-500 text-sm">Tidak ada data provinsi</div>
      ) : (
        <div className="space-y-3">
          {sortedData.map((item, i) => {
            const barWidth = maxValue > 0 ? (item.total_kgco2e / maxValue) * 100 : 0;
            const tons = item.total_kgco2e / 1000; // kg → ton

            return (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600 w-6 text-right">{i + 1}</div>
                  <div className="text-base text-gray-700 font-medium">{item.province}</div>
                </div>
                <div className="flex items-center gap-2 w-1/2">
                  <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${barWidth}%` }} />
                  <span className="text-sm text-gray-600 whitespace-nowrap">{tons.toFixed(2)} ton</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
