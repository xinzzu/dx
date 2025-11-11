'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createElectricityEmissionTariff } from '@/lib/api/electricityEmissionTarif';
import { getElectricityCategories } from '@/lib/api/electricityCategory';
import { ElectricityCategoryTypes } from '@/types/electricityCategoryType';
import { ElectricityEmissionTarifWithCategoryName } from '@/types/electricityEmissionTarif';

interface ElectricityFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ElectricityFormModal({ isOpen, onClose, onSuccess }: ElectricityFormModalProps) {
  const [form, setForm] = useState<Omit<ElectricityEmissionTarifWithCategoryName, 'id'>>({
    category_id: '',
    power_capacity_label: '',
    min_power_va: 0,
    max_power_va: 0,
    rate_per_kwh: 0,
    active: true,
  });

  const [categories, setCategories] = useState<ElectricityCategoryTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // ✅ Ambil kategori listrik saat modal dibuka
  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const data = await getElectricityCategories();
        setCategories(data);
      } catch (err) {
        console.error('Gagal memuat kategori listrik:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createElectricityEmissionTariff(form);
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.';
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

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tambah Nilai Emisi Listrik</h2>

        {showSuccess ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data emisi listrik berhasil ditambahkan.</p>
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
            {/* ✅ Pilih Kategori */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Golongan / Kategori</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                required
                disabled={loadingCategories}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
              {loadingCategories && <p className="text-xs text-gray-500 mt-1">Memuat kategori...</p>}
            </div>

            {/* Label Daya */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Label Daya</label>
              <input
                type="text"
                name="power_capacity_label"
                value={form.power_capacity_label}
                onChange={handleChange}
                required
                placeholder="Contoh: 900 VA"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Minimal VA */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Daya Minimal (VA)</label>
              <input
                type="number"
                name="min_power_va"
                value={form.min_power_va}
                onChange={handleChange}
                required
                min={0}
                step={1}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Maksimal VA */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Daya Maksimal (VA)</label>
              <input
                type="number"
                name="max_power_va"
                value={form.max_power_va}
                onChange={handleChange}
                required
                min={0}
                step={1}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Tarif per kWh */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tarif per kWh (Rp)</label>
              <input
                type="number"
                name="rate_per_kwh"
                value={form.rate_per_kwh}
                onChange={handleChange}
                required
                min={0}
                step={0.01}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status */}
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
                {loading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
