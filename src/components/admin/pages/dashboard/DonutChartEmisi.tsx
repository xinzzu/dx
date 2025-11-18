'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import type { CategoryDistribution } from '@/types/dashboardType';

interface DistribusiDonutChartProps {
  data: CategoryDistribution[];
  loading?: boolean;
}

const COLORS: Record<string, string> = {
  transportasi: '#8979FF',
  listrik: '#FF928A',
  limbah: '#3CDF6F',
  makanan: '#3CC3DF',
};

const CATEGORY_LABELS: Record<string, string> = {
  transportasi: 'Transportasi',
  listrik: 'Listrik',
  limbah: 'Limbah',
  makanan: 'Makanan',
};

export const DistribusiDonutChart = ({ data, loading }: DistribusiDonutChartProps) => {
  const chartData = data.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.total_kgco2e / 1000, // Convert kg to tons
    percentage: item.percentage,
  }));

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Distribusi per Kategori</h3>
      <p className="text-sm text-gray-500 mb-4">Persentase Kontribusi</p>

      {loading ? (
        <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">Memuat data...</div>
      ) : data.length === 0 ? (
        // ✅ Tambahkan kondisi tidak ada data
        <div className="flex items-center justify-center h-[250px] text-gray-500 text-sm">Tidak ada data kategori emisi</div>
      ) : (
        <div className="w-full flex items-center">
          <div className="w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[data[i].category] || '#999'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(2)} ton CO₂e`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-1/2 flex flex-col space-y-2 px-4">
            {chartData.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[data[i].category] || '#999' }} />
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <div className="text-gray-600">
                  {item.percentage}% — <span className="text-gray-500">{item.value.toFixed(2)} ton CO₂e</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
