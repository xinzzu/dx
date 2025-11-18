'use client';
import { useEffect, useState } from 'react';
import { Database } from 'lucide-react';
import { EmissionRow } from './EmissionRow';
import { Pagination } from '@/components/admin/layout/Pagination';
import { getUserEmissions } from '@/lib/api/userEmission';
import type { UserEmission, UserEmissionFilters } from '@/types/userEmissionType';

const PER_PAGE = 10;

interface EmissionTableProps {
  filters?: UserEmissionFilters;
}

export function EmissionTable({ filters = {} }: EmissionTableProps) {
  const [rows, setRows] = useState<UserEmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEmissions = async (page: number) => {
    setLoading(true);
    setError(null);

    console.log('📊 EmissionTable fetching with filters:', filters);

    try {
      const res = await getUserEmissions({
        ...filters,
        page,
        per_page: PER_PAGE,
      });

      console.log('✅ EmissionTable fetched data:', res.data.length, 'items');

      setRows(res.data);
      setTotalPages(res.pagination.total_pages || 1);
      setTotalItems(res.pagination.total_items || 0);
      setCurrentPage(res.pagination.current_page || page);
    } catch (e) {
      console.error('❌ EmissionTable fetch error:', e);
      setError(e instanceof Error ? e.message : 'Gagal memuat data emisi');
      setRows([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Tambahkan stabilization check
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Mark as initialized setelah first render
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // ✅ Hanya fetch jika sudah initialized (menghindari fetch dengan default state)
    if (isInitialized) {
      fetchEmissions(currentPage);
    }
  }, [currentPage, filters, isInitialized]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Build query string untuk dibawa ke detail page
  const getDetailUrl = (userId: string) => {
    const params = new URLSearchParams();
    if (filters.year && filters.year !== 'semua') params.set('year', String(filters.year));
    if (filters.month && filters.month !== 'semua') params.set('month', String(filters.month));
    if (filters.user_type && filters.user_type !== 'semua') params.set('user_type', filters.user_type);

    const queryString = params.toString();
    const url = `/admin/emissions/detail/${userId}${queryString ? `?${queryString}` : ''}`;

    return url;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-700">Data Emisi</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">{loading ? 'Memuat data...' : `Menampilkan ${rows.length} dari ${totalItems} data`}</p>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-left border-b border-gray-200">
            <tr>
              <th className="pb-2">Pengguna</th>
              <th className="pb-2">Jenis</th>
              <th className="pb-2">Total Emisi (ton CO₂e)</th>
              <th className="pb-2">Rata-rata Emisi per Bulan (ton CO₂e)</th>
              <th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-red-500">
                  {error}
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <EmissionRow
                  key={row.user_id}
                  user_id={row.user_id}
                  name={row.name}
                  user_type={row.user_type}
                  total_emisi_tons={Number(row.total_emisi_tons.toFixed(2))}
                  avg_monthly_emisi_tons={Number(row.avg_monthly_emisi_tons.toFixed(2))}
                  detailUrl={getDetailUrl(row.user_id)}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page)} />}
    </div>
  );
}
