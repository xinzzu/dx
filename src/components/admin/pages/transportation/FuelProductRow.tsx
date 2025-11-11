'use client';
import { Pen, TrashIcon } from 'lucide-react';

interface FuelProductRowProps {
  id: string;
  product_name: string;
  fuel_type: string;
  unit: string;
  active: boolean;
  onRequestEdit: (id: string) => void;
  onRequestDelete: (id: string, product_name: string) => void;
}

export function FuelProductRow({ id, product_name, fuel_type, unit, active, onRequestEdit, onRequestDelete }: FuelProductRowProps) {
  return (
    <tr className="border-b border-gray-200 last:border-none">
      <td className="text-gray-700 py-2">{product_name}</td>
      <td className="text-gray-700 py-2">{fuel_type}</td>
      <td className="text-gray-700 py-2">{unit}</td>
      <td className="py-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{active ? 'Aktif' : 'Nonaktif'}</span>
      </td>
      <td className="py-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => onRequestEdit(id)} className="bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-md p-2 transition">
            <Pen className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onRequestDelete(id, product_name)} className="bg-white hover:bg-red-600 text-red-600 hover:text-white rounded-md p-2 transition">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
