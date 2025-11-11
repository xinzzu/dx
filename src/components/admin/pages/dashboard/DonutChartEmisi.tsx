'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Transportasi', value: 1900.78 },
  { name: 'Listrik', value: 900.78 },
  { name: 'Limbah', value: 500.78 },
  { name: 'Makanan', value: 200.78 },
];

const COLORS = ['#8979FF', '#FF928A', '#3CDF6F', '#3CC3DF'];
const total = data.reduce((sum, item) => sum + item.value, 0);
const getPercentage = (value: number) => ((value / total) * 100).toFixed(0);

export const DistribusiDonutChart = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Distribusi per Kategori</h3>
      <p className="text-sm text-gray-500 mb-4">Persentase Kontribusi</p>
      <div className="w-full flex items-center">
        <div className="w-1/2">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" stroke="none">
                {data.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString()} ton CO2e`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="w-1/2 flex flex-col space-y-2 px-4">
          {data.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-gray-700 font-medium">{item.name}</span>
              </div>
              <div className="text-gray-600">
                {getPercentage(item.value)}% — <span className="text-gray-500">{item.value.toLocaleString()} ton CO₂e</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
