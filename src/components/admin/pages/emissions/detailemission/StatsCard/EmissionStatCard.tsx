import { ReactNode } from 'react';

interface EmissionStatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit: string;
  color?: string; // opsional untuk background icon
}

export function EmissionStatsCard({ icon, label, value, unit, color = 'bg-gray-100' }: EmissionStatsCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow transition-all">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{unit}</p>
      </div>
    </div>
  );
}
