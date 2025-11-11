'use client';
import React from 'react';

export type Category = 'Transportasi' | 'Energi Listrik' | 'Konsumsi Makanan' | 'Produksi Sampah';

export function CategoryBadge({ category }: { category: Category }) {
  const colorMap: Record<Category, string> = {
    Transportasi: 'bg-blue-100 text-blue-700',
    'Energi Listrik': 'bg-yellow-100 text-yellow-700',
    'Konsumsi Makanan': 'bg-green-100 text-green-700',
    'Produksi Sampah': 'bg-purple-100 text-purple-700',
  };

  return <span className={`inline-flex items-center text-xs font-medium px-3 py-1 rounded-full ${colorMap[category]}`}>{category}</span>;
}
