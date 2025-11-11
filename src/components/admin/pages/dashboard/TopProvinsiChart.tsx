'use client';

export const TopProvinsiCard = () => {
  const data = [
    { name: 'DKI Jakarta', value: 670800 },
    { name: 'Jawa Barat', value: 570800 },
    { name: 'Jawa Tengah', value: 500780 },
    { name: 'Jawa Timur', value: 470800 },
    { name: 'Sumatera Utara', value: 420800 },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <h3 className="font-semibold text-gray-700 mb-2">Top 5 Provinsi – Emisi Tertinggi</h3>
      <p className="text-sm text-gray-500 mb-4">Total emisi CO2e (ton)</p>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 w-6 text-right">{i + 1}</div>
              <div className="text-base text-gray-700 font-medium">{item.name}</div>
            </div>
            <div className="flex items-center gap-2 w-1/2">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(item.value / 670800) * 100}%` }} />
              <span className="text-sm text-gray-600">{item.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
