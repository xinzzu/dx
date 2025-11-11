'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getFuelProductById, updateFuelProduct } from '@/lib/api/fuelProduct';
import { FuelProductTypes } from '@/types/fuelProductTypes';

interface FuelProductEditModalProps {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FuelProductEditModal({ isOpen, id, onClose, onSuccess }: FuelProductEditModalProps) {
  const [formData, setFormData] = useState<FuelProductTypes>({
    id: '',
    product_name: '',
    fuel_type: '',
    unit: '',
    active: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  // Ambil data berdasarkan id saat modal dibuka
  useEffect(() => {
    if (isOpen && id) {
      const fetchData = async () => {
        const data = await getFuelProductById(id);
        setFormData(data);
      };
      fetchData();
    }
  }, [isOpen, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateFuelProduct(id, formData);
      onSuccess(); // refresh tabel
      onClose(); // tutup modal
    } catch (error) {
      console.error('Gagal update fuel product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
        {/* Tombol tutup */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold mb-4">Edit Produk Bahan Bakar</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nama Produk */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
            <input type="text" name="product_name" value={formData.product_name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>

          {/* Jenis Bahan Bakar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Bahan Bakar</label>
            <input type="text" name="fuel_type" value={formData.fuel_type} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
          </div>

          {/* Satuan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
              <option value="liter">liter</option>
              <option value="kWh">kWh</option>
            </select>
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-2">
            <input type="checkbox" name="active" checked={formData.active} onChange={handleChange} id="active" />
            <label htmlFor="active" className="text-sm text-gray-700">
              Aktif
            </label>
          </div>

          {/* Tombol Submit */}
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100">
              Batal
            </button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60">
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
