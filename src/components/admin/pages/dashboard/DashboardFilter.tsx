'use client';
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getProvinces } from '@/lib/api/region';
import type { DashboardFilters } from '@/types/dashboardType';

interface DashboardFilterProps {
  onFilterChange?: (filters: DashboardFilters) => void;
  onClose?: () => void; // ✅ Tambah onClose untuk tutup modal
  initialFilters?: DashboardFilters; // ✅ Untuk pre-fill nilai saat modal dibuka
}

export function DashboardFilter({ onFilterChange, onClose, initialFilters }: DashboardFilterProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const MAX_PROVINCES = 5;

  const [userType, setUserType] = useState<'semua' | 'individu' | 'lembaga'>(initialFilters?.user_type || 'semua');
  const [month, setMonth] = useState<number | 'semua'>(initialFilters?.month || 'semua');
  const [year, setYear] = useState<number | 'semua'>(initialFilters?.year || currentYear);
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>(initialFilters?.provinces || []);
  const [isProvinceOpen, setIsProvinceOpen] = useState(false);

  const [provinces, setProvinces] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoadingProvinces(true);
        const provincesData = await getProvinces();
        const provinceList = Object.entries(provincesData).map(([code, name]) => ({
          id: code,
          name: name,
        }));
        setProvinces(provinceList);
      } catch (error) {
        console.error('Failed to fetch provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    })();
  }, []);

  const toggleProvince = (provinceId: string) => {
    setSelectedProvinces((prev) => {
      const isSelected = prev.includes(provinceId);
      if (isSelected) {
        return prev.filter((p) => p !== provinceId);
      }
      if (prev.length >= MAX_PROVINCES) {
        alert(`Maksimal ${MAX_PROVINCES} provinsi yang dapat dipilih`);
        return prev;
      }
      return [...prev, provinceId];
    });
  };

  const handleApply = () => {
    const filters: DashboardFilters = {
      user_type: userType,
      month: month,
      year: year,
      provinces: selectedProvinces.length > 0 ? selectedProvinces : undefined,
    };
    onFilterChange?.(filters);
    onClose?.(); // ✅ Tutup modal setelah apply
  };

  const handleReset = () => {
    setUserType('semua');
    setMonth('semua');
    setYear(currentYear);
    setSelectedProvinces([]);
  };

  return (
    <div className="space-y-4">
      {/* Jenis Pengguna */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Pengguna</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value as 'semua' | 'individu' | 'lembaga')}
          className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
        >
          <option value="semua">Semua Pengguna</option>
          <option value="individu">Individu</option>
          <option value="lembaga">Lembaga</option>
        </select>
      </div>

      {/* Bulan & Tahun */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="semua">Semua Bulan</option>
            <option value="1">Januari</option>
            <option value="2">Februari</option>
            <option value="3">Maret</option>
            <option value="4">April</option>
            <option value="5">Mei</option>
            <option value="6">Juni</option>
            <option value="7">Juli</option>
            <option value="8">Agustus</option>
            <option value="9">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value === 'semua' ? 'semua' : Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* Provinsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Provinsi (Max {MAX_PROVINCES})</label>
        <div className="relative">
          <button type="button" onClick={() => setIsProvinceOpen((p) => !p)} className="w-full flex justify-between items-center border border-gray-300 rounded-md py-2 px-3 text-sm bg-white focus:ring-2 focus:ring-emerald-500">
            <span className="truncate">{selectedProvinces.length > 0 ? `${selectedProvinces.length}/${MAX_PROVINCES} provinsi dipilih` : loadingProvinces ? 'Memuat provinsi...' : `Pilih Provinsi (Max ${MAX_PROVINCES})`}</span>
            <ChevronDown className={`w-4 h-4 text-black transition-transform ${isProvinceOpen ? 'rotate-180' : ''}`} />
          </button>

          {isProvinceOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {loadingProvinces ? (
                <div className="px-3 py-2 text-sm text-gray-500">Memuat provinsi...</div>
              ) : provinces.length > 0 ? (
                <>
                  <div className="sticky top-0 bg-gray-50 px-3 py-2 text-xs text-gray-600 border-b">
                    Maksimal {MAX_PROVINCES} provinsi ({selectedProvinces.length} dipilih)
                  </div>
                  {provinces.map((province) => {
                    const isSelected = selectedProvinces.includes(province.id);
                    const isDisabled = !isSelected && selectedProvinces.length >= MAX_PROVINCES;
                    return (
                      <label key={province.id} className={`flex items-center px-3 py-2 text-sm ${isDisabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}`}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleProvince(province.id)} disabled={isDisabled} className="mr-2 rounded text-emerald-600 focus:ring-emerald-500 disabled:opacity-50" />
                        {province.name}
                      </label>
                    );
                  })}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">Tidak ada data provinsi</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-300">
        <button onClick={handleReset} className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          Reset
        </button>
        <button onClick={handleApply} className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md transition-colors">
          Terapkan Filter
        </button>
      </div>
    </div>
  );
}
