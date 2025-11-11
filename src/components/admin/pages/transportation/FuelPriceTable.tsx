'use client';
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { FuelPriceRow } from './FuelPriceRow';
import { getFuelPricesWithProductName } from '@/lib/api/fuelPrice';
import { FuelPriceFormModal } from './FuelPriceFormModal';
import { FuelPriceEditModal } from './FuelPriceEditModal';
import { FuelPriceDeleteModal } from './FuelPriceDeleteModal';
import { FuelPriceWithProductName } from '@/types/fuelPriceType';

export function FuelPriceTable() {
  const [fuelPrices, setFuelPrices] = useState<FuelPriceWithProductName[]>([]);
  const [loading, setLoading] = useState(true);

  // modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // selected item
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);

  // ambil data dari API
  const fetchData = async () => {
    try {
      const data = await getFuelPricesWithProductName();
      setFuelPrices(data);
    } catch (error) {
      console.error('Gagal mengambil data fuel prices:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // handle edit dan delete
  const handleEdit = (id: string) => {
    setSelectedId(id);
    setIsEditModalOpen(true);
  };

  const handleRequestDelete = (id: string, product_name: string) => {
    setSelectedId(id);
    setSelectedName(product_name);
    setIsDeleteModalOpen(true);
  };

  // handle close modals — reset selected data juga
  const closeAddModal = () => setIsAddModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedId(null);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedId(null);
    setSelectedName(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-gray-700">Data Harga Bahan Bakar</h3>

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
              <th className="pb-2">Harga per Unit</th>
              <th className="pb-2">Tanggal Berlaku</th>
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
            ) : fuelPrices.length > 0 ? (
              fuelPrices.map((item) => (
                <FuelPriceRow
                  key={item.id}
                  id={item.id}
                  fuel_product_id={item.fuel_product_id} // ✅ Tambahkan ini
                  product_name={item.product_name || item.fuel_product?.product_name || '-'}
                  price_per_unit={item.price_per_unit}
                  effective_date={item.effective_date}
                  active={item.active}
                  onRequestEdit={handleEdit}
                  onRequestDelete={handleRequestDelete}
                />
              ))
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

      {/* Modal Tambah */}
      <FuelPriceFormModal isOpen={isAddModalOpen} onClose={closeAddModal} onSuccess={fetchData} />

      {/* Modal Edit */}
      {isEditModalOpen && selectedId && <FuelPriceEditModal isOpen={isEditModalOpen} id={selectedId} onClose={closeEditModal} onSuccess={fetchData} />}

      {/* Modal Delete */}
      {isDeleteModalOpen && selectedId && selectedName && <FuelPriceDeleteModal isOpen={isDeleteModalOpen} id={selectedId} product_name={selectedName} onClose={closeDeleteModal} onSuccess={fetchData} />}
    </div>
  );
}
