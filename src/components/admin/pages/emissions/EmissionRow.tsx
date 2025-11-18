'use client';
import { User, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { UserEmission } from '@/types/userEmissionType';

interface EmissionRowProps extends UserEmission {
  detailUrl?: string;
}

export function EmissionRow({ user_id, name, user_type, total_emisi_tons, avg_monthly_emisi_tons, detailUrl }: EmissionRowProps) {
  const router = useRouter();
  const handleNavigate = () => {
    // ✅ Ubah fallback URL dengan /detail/
    const url = detailUrl || `/admin/emissions/detail/${user_id}`;
    console.log('🔗 Navigating to:', url); // Debug
    router.push(url);
  };
  const isIndividu = user_type === 'Individu';

  return (
    <tr className="border-b last:border-none border-gray-200">
      {/* Pengguna */}
      <td className="py-3 flex items-center gap-3">
        {isIndividu ? <User className="bg-emerald-100 text-emerald-600 p-2 rounded-full w-8 h-8" /> : <Building2 className="bg-indigo-100 text-indigo-600 p-2 rounded-full w-8 h-8" />}
        <span className="font-medium text-gray-700">{name}</span>
      </td>

      {/* Jenis */}
      <td>
        <span className={`px-3 py-2 text-xs rounded-md ${isIndividu ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>{user_type}</span>
      </td>

      {/* Total Emisi */}
      <td className="text-gray-700 font-medium">{total_emisi_tons}</td>

      {/* Rata-rata Emisi */}
      <td className="text-gray-700 font-medium">{avg_monthly_emisi_tons}</td>

      {/* Aksi */}
      <td>
        <button type="button" onClick={handleNavigate} className="bg-emerald-500 text-white hover:bg-emerald-600 text-xs px-3 py-2 rounded-md transition inline-block">
          Lihat Detail
        </button>
      </td>
    </tr>
  );
}
