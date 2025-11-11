import { User, Building2 } from 'lucide-react';
import { EmissionRecord } from '@/types/emission';
import Link from 'next/link';

export function EmissionRow({ id, name, type, emission, emission_avg }: EmissionRecord) {
  const isIndividu = type === 'Individu';

  return (
    <tr className="border-b border-gray-200 last:border-none">
      {/* Nama */}
      <td className="py-3 flex items-center gap-3">
        {isIndividu ? <User className="bg-emerald-100 text-emerald-600 p-2 rounded-full w-8 h-8" /> : <Building2 className="bg-indigo-100 text-indigo-600 p-2 rounded-full w-8 h-8" />}
        <span className="font-medium text-gray-700">{name}</span>
      </td>

      {/* Jenis */}
      <td>
        <span className={`px-3 py-2 text-xs rounded-md ${isIndividu ? 'bg-gray-100 text-gray-800' : 'bg-black text-white'}`}>{type}</span>
      </td>

      {/* Total Emisi */}
      <td className="text-gray-700 font-medium">{emission}</td>

      {/* Rata-rata Emisi */}
      <td className="text-gray-700 font-medium">{emission_avg}</td>

      {/* Aksi */}
      <td>
        <Link href={`/admin/emissions/detail/${encodeURIComponent(String(id))}`} className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-3 py-2 rounded-md transition inline-block">
          Lihat Detail
        </Link>
      </td>
    </tr>
  );
}
