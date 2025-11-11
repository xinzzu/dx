'use client';
import { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { TransportationEmissionRow } from './EmissionRow';
import { getVehicleEmissionFactors } from '@/lib/api/vehicleEmissionFactor';
import { VehicleEmissionFactorTypes } from '@/types/vehicleEmissionFactorTypes';
import { EmissionFormModal } from './EmissionFormModal';
import { EmissionEditModal } from './EmissionEditModal';
import { EmissionDeleteModal } from './EmissionDeleteModal';
import { Pagination } from '@/components/admin/layout/Pagination';

export function EmissionTable() {
  const [emissionData, setEmissionData] = useState<VehicleEmissionFactorTypes[]>([]);
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
  const [selectedVehicleType, setSelectedVehicleType] = useState<string | null>(null);

  const fetchData = useCallback(
    async (pageNumber = 1) => {
      setLoading(true);
      try {
        const response = await getVehicleEmissionFactors(pageNumber, perPage);
        setEmissionData(response.data);
        setMeta(response.meta);
        setPage(response.meta.currentPage);
      } catch (err) {
        console.error('Gagal mengambil data emisi kendaraan:', err);
      } finally {
        setLoading(false);
      }
    },
    [perPage]
  ); // perPage jadi dependency karena dipakai di dalam fetchData

  useEffect(() => {
    fetchData(page);
  }, [fetchData, page]);

  const groupedData = emissionData.reduce((acc, curr) => {
    if (!acc[curr.vehicle_type]) acc[curr.vehicle_type] = [];
    acc[curr.vehicle_type].push(curr);
    return acc;
  }, {} as Record<string, VehicleEmissionFactorTypes[]>);

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, vehicleType: string) => {
    setSelectedId(id);
    setSelectedVehicleType(vehicleType);
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
    setSelectedVehicleType(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold text-gray-800">Data Nilai Emisi Transportasi</h3>
        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" />
          Tambah Data
        </button>
      </div>

      {loading ? (
        <p className="text-center py-6 text-gray-500">Memuat data...</p>
      ) : (
        <>
          {Object.entries(groupedData).map(([vehicleType, items]) => (
            <div key={vehicleType} className="border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden">
              <div className="bg-gray-50 flex items-center justify-between px-5 py-3 border-b border-gray-200">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">{vehicleType}</div>
                <span className="text-xs text-gray-500 font-medium">{items.length} varian emisi</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-gray-600 text-xs font-semibold border-b border-gray-200">
                    <tr>
                      <th className="text-left px-5 py-3">Bahan Bakar</th>
                      <th className="text-left px-3 py-3">Kapasitas Mesin</th>
                      <th className="text-left px-3 py-3">Default (km/l)</th>
                      <th className="text-left px-3 py-3">Emisi (gCO₂e/km)</th>
                      <th className="text-left px-3 py-3">Status</th>
                      <th className="text-center px-3 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <TransportationEmissionRow key={item.id} {...item} onRequestEdit={handleEdit} onRequestDelete={(id) => handleDelete(id, item.vehicle_type)} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <Pagination currentPage={meta.currentPage} totalPages={meta.totalPages} onPageChange={setPage} />
        </>
      )}

      <EmissionFormModal isOpen={isAddModalOpen} onClose={closeAddModal} onSuccess={() => fetchData(page)} />
      {selectedId && <EmissionEditModal isOpen={isEditModalOpen} id={selectedId} onClose={closeEditModal} onSuccess={() => fetchData(page)} />}
      {selectedId && selectedVehicleType && <EmissionDeleteModal isOpen={isDeleteModalOpen} id={selectedId} vehicleType={selectedVehicleType} onClose={closeDeleteModal} onSuccess={() => fetchData(page)} />}
    </div>
  );
}
