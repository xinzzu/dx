interface BuildingAssetCardProps {
  name: string;
  electricityType: string;
  electricityPower: string;
  area: string;
  address: string;
  equipments: { name: string; unit: string }[];
}

export function BuildingAssetCard({ name, electricityType, electricityPower, area, address, equipments }: BuildingAssetCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-900 text-base mb-4">{name}</h3>

      <div className="grid grid-cols-2 text-sm text-gray-800 mb-3">
        <div>
          <p>Jenis Listrik:</p>
          <p className="font-semibold">{electricityType}</p>
        </div>
        <div>
          <p>Daya Listrik:</p>
          <p className="font-semibold">{electricityPower}</p>
        </div>
      </div>

      <div className="text-sm text-gray-800 mb-3">
        <p>
          Luas Bangunan: <span className="font-semibold">{area}</span>
        </p>
      </div>

      <div className="text-sm text-gray-800 mb-4">
        <p className="font-semibold mb-0.5">Alamat Lengkap:</p>
        <div className="text-gray-700 leading-relaxed">
          {/* Baris pertama: addressCore */}
          <p>{address.split(',')[0]}</p>

          {/* Baris kedua: sisa alamat */}
          <p className="text-gray-600">{address.split(',').slice(1).join(', ').trim()}</p>
        </div>
      </div>

      <div className="text-sm text-gray-800">
        <p className="font-semibold mb-1">Peralatan:</p>
        {equipments.length === 0 ? (
          <p className="text-xs text-gray-500">Tidak ada data perangkat.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {equipments.map((eq, i) => (
              <li key={i} className="flex justify-between items-center py-1 text-gray-700">
                <span>{eq.name}</span>
                <span className="font-semibold">{eq.unit}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
