'use client';
import React from 'react';

interface MonthYearFilterProps {
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export function MonthYearFilter({ month, year, onMonthChange, onYearChange }: MonthYearFilterProps) {
  const now = new Date();

  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  return (
    <div className="flex items-center gap-3">
      <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={month} onChange={(e) => onMonthChange(parseInt(e.target.value, 10))}>
        <option value="">Semua Bulan</option>
        {monthOptions.map((m) => (
          <option key={m} value={m}>
            {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2025, m - 1, 1))}
          </option>
        ))}
      </select>

      <select className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" value={year} onChange={(e) => onYearChange(parseInt(e.target.value, 10))}>
        <option value="">Semua Tahun</option>
        {yearOptions.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}
