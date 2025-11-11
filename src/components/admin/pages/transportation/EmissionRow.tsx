'use client';
import { Pen, TrashIcon } from 'lucide-react';

interface TransportationEmissionRowProps {
  id: string;
  vehicle_type: string;
  fuel_type: string;
  capacity_range_label: string;
  default_km_per_liter: number;
  g_co2e_per_km: number;
  active: boolean;
  onRequestEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

export function TransportationEmissionRow({ id, fuel_type, capacity_range_label, default_km_per_liter, g_co2e_per_km, active, onRequestEdit, onRequestDelete }: TransportationEmissionRowProps) {
  return (
    <tr className="border-b border-gray-200 last:border-none hover:bg-gray-50 transition">
      <td className="px-5 py-3 text-gray-800">{fuel_type}</td>
      <td className="px-3 py-3 text-gray-700">{capacity_range_label}</td>
      <td className="px-3 py-3 text-gray-700">{default_km_per_liter}</td>
      <td className="px-3 py-3 text-gray-700">{g_co2e_per_km}</td>
      <td className="px-3 py-3">
        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{active ? 'Aktif' : 'Nonaktif'}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => onRequestEdit(id)} className="p-2 rounded-md text-emerald-600 hover:bg-emerald-100 transition">
            <Pen className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onRequestDelete(id)} className="p-2 rounded-md text-red-600 hover:bg-red-100 transition">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
