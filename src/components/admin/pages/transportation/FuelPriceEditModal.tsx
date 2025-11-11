'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getFuelPriceById, updateFuelPrice } from '@/lib/api/fuelPrice';
import { getFuelProducts } from '@/lib/api/fuelProduct';
import { FuelProductTypes } from '@/types/fuelProductTypes';

interface FuelPriceEditModalProps {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function FuelPriceEditModal({ isOpen, id, onClose, onSuccess }: FuelPriceEditModalProps) {
  const [form, setForm] = useState({
    fuel_product_id: '',
    price_per_unit: '',
    effective_date: '',
    active: true,
  });
  const [fuelProducts, setFuelProducts] = useState<FuelProductTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Hook tetap dipanggil tanpa kondisi
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return; // kondisi di dalam fungsi, bukan di luar useEffect

      try {
        const [productData, priceData] = await Promise.all([getFuelProducts(), getFuelPriceById(id)]);
        setFuelProducts(productData);

        setForm({
          fuel_product_id: priceData.fuel_product_id,
          price_per_unit: priceData.price_per_unit.toString(),
          effective_date: priceData.effective_date,
          active: priceData.active,
        });
      } catch (err) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        fuel_product_id: form.fuel_product_id,
        price_per_unit: Number(form.price_per_unit),
        effective_date: form.effective_date,
        active: form.active,
      };

      await updateFuelPrice(id, payload);
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 text-center text-gray-600">Memuat data...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Harga Bahan Bakar</h2>

        {showSuccess ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data harga bahan bakar berhasil diperbarui.</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onSuccess();
                onClose();
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Tutup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pilih Produk */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Pilih Produk</label>
              <select name="fuel_product_id" value={form.fuel_product_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">-- Pilih Produk --</option>
                {fuelProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Harga per Unit */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Harga per Unit (Rp)</label>
              <input
                type="number"
                name="price_per_unit"
                value={form.price_per_unit}
                onChange={handleChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Contoh: 15000"
              />
            </div>

            {/* Tanggal Berlaku */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tanggal Berlaku</label>
              <input
                type="date"
                name="effective_date"
                value={form.effective_date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-2">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
              <label htmlFor="active" className="text-sm text-gray-700">
                Aktif
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Tombol Aksi */}
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100">
                Batal
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
