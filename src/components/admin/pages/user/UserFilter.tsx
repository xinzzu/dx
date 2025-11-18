'use client';
import { Search, Plus } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { UserFilters } from '@/types/userType';

interface UserFilterProps {
  onFilterChange?: (filters: Partial<UserFilters>) => void;
  initialFilters?: Partial<UserFilters>;
}

export function UserFilter({ onFilterChange, initialFilters }: UserFilterProps) {
  const [selectedType, setSelectedType] = useState<'semua' | 'individu' | 'lembaga'>((initialFilters?.user_type as 'semua' | 'individu' | 'lembaga') || 'semua');
  const [searchName, setSearchName] = useState(initialFilters?.search || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer saat unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleTypeChange = (type: 'semua' | 'individu' | 'lembaga') => {
    setSelectedType(type);
    onFilterChange?.({ user_type: type, search: searchName });
  };

  const handleSearchChange = (value: string) => {
    setSearchName(value);

    // Clear timer sebelumnya
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set timer baru: fetch setelah 500ms user berhenti mengetik
    debounceTimerRef.current = setTimeout(() => {
      onFilterChange?.({ user_type: selectedType, search: value.trim() });
    }, 1000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[200px]">
        <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Cari Nama Pengguna"
          value={searchName}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9 w-[330px] rounded-md border border-gray-300 bg-white py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
        />
      </div>

      {/* Jenis Pengguna */}
      <select
        value={selectedType}
        onChange={(e) => handleTypeChange(e.target.value as 'semua' | 'individu' | 'lembaga')}
        className="w-[180px] rounded-md border border-gray-300 bg-white py-2 px-3 text-sm text-gray-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition"
      >
        <option value="semua">Semua Pengguna</option>
        <option value="individu">Individu</option>
        <option value="lembaga">Lembaga</option>
      </select>

      {/* Tombol Tambah User */}
      <button type="button" className="ml-auto flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium py-2 px-4 rounded-md transition">
        <Plus className="w-4 h-4" />
        Tambah User
      </button>
    </div>
  );
}
