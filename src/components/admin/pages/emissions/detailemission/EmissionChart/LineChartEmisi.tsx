'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { LineChartIcon } from 'lucide-react';
import { YearFilter } from './YearFilter';
import { getEmissionTrend } from '@/lib/api/emissionUserTrend';
import type { EmissionTrendData } from '@/types/emissionTrendUserType';
import { formatCarbonFootprint } from '@/utils/carbonAnalysis';

interface TrendEmisiLineChartProps {
  userId: string;
}

// ✅ Transform API data to Recharts format
function transformToChartData(apiData: EmissionTrendData | null) {
  if (!apiData) return [];

  const { labels, datasets } = apiData;

  return labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = { name: label };

    datasets.forEach((dataset) => {
      dataPoint[dataset.name] = dataset.data[index] ?? 0;
    });

    return dataPoint;
  });
}

export function TrendEmisiLineChart({ userId }: TrendEmisiLineChartProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [trendData, setTrendData] = useState<EmissionTrendData | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch data saat userId atau year berubah
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getEmissionTrend(userId, selectedYear);
        if (mounted) setTrendData(data);
      } catch (error) {
        console.error('Failed to fetch emission trend:', error);
        if (mounted) setTrendData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, selectedYear]);

  const chartData = transformToChartData(trendData);

  // ✅ Extract category names from datasets
  const categories = trendData?.datasets.map((d) => d.name) ?? [];

  // ✅ Color mapping per category
  const colorMap: Record<string, string> = {
    Transportasi: '#6366f1', // indigo
    Listrik: '#f43f5e', // rose
    Sampah: '#10b981', // green
    Makanan: '#f59e0b', // amber
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-800 font-semibold">Tren Emisi Karbon</h3>
        </div>
        <YearFilter onChange={setSelectedYear} />
      </div>

      <p className="text-sm text-gray-500 mb-4">Per Bulan Berdasarkan Kategori ({selectedYear})</p>

      {/* Chart */}
      {loading ? (
        <div className="h-64 bg-gray-100 animate-pulse rounded-md" />
      ) : chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              // formatter={(value: number, name: string) => [`${value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg CO₂e`, name]}
              formatter={(value: number, name: string) => [`${formatCarbonFootprint(value).value} ${formatCarbonFootprint(value).unit}`, name]}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '8px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '14px' }} />

            {/* ✅ Render lines dynamically based on API data */}
            {categories.map((category) => (
              <Line key={category} type="monotone" dataKey={category} stroke={colorMap[category] || '#6b7280'} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">Tidak ada data tren emisi untuk tahun {selectedYear}</div>
      )}
    </div>
  );
}
