'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getFoodById, updateFood } from '@/lib/api/food';
import { FoodTypes } from '@/types/foodType';

interface FoodEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  id?: string;
  data?: FoodTypes;
}

export function FoodEditModal({ isOpen, onClose, onSuccess, id, data }: FoodEditModalProps) {
  const [form, setForm] = useState({
    name: '',
    unit: 'gram',
    co2e_per_unit: '',
    average_serving_size_g: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      setForm({
        name: data.name ?? '',
        unit: data.unit ?? 'kg',
        co2e_per_unit: String(data.co2e_per_unit ?? ''),
        average_serving_size_g: String(data.average_serving_size_g ?? ''),
        active: data.active ?? true,
      });
      setError(null);
      return;
    }

    if (id) {
      (async () => {
        try {
          setFetching(true);
          setError(null);
          const fetched = await getFoodById(id);
          setForm({
            name: fetched.name ?? '',
            unit: fetched.unit ?? 'gram',
            co2e_per_unit: String(fetched.co2e_per_unit ?? ''),
            average_serving_size_g: String(fetched.average_serving_size_g ?? ''),
            active: fetched.active ?? true,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'Gagal memuat data';
          setError(msg);
        } finally {
          setFetching(false);
        }
      })();
    }
  }, [isOpen, id, data]);

  if (!isOpen) return null;

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg p-6 text-gray-700">Memuat data...</div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const foodId = id ?? data?.id;
    if (!foodId) {
      setError('ID data tidak tersedia untuk update');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: form.name,
        unit: form.unit,
        co2e_per_unit: Number(form.co2e_per_unit),
        average_serving_size_g: Number(form.average_serving_size_g),
        active: form.active, // ✅ tambahkan field active ke payload
      };

      await updateFood(foodId, payload);
      setShowSuccess(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat update';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Jenis Makanan</h2>

        {showSuccess ? (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data jenis makanan berhasil diperbarui.</p>
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
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nama</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="kg">gram</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Nilai Emisi per Unit (CO₂e)</label>
              <input
                type="number"
                step="0.001"
                name="co2e_per_unit"
                value={form.co2e_per_unit}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Rata-rata Sajian (gram)</label>
              <input
                type="number"
                step="0.001"
                name="average_serving_size_g"
                value={form.average_serving_size_g}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* ✅ Checkbox status aktif */}
            <div className="flex items-center gap-2">
              <input type="checkbox" name="active" checked={form.active} onChange={handleChange} className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500" />
              <label htmlFor="active" className="text-sm text-gray-700">
                Aktif
              </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

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
