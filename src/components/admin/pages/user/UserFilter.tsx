'use client';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function UserFilter() {
  const [selectedType, setSelectedType] = useState('semua');

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[200px]">
        <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Cari Nama Pengguna"
          className="pl-9 w-[330px] rounded-md border border-gray-300 bg-white py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
        />
      </div>

      {/* Jenis Pengguna */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="w-[180px] rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
      >
        <option value="semua">Semua Pengguna</option>
        <option value="individu">Individu</option>
        <option value="lembaga">Lembaga</option>
        <option value="admin">Admin</option>
      </select>
    </div>
  );
}
