'use client';
import { useEffect, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { WasteRow } from './WasteRow';
import { getWasteList, getWasteById } from '@/lib/api/waste';
import { WasteTypes } from '@/types/wasteType';
import { WasteFormModal } from './WasteFormModal';
import { WasteDeleteModal } from './WasteDeleteModal';
import { WasteEditModal } from './WasteEditModal';

export function WasteTable() {
  const [wasteData, setWasteData] = useState<WasteTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModal, setOpenModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editWasteData, setEditWasteData] = useState<WasteTypes | null>(null);

  // state untuk modal delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState<{ id: string; name: string } | null>(null);

  // Ambil data dari API
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getWasteList();
        setWasteData(data);
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
      const data = await getWasteById(id);
      setEditWasteData(data);
      setEditModalOpen(true);
    } catch (err) {
      console.error('Gagal memuat data untuk edit:', err);
    }
  };

  const handleDelete = (id: string) => {
    setWasteData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSuccess = async () => {
    try {
      const updatedData = await getWasteList();
      setWasteData(updatedData);
    } catch (err) {
      console.error('Gagal memuat ulang data:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Trash2 className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-xl text-gray-700">Data Jenis Sampah</h3>
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
              <th className="pb-2">Unit</th>
              <th className="pb-2">Nilai Emisi per Unit</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {wasteData.map((row) => (
              <WasteRow
                key={row.id}
                {...row}
                onRequestDelete={(id, name) => {
                  setSelectedWaste({ id, name });
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
      {openModal && <WasteFormModal isOpen={openModal} onClose={() => setOpenModal(false)} onSuccess={handleSuccess} />}

      {/* Modal Delete */}
      {deleteModalOpen && selectedWaste && (
        <WasteDeleteModal
          isOpen={deleteModalOpen}
          id={selectedWaste.id}
          name={selectedWaste.name}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={(id) => {
            handleDelete(id);
            setDeleteModalOpen(false);
          }}
        />
      )}

      {editModalOpen && editWasteData && (
        <WasteEditModal
          isOpen={editModalOpen}
          data={editWasteData}
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
