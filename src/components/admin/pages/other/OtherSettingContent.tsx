'use client';
import { Puzzle } from 'lucide-react';
import { GridEmissionTable } from './GridEmissionTable';

export function OtherSettingContent() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Puzzle className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-700">Pengaturan Lain</h2>
      </div>

      {/* Satu Konten Langsung */}
      <div className="mb-6">
        <h3 className="px-4 py-2 font-medium border-b border-gray-200 text-amber-600">⚡ Grid Emission Factor</h3>
      </div>

      <GridEmissionTable />
    </div>
  );
}
