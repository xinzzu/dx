'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { Modal } from '@/components/ui/admin/modal';
import { EmissionFilter } from './EmissionSearch';
import { EmissionTable } from './EmissionTable';
import { StatCardEmission } from './StatCard';
import { SummaryFilter } from './SummaryFilter';
import { getDashboardOverview } from '@/lib/api/dashboardOverview';
import { getEmissionOverview } from '@/lib/api/userEmission';
import type { DashboardOverview } from '@/types/dashboardOverview';
import type { UserEmissionFilters, EmissionOverviewItem } from '@/types/userEmissionType';

export function EmissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const currentYear = now.getFullYear();

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false); // ✅ State modal
  const [filters, setFilters] = useState<UserEmissionFilters>({
    year: currentYear,
    month: 'semua',
    user_type: 'semua',
  });
  const [stats, setStats] = useState<DashboardOverview | null>(null);
  const [emissionOverview, setEmissionOverview] = useState<EmissionOverviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // ✅ Sync filters dari URL
  useEffect(() => {
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const userType = searchParams.get('user_type');
    const search = searchParams.get('search');

    setFilters({
      year: year ? (year === 'semua' ? 'semua' : Number(year)) : currentYear,
      month: month ? (month === 'semua' ? 'semua' : Number(month)) : 'semua',
      user_type: (userType as 'individu' | 'lembaga' | 'semua') || 'semua',
      search: search || undefined,
    });
  }, [searchParams, currentYear]);

  // ✅ Fetch dashboard stats
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

  // ✅ Fetch emission overview
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setOverviewLoading(true);
        const data = await getEmissionOverview({
          year: filters.year,
          month: filters.month,
        });
        if (mounted) setEmissionOverview(data);
      } catch (error) {
        console.error('Failed to fetch emission overview:', error);
      } finally {
        if (mounted) setOverviewLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [filters.year, filters.month]);

  const handleFilterChange = (newFilters: UserEmissionFilters) => {
    const updatedFilters = { ...filters, ...newFilters };

    const params = new URLSearchParams();
    if (updatedFilters.year && updatedFilters.year !== 'semua') {
      params.set('year', String(updatedFilters.year));
    }
    if (updatedFilters.month && updatedFilters.month !== 'semua') {
      params.set('month', String(updatedFilters.month));
    }
    if (updatedFilters.user_type && updatedFilters.user_type !== 'semua') {
      params.set('user_type', updatedFilters.user_type);
    }
    if (updatedFilters.search) {
      params.set('search', updatedFilters.search);
    }

    const queryString = params.toString();
    router.replace(`/admin/emissions${queryString ? `?${queryString}` : ''}`, { scroll: false });
  };

  const handleSearchChange = (search: string) => {
    handleFilterChange({ search });
  };

  const getEmissionByCategory = (category: string): EmissionOverviewItem | undefined => {
    return emissionOverview.find((item) => item.category === category);
  };

  // ✅ Format active filters untuk display
  const getActiveFiltersText = () => {
    const parts: string[] = [];
    if (filters.user_type && filters.user_type !== 'semua') {
      parts.push(filters.user_type === 'individu' ? 'Individu' : 'Lembaga');
    }
    if (filters.year && filters.year !== 'semua') parts.push(`Tahun ${filters.year}`);
    if (filters.month && filters.month !== 'semua') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      parts.push(monthNames[filters.month - 1]);
    }
    return parts.length > 0 ? parts.join(' • ') : 'Semua Data';
  };

  const totalEmissionsTons = stats?.total_emissions ?? 0;
  const listrik = getEmissionByCategory('listrik');
  const transportasi = getEmissionByCategory('transportasi');
  const makanan = getEmissionByCategory('makanan');
  const sampah = getEmissionByCategory('limbah');

  return (
    <div className="space-y-4">
      {/* ✅ Header dengan Filter Button */}
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

      {/* StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCardEmission title="Total Emisi" value={loading ? '...' : totalEmissionsTons.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} unit="ton CO₂e" />

        <StatCardEmission
          title="Total Emisi Listrik"
          value={overviewLoading ? '...' : (listrik?.total_tons ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="ton CO₂e"
          change={listrik ? `${listrik.comparison_percent.toFixed(1)}% dari bulan lalu` : undefined}
          changeType={listrik?.status === 'increase' ? 'up' : listrik?.status === 'decrease' ? 'down' : undefined}
        />

        <StatCardEmission
          title="Total Emisi Transportasi"
          value={overviewLoading ? '...' : (transportasi?.total_tons ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="ton CO₂e"
          change={transportasi ? `${transportasi.comparison_percent.toFixed(1)}% dari bulan lalu` : undefined}
          changeType={transportasi?.status === 'increase' ? 'up' : transportasi?.status === 'decrease' ? 'down' : undefined}
        />

        <StatCardEmission
          title="Total Emisi Makanan"
          value={overviewLoading ? '...' : (makanan?.total_tons ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="ton CO₂e"
          change={makanan ? `${makanan.comparison_percent.toFixed(1)}% dari bulan lalu` : undefined}
          changeType={makanan?.status === 'increase' ? 'up' : makanan?.status === 'decrease' ? 'down' : undefined}
        />

        <StatCardEmission
          title="Total Emisi Sampah"
          value={overviewLoading ? '...' : (sampah?.total_tons ?? 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          unit="ton CO₂e"
          change={sampah ? `${sampah.comparison_percent.toFixed(1)}% dari bulan lalu` : undefined}
          changeType={sampah?.status === 'increase' ? 'up' : sampah?.status === 'decrease' ? 'down' : undefined}
        />
      </div>

      {/* Emission Table */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 space-y-4 shadow-sm">
        <EmissionFilter key={filters.search || 'no-search'} onSearchChange={handleSearchChange} initialSearch={filters.search} />
        <EmissionTable filters={filters} />
      </div>

      {/* ✅ Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filter Data Emisi">
        <SummaryFilter onFilterChange={handleFilterChange} onClose={() => setIsFilterModalOpen(false)} initialFilters={filters} />
      </Modal>
    </div>
  );
}
