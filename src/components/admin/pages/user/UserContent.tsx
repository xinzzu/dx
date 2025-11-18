'use client';
import { useEffect, useState } from 'react';
import { UserFilter } from './UserFilter';
import { UserTable } from './UserTable';
import { StatCardUser } from './StatCard';
import { getDashboardOverview } from '@/lib/api/dashboardOverview';
import type { DashboardOverview } from '@/types/dashboardOverview';
import type { UserFilters } from '@/types/userType';

export function UserContent() {
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    user_type: 'semua',
    search: '',
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getDashboardOverview();
        if (mounted) setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard overview:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleFilterChange = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardUser title="Total Pengguna" value={loading ? '...' : stats?.total_user.toLocaleString('id-ID') || '0'} change="Pengguna" />
        <StatCardUser title="Lembaga" value={loading ? '...' : stats?.total_institution_user.toLocaleString('id-ID') || '0'} change="Pengguna" />
        <StatCardUser title="Individu" value={loading ? '...' : stats?.total_individual_user.toLocaleString('id-ID') || '0'} change="Pengguna" />
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
        <UserFilter onFilterChange={handleFilterChange} initialFilters={filters} />
        <UserTable filters={filters} />
      </div>
    </div>
  );
}
