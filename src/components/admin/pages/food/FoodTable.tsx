'use client';
import { useEffect, useState } from 'react';
import { Utensils, Plus } from 'lucide-react';
import { FoodRow } from './FoodRow';
import { getFoodList, getFoodById } from '@/lib/api/food';
import { FoodTypes } from '@/types/foodType';
import { FoodFormModal } from './FoodFormModal';
import { FoodDeleteModal } from './FoodDeleteModal';
import { FoodEditModal } from './FoodEditModal';

export function FoodTable() {
  const [foodData, setFoodData] = useState<FoodTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFoodData, setEditFoodData] = useState<FoodTypes | null>(null);

  // state untuk modal delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<{ id: string; name: string } | null>(null);

  // Ambil data dari API
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getFoodList();
        setFoodData(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Gagal memuat data';
        setError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleEditRequest = async (id: string) => {
    try {
      const data = await getFoodById(id);
      setEditFoodData(data);
      setEditModalOpen(true);
    } catch (err) {
      console.error('Gagal memuat data untuk edit:', err);
    }
  };

  const handleDelete = (id: string) => {
    setFoodData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSuccess = async () => {
    try {
      const updatedData = await getFoodList();
      setFoodData(updatedData);
    } catch (err) {
      console.error('Gagal memuat ulang data:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Utensils className="w-5 h-5 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-700">Data Jenis Makanan</h3>
        </div>

        {/* Button Tambah */}
        <button onClick={() => setOpenModal(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" />
          Tambah Data
        </button>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-left border-b border-gray-200">
            <tr>
              <th className="pb-2">Nama</th>
              <th className="pb-2">Rata-rata Sajian</th>
              <th className="pb-2">Unit</th>
              <th className="pb-2">Nilai Emisi per Unit</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {foodData.map((row) => (
              <FoodRow
                key={row.id}
                {...row}
                onRequestDelete={(id, name) => {
                  setSelectedFood({ id, name });
                  setDeleteModalOpen(true);
                }}
                onRequestEdit={handleEditRequest}
              />
            ))}
          </tbody>
        </table>

        {/* Kondisi Loading/Error */}
        {loading && <p className="text-gray-500 text-sm">Memuat data...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {/* Modal Tambah */}
      {openModal && <FoodFormModal isOpen={openModal} onClose={() => setOpenModal(false)} onSuccess={handleSuccess} />}

      {/* Modal Delete */}
      {deleteModalOpen && selectedFood && (
        <FoodDeleteModal
          isOpen={deleteModalOpen}
          id={selectedFood.id}
          name={selectedFood.name}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={(id) => {
            handleDelete(id);
            setDeleteModalOpen(false);
          }}
        />
      )}

      {editModalOpen && editFoodData && (
        <FoodEditModal
          isOpen={editModalOpen}
          data={editFoodData}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            handleSuccess();
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
