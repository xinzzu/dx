'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { createFood } from '@/lib/api/food';

interface FoodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function FoodFormModal({ isOpen, onClose, onSuccess }: FoodFormModalProps) {
  const [form, setForm] = useState({
    name: '',
    unit: 'gram',
    co2e_per_unit: '',
    average_serving_size_g: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
        name: form.name,
        unit: form.unit,
        co2e_per_unit: Number(form.co2e_per_unit),
        average_serving_size_g: Number(form.average_serving_size_g),
        active: form.active,
      };

      await createFood(payload);
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(message);
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

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tambah Jenis Makanan</h2>

        {/* ✅ Ganti isi modal tergantung showSuccess */}
        {showSuccess ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data jenis makanan berhasil ditambahkan.</p>
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
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="Contoh: Telur"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Unit</label>
              <select name="unit" value={form.unit} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="gram">gram</option>
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
                placeholder="Contoh: 1.042"
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
                placeholder="Contoh: 200"
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
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
