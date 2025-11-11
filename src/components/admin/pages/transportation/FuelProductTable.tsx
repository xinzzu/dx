'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FuelProductRow } from './FuelProductRow';
import { getFuelProducts } from '@/lib/api/fuelProduct';
import { FuelProductFormModal } from './FuelProductFormModal';
import { FuelProductEditModal } from './FuelProductEditModal';
import { FuelProductTypes } from '@/types/fuelProductTypes';
import { FuelProductDeleteModal } from './FuelProductDeleteModal';

export function FuelProductTable() {
  const [fuelProducts, setFuelProducts] = useState<FuelProductTypes[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // Ambil data dari API
  const fetchData = async () => {
    try {
      const data = await getFuelProducts();
      setFuelProducts(data);
    } catch (error) {
      console.error('Gagal mengambil data fuel products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler Edit
  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleRequestDelete = (id: string, product_name: string) => {
    setSelectedId(id);
    setSelectedName(product_name);
    setIsDeleteModalOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-700">Data Bahan Bakar</h3>

        <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
          <Plus className="w-4 h-4" />
          Tambah Data
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-left border-b border-gray-200">
            <tr>
              <th className="pb-2">Nama Produk</th>
              <th className="pb-2">Tipe</th>
              <th className="pb-2">Unit</th>
              <th className="pb-2">Status</th>
              <th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : fuelProducts.length > 0 ? (
              fuelProducts.map((item) => <FuelProductRow key={item.id} {...item} onRequestEdit={handleEdit} onRequestDelete={handleRequestDelete} />)
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Tidak ada data.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Data */}
      <FuelProductFormModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchData} />

      {/* Modal Edit Data */}
      {selectedId && <FuelProductEditModal isOpen={isEditModalOpen} id={selectedId} onClose={() => setIsEditModalOpen(false)} onSuccess={fetchData} />}

      {selectedId && selectedName && <FuelProductDeleteModal isOpen={isDeleteModalOpen} id={selectedId} name={selectedName} onClose={() => setIsDeleteModalOpen(false)} onSuccess={fetchData} />}
    </div>
  );
}
