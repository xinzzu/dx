'use client';
import React from 'react';
import { Category, CategoryBadge } from './CategoryBadge';
import { formatCarbonFootprint } from '@/utils/carbonAnalysis';

interface Field {
  label: string;
  value: string | number;
  strong?: boolean;
}

interface RenewableInfo {
  type: string;
  production: string; // ex: '400 kWh'
}

export interface EmissionCardProps {
  category: Category;
  date: string; // ISO string or display date
  titleLeft?: string; // e.g. 'Kendaraan:' or 'Bangunan:'
  titleRight?: string; // e.g. 'Toyota Avanza G' / 'Rumah Tinggal Ahmad'
  fields: Field[];
  renewable?: RenewableInfo;
  emissionKg: number;
}

export function EmissionCard({ category, date, titleLeft, titleRight, fields, renewable, emissionKg }: EmissionCardProps) {
  return (
    <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
      <div className="flex items-start justify-between">
        <CategoryBadge category={category} />
        <span className="text-xs text-gray-500">{date}</span>
      </div>

      {titleLeft || titleRight ? (
        <div className="mt-3 grid grid-cols-2">
          <div className="text-sm text-gray-600">{titleLeft}</div>
          <div className="text-right text-sm font-semibold text-gray-900">{titleRight}</div>
        </div>
      ) : null}

      <div className="mt-2 grid grid-cols-2 gap-y-1">
        {fields.map((f, idx) => (
          <React.Fragment key={idx}>
            <div className="text-sm text-gray-600">{f.label}</div>
            <div className={`text-right text-sm ${f.strong ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>{f.value}</div>
          </React.Fragment>
        ))}
      </div>

      {renewable ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="text-sm font-semibold text-emerald-800">Energi Terbarukan</div>
          <div className="mt-1 grid grid-cols-2 text-sm">
            <div className="text-gray-600">Jenis:</div>
            <div className="text-right font-medium text-emerald-700">{renewable.type}</div>
            <div className="text-gray-600">Produksi:</div>
            <div className="text-right font-medium text-emerald-700">{renewable.production}</div>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Emisi:</span>
        <span className="text-sm font-semibold text-red-600">{formatCarbonFootprint(emissionKg).value} {formatCarbonFootprint(emissionKg).unit}</span>
      </div>
    </div>
  );
}
