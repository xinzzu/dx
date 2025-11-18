'use client';
import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';

interface EmissionFilterProps {
  onSearchChange?: (search: string) => void;
  initialSearch?: string;
}

export function EmissionFilter({ onSearchChange, initialSearch }: EmissionFilterProps) {
  // ✅ Langsung gunakan initialSearch sebagai initial state
  const [search, setSearch] = useState(initialSearch || '');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer saat unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);

    // Clear timer sebelumnya
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set timer baru: fetch setelah 500ms user berhenti mengetik
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange?.(value.trim());
    }, 1000);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 w-full">
      {/* Search */}
      <div className="relative min-w-[200px]">
        <Search className="absolute left-3 top-2.5 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Cari Nama Pengguna"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9 w-[330px] border border-gray-300 rounded-md py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
        />
      </div>

      {/* Tombol Ekspor */}
      <button type="button" className="ml-auto bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-md transition-colors">
        Ekspor XLSX
      </button>
    </div>
  );
}
