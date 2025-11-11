'use client';
import React, { useState } from 'react';

interface YearFilterProps {
  onChange?: (year: number) => void;
}

export function YearFilter({ onChange }: YearFilterProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const yearOptions = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedYear = parseInt(e.target.value, 10);
    setYear(selectedYear);
    onChange?.(selectedYear);
  };

  return (
    <select className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700" value={year} onChange={handleChange}>
      {yearOptions.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  );
}
