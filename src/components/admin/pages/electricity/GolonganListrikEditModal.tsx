'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ElectricityCategoryTypes } from '@/types/electricityCategoryType';
import { getElectricityCategoryById, updateElectricityCategory } from '@/lib/api/electricityCategory';

interface GolonganListrikEditModalProps {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function GolonganListrikEditModal({ isOpen, id, onClose, onSuccess }: GolonganListrikEditModalProps) {
  const [form, setForm] = useState<Omit<ElectricityCategoryTypes, 'id'>>({
    category_name: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch data by ID saat modal terbuka
  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const data = await getElectricityCategoryById(id);
        setForm({
          category_name: data.category_name,
          active: data.active,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal mengambil data');
      }
    };
    fetchData();
  }, [id, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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
      await updateElectricityCategory(id, form);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
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

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Golongan Listrik</h2>

        {showSuccess ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Golongan listrik berhasil diperbarui.</p>
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
            {/* Category Name */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Nama Golongan</label>
              <input
                type="text"
                name="category_name"
                value={form.category_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Active */}
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
