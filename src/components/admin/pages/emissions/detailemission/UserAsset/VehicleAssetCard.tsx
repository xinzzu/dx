interface VehicleAssetCardProps {
  name: string;
  type: string;
  engineCapacity: string;
  fuelType: string;
}

export function VehicleAssetCard({ name, type, engineCapacity, fuelType }: VehicleAssetCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
      <h3 className="font-semibold text-gray-800 mb-3">{name}</h3>

      <div className="grid grid-cols-2 text-sm text-gray-700 gap-y-1">
        <p>Jenis:</p>
        <p className="font-semibold">{type}</p>
        <p>Kapasitas Mesin:</p>
        <p className="font-semibold">{engineCapacity}</p>
        <p>Bahan Bakar:</p>
        <p className="font-semibold">{fuelType}</p>
      </div>
    </div>
  );
}
