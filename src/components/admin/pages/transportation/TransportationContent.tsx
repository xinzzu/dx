'use client';
import { useState } from 'react';
import { CarFront } from 'lucide-react';
import { FuelProductTable } from './FuelProductTable';
import { FuelPriceTable } from './FuelPriceTable';
import { EmissionTable } from './EmissionTable';

export function TransportationContent() {
  const [activeTab, setActiveTab] = useState<'fuel' | 'price' | 'emission'>('fuel');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <CarFront className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold text-gray-700">Kategori Transportasi</h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-6">
        <button onClick={() => setActiveTab('fuel')} className={`px-4 py-2 font-medium rounded-t-md ${activeTab === 'fuel' ? 'bg-white border border-b-0 border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          ⛽ Bahan Bakar
        </button>

        <button onClick={() => setActiveTab('price')} className={`px-4 py-2 font-medium rounded-t-md ${activeTab === 'price' ? 'bg-white border border-b-0 border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          💰 Harga Bahan Bakar
        </button>

        <button onClick={() => setActiveTab('emission')} className={`px-4 py-2 font-medium rounded-t-md ${activeTab === 'emission' ? 'bg-white border border-b-0 border-gray-200 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
          🌿 Nilai Emisi
        </button>
      </div>

      {/* Tab Content */}
      <div>{activeTab === 'fuel' ? <FuelProductTable /> : activeTab === 'price' ? <FuelPriceTable /> : <EmissionTable />}</div>
    </div>
  );
}
