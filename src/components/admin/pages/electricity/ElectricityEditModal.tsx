'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getElectricityEmissionTariffById, updateElectricityEmissionTariff } from '@/lib/api/electricityEmissionTarif';
import { getElectricityCategories } from '@/lib/api/electricityCategory';
import { ElectricityEmissionTarifTypes } from '@/types/electricityEmissionTarif';
import { ElectricityCategoryTypes } from '@/types/electricityCategoryType';

interface ElectricityEditModalProps {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ElectricityEditModal({ isOpen, id, onClose, onSuccess }: ElectricityEditModalProps) {
  const [form, setForm] = useState<ElectricityEmissionTarifTypes | null>(null);
  const [categories, setCategories] = useState<ElectricityCategoryTypes[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ✅ Fetch data kategori dan tarif
  useEffect(() => {
    if (!isOpen || !id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [tariff, cats] = await Promise.all([getElectricityEmissionTariffById(id), getElectricityCategories()]);
        setForm(tariff);
        setCategories(cats);
      } catch (err) {
        console.error('Gagal mengambil data:', err);
        setError('Gagal mengambil data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type, value, checked } = e.target as HTMLInputElement;
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
          }
        : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);

    try {
      await updateElectricityEmissionTariff(form.id, form);
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan data.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Nilai Emisi Listrik</h2>

        {loading ? (
          <p className="text-center text-gray-500 py-4">Memuat data...</p>
        ) : showSuccess ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data emisi listrik berhasil diperbarui.</p>
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
        ) : form ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Golongan / Kategori */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Golongan / Kategori</label>
              <select name="category_id" value={form.category_id} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
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
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-center text-gray-500 py-4">Data tidak ditemukan.</p>
        )}
      </div>
    </div>
  );
}
