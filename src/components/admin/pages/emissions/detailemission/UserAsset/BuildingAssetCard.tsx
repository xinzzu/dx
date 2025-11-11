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
      {/* Judul */}
      <h3 className="font-semibold text-gray-900 text-base mb-4">{name}</h3>

      {/* Jenis & Daya Listrik */}
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

      {/* Luas Bangunan */}
      <div className="text-sm text-gray-800 mb-3">
        <p>
          Luas Bangunan: <span className="font-semibold">{area}</span>
        </p>
      </div>

      {/* Alamat */}
      <div className="text-sm text-gray-800 mb-3">
        <p className="font-semibold mb-0.5">Alamat:</p>
        <p className="text-gray-700 leading-relaxed">{address}</p>
      </div>

      {/* Peralatan */}
      <div className="text-sm text-gray-800">
        <p className="font-semibold mb-1">Peralatan:</p>
        <ul className="divide-y divide-gray-100">
          {equipments.map((eq, index) => (
            <li key={index} className="flex justify-between items-center py-1 text-gray-700">
              <span>{eq.name}</span>
              <span className="font-semibold">{eq.unit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
