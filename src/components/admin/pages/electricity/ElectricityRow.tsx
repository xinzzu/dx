'use client';
import { Pen, Trash2 } from 'lucide-react';

interface ElectricityEmissionRowProps {
  id: string;
  category_id: string;
  power_capacity_label: string;
  min_power_va: number;
  max_power_va: number;
  rate_per_kwh: number;
  active: boolean;
  onRequestEdit: (id: string) => void;
  onRequestDelete: (id: string) => void;
}

export function ElectricityRow({ id, power_capacity_label, min_power_va, max_power_va, rate_per_kwh, active, onRequestEdit, onRequestDelete }: ElectricityEmissionRowProps) {
  return (
    <tr className="border-b border-gray-200 last:border-none hover:bg-gray-50 transition-colors">
      <td className="px-5 py-3 text-gray-800 font-medium">{power_capacity_label}</td>
      <td className="px-3 py-3 text-gray-700">{min_power_va}</td>
      <td className="px-3 py-3 text-gray-700">{max_power_va}</td>
      <td className="px-3 py-3 text-gray-700">{rate_per_kwh.toLocaleString('id-ID')}</td>
      <td className="px-3 py-3">
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{active ? 'Aktif' : 'Nonaktif'}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <div className="flex justify-center gap-2">
          <button type="button" onClick={() => onRequestEdit(id)} className="p-2 rounded-md text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition" aria-label="Edit data" title="Edit Data">
            <Pen className="w-4 h-4" />
          </button>
          <button type="button" onClick={() => onRequestDelete(id)} className="p-2 rounded-md text-red-600 hover:bg-red-100 hover:text-red-700 transition" aria-label="Hapus data" title="Hapus Data">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
