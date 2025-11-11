'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { GolonganListrikRow } from './GolonganListrikRow';
import { getElectricityCategories } from '@/lib/api/electricityCategory';
import { ElectricityCategoryTypes } from '@/types/electricityCategoryType';
import { GolonganListrikFormModal } from './GolonganListrikFormModal';
import { GolonganListrikEditModal } from './GolonganListrikEditModal';
import { GolonganListrikDeleteModal } from './GolonganListrikDeleteModal';

export function GolonganListrikTable() {
  const [categories, setCategories] = useState<ElectricityCategoryTypes[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getElectricityCategories();
      setCategories(data);
    } catch (err) {
      console.error('Gagal mengambil data golongan listrik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handlers
  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    setSelectedId(id);
    setSelectedCategoryName(name);
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
    setSelectedCategoryName(null);
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
      ) : categories.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-gray-500 text-left border-b border-gray-200">
              <tr>
                <th className="pb-2">Nama Golongan</th>
                <th className="pb-2">Status</th>
                <th className="pb-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((item) => (
                <GolonganListrikRow key={item.id} {...item} onRequestEdit={handleEdit} onRequestDelete={handleDelete} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center py-6 text-gray-500">Belum ada data golongan listrik.</p>
      )}

      {/* Modals */}
      {isAddModalOpen && <GolonganListrikFormModal isOpen={isAddModalOpen} onClose={closeAddModal} onSuccess={fetchCategories} />}

      {isEditModalOpen && selectedId && <GolonganListrikEditModal isOpen={isEditModalOpen} id={selectedId} onClose={closeEditModal} onSuccess={fetchCategories} />}

      {isDeleteModalOpen && selectedId && selectedCategoryName && <GolonganListrikDeleteModal isOpen={isDeleteModalOpen} id={selectedId} name={selectedCategoryName} onClose={closeDeleteModal} onSuccess={fetchCategories} />}
    </div>
  );
}
