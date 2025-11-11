'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { ElectricityRow } from './ElectricityRow';
import { getElectricityEmissionTariffsWithCategoryName } from '@/lib/api/electricityEmissionTarif';
import { ElectricityEmissionTarifWithCategoryName } from '@/types/electricityEmissionTarif';
import { Pagination } from '@/components/admin/layout/Pagination';
import { ElectricityFormModal } from './ElectricityFormModal';
import { ElectricityEditModal } from './ElectricityEditModal';
import { ElectricityDeleteModal } from './ElectricityDeleteModal';

export function ElectricityTable() {
  const [tariffData, setTariffData] = useState<ElectricityEmissionTarifWithCategoryName[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [meta, setMeta] = useState({ totalItems: 0, totalPages: 1, currentPage: 1 });

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected item
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  // ✅ Fetch data with pagination
  const fetchData = useCallback(
    async (pageNumber = page) => {
      setLoading(true);
      try {
        const { data, meta } = await getElectricityEmissionTariffsWithCategoryName(pageNumber, perPage);
        setTariffData(data);
        setMeta(meta);
      } catch (err) {
        console.error('Gagal mengambil data emisi listrik:', err);
      } finally {
        setLoading(false);
      }
    },
    [page, perPage]
  );

  // ✅ Re-fetch data ketika page berubah
  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  // ✅ Group data by category_name
  const groupedData = tariffData.reduce((acc, curr) => {
    const category = curr.category_name || '-';
    if (!acc[category]) acc[category] = [];
    acc[category].push(curr);
    return acc;
  }, {} as Record<string, ElectricityEmissionTarifWithCategoryName[]>);

  // Handlers
  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, categoryName: string) => {
    setSelectedId(id);
    setSelectedCategoryName(categoryName);
    setIsDeleteModalOpen(true);
  };

  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedId(null);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
    setSelectedCategoryName(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-gray-800">Data Nilai Emisi Listrik</h3>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" />
          Tambah Data
        </button>
      </div>

      {/* Table content */}
      {loading ? (
        <p className="text-center py-6 text-gray-500">Memuat data...</p>
      ) : (
        <>
          {Object.entries(groupedData).map(([categoryName, items]) => (
            <div key={categoryName} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
              {/* Group Header */}
              <div className="bg-gray-50 flex items-center justify-between px-5 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">{categoryName}</div>
                <span className="text-xs text-gray-500 font-medium">{items.length} varian daya</span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-600 text-xs font-semibold border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3">Label Daya</th>
                      <th className="text-left px-3 py-3">Minimal VA</th>
                      <th className="text-left px-3 py-3">Maksimal VA</th>
                      <th className="text-left px-3 py-3">Tarif (Rp/kWh)</th>
                      <th className="text-left px-3 py-3">Status</th>
                      <th className="text-center px-3 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <ElectricityRow key={item.id} {...item} onRequestEdit={() => handleEdit(item.id)} onRequestDelete={() => handleDelete(item.id, item.category_name || '-')} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={(newPage) => setPage(newPage)} />
        </>
      )}

      {/* Modals */}
      <ElectricityFormModal isOpen={isAddModalOpen} onClose={closeAddModal} onSuccess={() => fetchData(page)} />
      {selectedId && <ElectricityEditModal isOpen={isEditModalOpen} id={selectedId} onClose={closeEditModal} onSuccess={() => fetchData(page)} />}
      {selectedId && selectedCategoryName && <ElectricityDeleteModal isOpen={isDeleteModalOpen} id={selectedId} categoryName={selectedCategoryName} onClose={closeDeleteModal} onSuccess={() => fetchData(page)} />}
    </div>
  );
}
