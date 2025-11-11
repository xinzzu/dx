'use client';
import { useState } from 'react';

export function SummaryFilter() {
  const [userType, setUserType] = useState('semua');
  const [month, setMonth] = useState('semua');
  const [year, setYear] = useState('semua');

  const handleApply = () => {
    console.log({ userType, month, year });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Jenis Pengguna */}
      <select value={userType} onChange={(e) => setUserType(e.target.value)} className="w-[180px] border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
        <option value="semua">Semua Pengguna</option>
        <option value="individu">Individu</option>
        <option value="lembaga">Lembaga</option>
      </select>

      {/* Bulan */}
      <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-[150px] border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
        <option value="semua">Semua Bulan</option>
        <option value="januari">Januari</option>
        <option value="februari">Februari</option>
        <option value="maret">Maret</option>
        <option value="april">April</option>
        <option value="mei">Mei</option>
        <option value="juni">Juni</option>
        <option value="juli">Juli</option>
        <option value="agustus">Agustus</option>
        <option value="september">September</option>
        <option value="oktober">Oktober</option>
        <option value="november">November</option>
        <option value="desember">Desember</option>
      </select>

      {/* Tahun */}
      <select value={year} onChange={(e) => setYear(e.target.value)} className="w-[150px] border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
        <option value="semua">Semua Tahun</option>
        <option value="2024">2024</option>
        <option value="2025">2025</option>
        <option value="2026">2026</option>
      </select>

      {/* Tombol Terapkan Filter */}
      <button onClick={handleApply} className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-md transition-colors">
        Terapkan Filter
      </button>
    </div>
  );
}
