'use client';

import { useEffect, useState } from 'react';
import { User, Building2 } from 'lucide-react';
import { getProvinceName, getRegencyName, getDistrictName, getVillageName } from '@/lib/api/region';
import type { UserProfile } from '@/types/userDetailEmissionType';

interface UserEmissionInfoProps {
  profile: UserProfile | null;
  headerTotalEmisi: number;
  loading?: boolean;
}

function formatJoinDate(dateStr: string): string {
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  return d.toLocaleDateString('id-ID', options);
}

export function UserEmissionInfo({ profile, headerTotalEmisi, loading = false }: UserEmissionInfoProps) {
  const [fullAddress, setFullAddress] = useState<string>('-');

  useEffect(() => {
    if (!profile?.address) return;

    (async () => {
      try {
        // Format address: "id3171090002, id3171090, id3171, id31"
        const codes = profile.address.split(', ').map((s) => s.trim());
        const [villageCode, districtCode, regencyCode, provinceCode] = codes;

        const [villageName, districtName, regencyName, provinceName] = await Promise.all([
          getVillageName(villageCode, districtCode),
          getDistrictName(districtCode, regencyCode),
          getRegencyName(regencyCode, provinceCode),
          getProvinceName(provinceCode),
        ]);

        setFullAddress([villageName, districtName, regencyName, provinceName].filter(Boolean).join(', '));
      } catch (error) {
        console.error('Failed to resolve address:', error);
        setFullAddress(profile.address);
      }
    })();
  }, [profile?.address]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    );
  }

  if (!profile) return null;

  const isIndividu = profile.user_type === 'individu';
  const formattedEmission = headerTotalEmisi.toLocaleString('id-ID', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isIndividu ? <User className="bg-emerald-100 text-emerald-600 p-2 rounded-full w-10 h-10" /> : <Building2 className="bg-indigo-100 text-indigo-600 p-2 rounded-full w-10 h-10" />}

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-800">{profile.name}</h2>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isIndividu ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{isIndividu ? 'Individu' : 'Lembaga'}</span>
            </div>

            <div className="mt-1">
              <p className="text-sm text-gray-500">Email: {profile.email}</p>
              <p className="text-sm text-gray-500">Bergabung: {formatJoinDate(profile.joined_date)}</p>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Total Emisi</p>
          <p className="text-3xl font-bold text-red-600">{formattedEmission}</p>
          <p className="text-sm text-gray-500">ton CO₂e</p>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="font-medium text-gray-800 mb-1">Alamat</h3>
        <p className="text-sm text-gray-600">{fullAddress}</p>
      </div>
    </div>
  );
}
