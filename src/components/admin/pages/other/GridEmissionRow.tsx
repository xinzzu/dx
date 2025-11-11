'use client';
import { Pen, TrashIcon } from 'lucide-react';

interface GridEmissionRowProps {
  id: string;
  region_name: string;
  co2e_per_kwh: number;
  active: boolean;
  onRequestEdit: (id: string) => void;
  onRequestDelete: (id: string, name: string) => void;
}

export function GridEmissionRow({ id, region_name, co2e_per_kwh, active, onRequestEdit, onRequestDelete }: GridEmissionRowProps) {
  return (
    <tr className="border-b last:border-none border-gray-200">
      <td className="text-gray-700 py-2">{region_name}</td>
      <td className="text-gray-700 py-2">{co2e_per_kwh}</td>
      <td className="py-2">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{active ? 'Aktif' : 'Nonaktif'}</span>
      </td>
      <td className="py-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => onRequestEdit(id)} className="bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-md p-2 transition" aria-label="Edit data">
            <Pen className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onRequestDelete(id, region_name)} className="bg-white hover:bg-red-600 text-red-600 hover:text-white rounded-md p-2 transition" aria-label="Hapus data">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
