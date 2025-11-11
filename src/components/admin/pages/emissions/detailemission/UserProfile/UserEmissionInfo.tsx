'use client';

import { User, Building2 } from 'lucide-react';

interface UserEmissionInfoProps {
  name: string;
  id: string;
  type: string;
  date_joined: string;
  total_emission: number;
  address: string;
}

export function UserEmissionInfo({ name, id, type, date_joined, total_emission, address }: UserEmissionInfoProps) {
  const isIndividu = type.toLowerCase() === 'individu';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {isIndividu ? <User className="bg-emerald-100 text-emerald-600 p-2 rounded-full w-10 h-10" /> : <Building2 className="bg-indigo-100 text-indigo-600 p-2 rounded-full w-10 h-10" />}
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isIndividu ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700'}`}>{type}</span>
              <span className="text-sm text-gray-500">ID: {id}</span>
              <span className="text-sm text-gray-500">Bergabung: {date_joined}</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-500">Total Emisi</p>
          <p className="text-3xl font-bold text-red-600">{total_emission.toFixed(2)}</p>
          <p className="text-sm text-gray-500">kg CO₂e</p>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="font-medium text-gray-800 mb-1">Alamat</h3>
        <p className="text-sm text-gray-600">{address}</p>
      </div>
    </div>
  );
}
