'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Modal } from '@/components/ui/admin/modal';
import { StatCard } from './StatCard';
import { TrendEmisiLineChart } from './LineChartEmisi';
import { DistribusiDonutChart } from './DonutChartEmisi';
import { TopProvinsiCard } from './TopProvinsiChart';
import { DashboardFilter } from './DashboardFilter';
import { getDashboardMainOverview } from '@/lib/api/dashboard';
import type { DashboardMainOverview, DashboardFilters } from '@/types/dashboardType';

export function DashboardContent() {
  const [data, setData] = useState<DashboardMainOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // ✅ State modal
  const [filters, setFilters] = useState<DashboardFilters>({
    year: new Date().getFullYear(),
    month: 'semua',
    user_type: 'semua',
    provinces: [],
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const overview = await getDashboardMainOverview(filters);
        if (mounted) setData(overview);
      } catch (error) {
        console.error('Failed to fetch dashboard overview:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [filters]);

  const handleFilterChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  const formatComparison = (comparison: number, status: string) => {
    if (status === 'same') return 'Tidak ada perubahan';
    const sign = status === 'increase' ? '+' : '-';
    return `${sign}${comparison.toFixed(1)}% dari bulan lalu`;
  };

  const getChangeType = (status: string): 'up' | 'down' | undefined => {
    if (status === 'increase') return 'up';
    if (status === 'decrease') return 'down';
    return undefined;
  };

  // ✅ Format active filters untuk display
  const getActiveFiltersText = () => {
    const parts: string[] = [];
    if (filters.year && filters.year !== 'semua') parts.push(`Tahun ${filters.year}`);
    if (filters.month && filters.month !== 'semua') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      parts.push(monthNames[filters.month - 1]);
    }
    if (filters.provinces && filters.provinces.length > 0) {
      parts.push(`${filters.provinces.length} provinsi`);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Semua Data';
  };

  return (
    <div className="space-y-4">
      {/* ✅ Filter Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-gray-600">Filter:</h1>
          <span className="text-sm text-gray-500">({getActiveFiltersText()})</span>
        </div>
        <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-md transition-colors">
          <Filter className="w-4 h-4" />
          Filter Data
        </button>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Emisi Karbon"
          value={loading ? '...' : data?.overview_cards.total_emisi.value_tons?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}
          unit="ton CO₂e"
          change={loading ? '' : formatComparison(data?.overview_cards.total_emisi.comparison_percent || 0, data?.overview_cards.total_emisi.status || 'same')}
          changeType={loading ? undefined : getChangeType(data?.overview_cards.total_emisi.status || 'same')}
        />

        <StatCard
          title="Total Pengguna"
          value={loading ? '...' : data?.overview_cards.total_pengguna.value_count?.toLocaleString('id-ID') || '0'}
          unit="pengguna"
          change={loading ? '' : formatComparison(data?.overview_cards.total_pengguna.comparison_percent || 0, data?.overview_cards.total_pengguna.status || 'same')}
          changeType={loading ? undefined : getChangeType(data?.overview_cards.total_pengguna.status || 'same')}
        />

        <StatCard
          title="Rata-rata Emisi Provinsi"
          value={loading ? '...' : data?.overview_cards.avg_emisi_provinsi.value_tons_per_month?.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}
          unit="ton CO₂e/bulan"
          change={loading ? '' : formatComparison(data?.overview_cards.avg_emisi_provinsi.comparison_percent || 0, data?.overview_cards.avg_emisi_provinsi.status || 'same')}
          changeType={loading ? undefined : getChangeType(data?.overview_cards.avg_emisi_provinsi.status || 'same')}
        />

        <StatCard
          title="Kategori Dominan"
          value={loading ? '...' : data?.overview_cards.kategori_dominan.value_name?.charAt(0).toUpperCase() + (data?.overview_cards.kategori_dominan.value_name?.slice(1) || '') || '-'}
          unit={loading ? '' : `${data?.overview_cards.kategori_dominan.percentage?.toFixed(0)}% kontribusi`}
          note="Tertinggi Nasional"
        />
      </div>

      {/* Row 2: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopProvinsiCard data={data?.top_provinces || []} loading={loading} />
        <DistribusiDonutChart data={data?.category_distribution || []} loading={loading} />
      </div>

      {/* Row 3: Line Chart */}
      <TrendEmisiLineChart year={filters.year} />

      {/* ✅ Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Dashboard">
        <DashboardFilter onFilterChange={handleFilterChange} onClose={() => setIsFilterModalOpen(false)} initialFilters={filters} />
      </Modal>
    </div>
  );
}
