'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { GridEmissionRow } from './GridEmissionRow';
import { getGridEmissionFactors } from '@/lib/api/gridEmissionFactor';
import { GridEmissionTypes } from '@/types/gridEmissionType';
import { GridEmissionFormModal } from './GridEmissionFormModal';
import { GridEmissionEditModal } from './GridEmissionEditModal';
import { GridEmissionDeleteModal } from './GridEmissionDeleteModal';

export function GridEmissionTable() {
  const [gridemission, setGridEmission] = useState<GridEmissionTypes[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedGridEmission, setSelectedGridEmission] = useState<string | null>(null);

  const fetchGridEmission = async () => {
    setLoading(true);
    try {
      const data = await getGridEmissionFactors();
      setGridEmission(data);
    } catch (err) {
      console.error('Gagal mengambil data grid emission factor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGridEmission();
  }, []);

  // Handlers
  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedGridEmission(name);
    setIsDeleteModalOpen(true);
  };

  // Close handlers
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedId(null);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
    setSelectedGridEmission(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-md font-semibold text-gray-700">Golongan Listrik</h3>
        </div>

        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" />
          Tambah Data
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-6 text-gray-500">Memuat data...</p>
      ) : gridemission.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-left border-b border-gray-200">
              <tr>
                <th className="pb-2">Region Name</th>
                <th className="pb-2">CO2e per kWh</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {gridemission.map((item) => (
                <GridEmissionRow key={item.id} {...item} onRequestEdit={handleEdit} onRequestDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-6 text-gray-500">Belum ada data golongan listrik.</p>
      )}

      {/* Modals */}
      {isAddModalOpen && <GridEmissionFormModal isOpen={isAddModalOpen} onClose={closeAddModal} onSuccess={fetchGridEmission} />}

      {isEditModalOpen && selectedId && <GridEmissionEditModal isOpen={isEditModalOpen} id={selectedId} onClose={closeEditModal} onSuccess={fetchGridEmission} />}

      {isDeleteModalOpen && selectedId && selectedGridEmission && <GridEmissionDeleteModal isOpen={isDeleteModalOpen} id={selectedId} name={selectedGridEmission} onClose={closeDeleteModal} onSuccess={fetchGridEmission} />}
    </div>
  );
}
