'use client';
import { useState } from 'react';
import { EmissionFilter } from './EmissionFilter';
import { EmissionTable } from './EmissionTable';
import { EmissionPagination } from './EmissionPagination';
import { emissionUser } from '@/data/EmissionUser';
import { StatCardEmission } from './StatCard';
import { SummaryFilter } from './SummaryFilter';

export function EmissionContent() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(emissionUser.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = emissionUser.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="space-y-4">
      <SummaryFilter />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCardEmission title="Total Emisi Listrik" value="2.847.593" unit="CO2e (ton)" change="+12.3% dari bulan lalu" changeType="up" />
        <StatCardEmission title="Total Emisi Transportasi" value="1.847.593" unit="CO2e (ton)" change="+12.3% dari bulan lalu" changeType="up" />
        <StatCardEmission title="Total Emisi Sampah" value="3.847.593" unit="CO2e (ton)" change="-12.3% dari bulan lalu" changeType="down" />
        <StatCardEmission title="Total Emisi Makanan" value="2.147.593" unit="CO2e (ton)" change="-12.3% dari bulan lalu" changeType="down" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
        <EmissionFilter />
        <EmissionTable />
      </div>
      <EmissionPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </div>
  );
}
