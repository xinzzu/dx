'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = [
  { name: 'Januari', Transportasi: 250, Listrik: 180, Sampah: 100, Makanan: 80 },
  { name: 'Februari', Transportasi: 280, Listrik: 200, Sampah: 110, Makanan: 90 },
  { name: 'Maret', Transportasi: 350, Listrik: 250, Sampah: 150, Makanan: 120 },
  { name: 'April', Transportasi: 400, Listrik: 270, Sampah: 180, Makanan: 150 },
  { name: 'Mei', Transportasi: 310, Listrik: 220, Sampah: 130, Makanan: 100 },
  { name: 'Juni', Transportasi: 450, Listrik: 280, Sampah: 200, Makanan: 150 },
  { name: 'Juli', Transportasi: 390, Listrik: 240, Sampah: 150, Makanan: 110 },
  { name: 'Agustus', Transportasi: 410, Listrik: 250, Sampah: 180, Makanan: 120 },
  { name: 'September', Transportasi: 370, Listrik: 230, Sampah: 140, Makanan: 100 },
  { name: 'Oktober', Transportasi: 420, Listrik: 260, Sampah: 180, Makanan: 130 },
  { name: 'November', Transportasi: 350, Listrik: 210, Sampah: 130, Makanan: 90 },
  { name: 'Desember', Transportasi: 300, Listrik: 200, Sampah: 110, Makanan: 70 },
];

export const TrendEmisiLineChart = () => {
  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Tren Emisi Karbon Nasional</h3>
      <p className="text-sm text-gray-500 mb-4">Per bulan Per Kategori (2025)</p>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value, name) => [`${value} ton CO2e`, name]} />
          <Legend />
          <Line type="monotone" dataKey="Transportasi" stroke="#6366f1" strokeWidth={2} />
          <Line type="monotone" dataKey="Listrik" stroke="#f43f5e" strokeWidth={2} />
          <Line type="monotone" dataKey="Sampah" stroke="#10b981" strokeWidth={2} />
          <Line type="monotone" dataKey="Makanan" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
