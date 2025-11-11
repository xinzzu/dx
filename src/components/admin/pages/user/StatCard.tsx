'use client';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
}

export const StatCardUser = ({ title, value, change }: StatCardProps) => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <div className="text-2xl font-semibold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500">{change}</div>
    </div>
  );
};
