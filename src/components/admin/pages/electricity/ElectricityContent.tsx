'use client';
import { useState } from 'react';
import { Zap } from 'lucide-react';
import { GolonganListrikTable } from './GolonganListrikTable';
import { ElectricityTable } from './ElectricityTable';

export function ElectricityContent() {
  const [activeTab, setActiveTab] = useState<'group' | 'emission'>('group');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-700">Kategori Listrik</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('group')} className={`px-4 py-2 font-medium rounded-t-md ${activeTab === 'group' ? 'bg-white border border-b-0 border-gray-200 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}>
          ⚡ Golongan Listrik
        </button>

        <button onClick={() => setActiveTab('emission')} className={`px-4 py-2 font-medium rounded-t-md ${activeTab === 'emission' ? 'bg-white border border-b-0 border-gray-200 text-amber-600' : 'text-gray-500 hover:text-gray-700'}`}>
          📊 Nilai Emisi
        </button>
      </div>

      {/* Tab Content */}
      <div>{activeTab === 'group' ? <GolonganListrikTable /> : <ElectricityTable />}</div>
    </div>
  );
}
