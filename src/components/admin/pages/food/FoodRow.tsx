'use client';
import { Pen, TrashIcon } from 'lucide-react';
import { FoodTypes } from '@/types/foodType';

interface FoodRowProps extends FoodTypes {
  onRequestDelete: (id: string, name: string) => void;
  onRequestEdit: (id: string) => void;
}

export function FoodRow({ id, name, unit, co2e_per_unit, average_serving_size_g, active, onRequestDelete, onRequestEdit }: FoodRowProps) {
  return (
    <tr className="border-b border-gray-200 last:border-none">
      <td className="text-gray-700 py-2">{name}</td>
      <td className="text-gray-700 py-2">{average_serving_size_g}</td>
      <td className="text-gray-700 py-2">{unit}</td>
      <td className="text-gray-700 py-2">{co2e_per_unit}</td>

      <td className="py-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{active ? 'Aktif' : 'Nonaktif'}</span>
      </td>
      <td className="py-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => onRequestEdit(String(id))} className="bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-md p-2 transition">
            <Pen className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => onRequestDelete(String(id), name)} className="bg-white hover:bg-red-600 text-red-600 hover:text-white rounded-md p-2 transition">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
