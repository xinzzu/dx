'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getNationalTrend } from '@/lib/api/dashboard';
import type { NationalTrend } from '@/types/dashboardType';

interface TrendEmisiLineChartProps {
  year?: number | 'semua';
}

const CATEGORY_COLORS: Record<string, string> = {
  transportasi: '#6366f1',
  listrik: '#f43f5e',
  limbah: '#10b981',
  makanan: '#f59e0b',
};

const CATEGORY_LABELS: Record<string, string> = {
  transportasi: 'Transportasi',
  listrik: 'Listrik',
  limbah: 'Limbah',
  makanan: 'Makanan',
};

export const TrendEmisiLineChart = ({ year }: TrendEmisiLineChartProps) => {
  const [trendData, setTrendData] = useState<NationalTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getNationalTrend(year);
        if (mounted) setTrendData(data);
      } catch (err) {
        console.error('Failed to fetch national trend:', err);
        if (mounted) setError(err instanceof Error ? err.message : 'Gagal memuat data tren');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [year]);

  // Transform data untuk recharts
  // Format: [{ name: "Januari", Transportasi: 0, Listrik: 0, ... }, ...]
  const chartData =
    trendData?.labels.map((label, index) => {
      const monthData: Record<string, string | number> = { name: label };

      trendData.datasets.forEach((dataset) => {
        const categoryName = CATEGORY_LABELS[dataset.name] || dataset.name;
        monthData[categoryName] = dataset.data[index] || 0;
      });

      return monthData;
    }) || [];

  // Get unique categories untuk render Lines
  const categories = trendData?.datasets.map((d) => CATEGORY_LABELS[d.name] || d.name) || [];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Tren Emisi Karbon Nasional</h3>
      <p className="text-sm text-gray-500 mb-4">Per Bulan Per Kategori ({year && year !== 'semua' ? year : 'Semua Tahun'})</p>

      {loading ? (
        <div className="flex items-center justify-center h-[250px] text-gray-500">Memuat data...</div>
      ) : error ? (
        <div className="flex items-center justify-center h-[250px] text-red-500">{error}</div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] text-gray-500">Tidak ada data untuk ditampilkan</div>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(2)} ton CO₂e`, name]} />
            <Legend />

            {/* Render Line untuk setiap kategori */}
            {categories.map((category) => {
              const originalName = Object.keys(CATEGORY_LABELS).find((key) => CATEGORY_LABELS[key] === category) || category.toLowerCase();
              const color = CATEGORY_COLORS[originalName] || '#999';

              return <Line key={category} type="monotone" dataKey={category} stroke={color} strokeWidth={2} />;
            })}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
