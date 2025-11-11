'use client';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  unit?: string;
  change?: string;
  changeType?: 'up' | 'down';
  note?: string;
}

export const StatCard = ({ title, value, unit, change, changeType, note }: StatCardProps) => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
      {unit && <div className="text-xs text-gray-500">{unit}</div>}

      {change && (
        <div className={`mt-2 text-xs flex items-center ${changeType === 'up' ? 'text-green-600' : changeType === 'down' ? 'text-red-500' : 'text-gray-400'}`}>
          {changeType === 'up' && <ArrowUpRight size={14} className="mr-1" />}
          {changeType === 'down' && <ArrowDownRight size={14} className="mr-1" />}
          {change}
        </div>
      )}

      {note && <div className="text-xs text-gray-500 mt-1">{note}</div>}
    </div>
  );
};
