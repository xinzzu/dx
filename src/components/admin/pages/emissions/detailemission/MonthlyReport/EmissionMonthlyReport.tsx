'use client';
import React, { useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import { EmissionCard, EmissionCardProps } from './EmissionCard';
import { MonthYearFilter } from './MonthYearFilter';

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(date);
}

export function EmissionMonthlyReport() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Dummy data (tidak difilter, hanya tampil sesuai data yang ada)
  const items: EmissionCardProps[] = useMemo(
    () => [
      {
        category: 'Transportasi',
        date: '01/11/2025',
        titleLeft: 'Kendaraan:',
        titleRight: 'Toyota Avanza G',
        fields: [
          { label: 'Bahan Bakar:', value: 'Pertalite', strong: true },
          { label: 'Biaya:', value: 'Rp 800.000' },
          { label: 'Estimasi Liter:', value: '80 L', strong: true },
        ],
        emissionKg: 180.4,
      },
      {
        category: 'Energi Listrik',
        date: '01/11/2025',
        titleLeft: 'Bangunan:',
        titleRight: 'Rumah Tinggal Ahmad',
        fields: [
          { label: 'Biaya Listrik:', value: 'Rp 600.000' },
          { label: 'Estimasi kWh:', value: '400 kWh', strong: true },
        ],
        renewable: { type: 'Panel Surya', production: '400 kWh' },
        emissionKg: 30.2,
      },
      {
        category: 'Konsumsi Makanan',
        date: '07/11/2025',
        fields: [
          { label: 'Periode Laporan:', value: 'Mingguan', strong: true },
          { label: 'Sapi:', value: '1–3 kali seminggu' },
          { label: 'Unggas:', value: '4–5 kali seminggu' },
          { label: 'Nasi:', value: 'Setiap hari' },
          { label: 'Telur:', value: '4–5 kali seminggu' },
        ],
        emissionKg: 9.45,
      },
      {
        category: 'Produksi Sampah',
        date: '07/11/2025',
        fields: [
          { label: 'Periode Laporan:', value: 'Mingguan', strong: true },
          { label: 'Plastik:', value: '4 kg' },
          { label: 'Kertas & Karton:', value: '5 kg' },
          { label: 'Logam:', value: '1 kg' },
          { label: 'Limbah Berbahaya (B3):', value: '2 kg' },
        ],
        emissionKg: 9.45,
      },
    ],
    []
  );

  const monthTotal = useMemo(() => items.reduce((sum, it) => sum + it.emissionKg, 0), [items]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-800 font-semibold">Laporan Emisi per Bulan</h3>
        </div>

        {/* Filter bulan & tahun dipisah jadi komponen */}
        <MonthYearFilter month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">{formatMonthYear(new Date(year, (month || 1) - 1, 1))}</h4>
          <div className="text-right">
            <div className="text-xs text-gray-500">Total Emisi Bulan Ini</div>
            <div className="text-rose-600 text-2xl font-bold">{monthTotal.toFixed(2)} kg CO₂e</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it, idx) => (
            <EmissionCard key={idx} {...it} />
          ))}
        </div>
      </div>
    </section>
  );
}
