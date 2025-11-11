'use client';
import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { deleteElectricityEmissionTariff } from '@/lib/api/electricityEmissionTarif';

interface ElectricityDeleteModalProps {
  isOpen: boolean;
  id: string;
  categoryName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ElectricityDeleteModal({ isOpen, id, categoryName, onClose, onSuccess }: ElectricityDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteElectricityEmissionTariff(id);
      setShowSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus data');
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

        {!showSuccess ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="text-red-500 w-6 h-6" />
              <h2 className="text-lg font-semibold text-gray-800">Hapus Nilai Emisi Listrik</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Apakah kamu yakin ingin menghapus data emisi listrik pada kategori <span className="font-semibold text-gray-900">{categoryName}</span>? Tindakan ini tidak dapat dibatalkan.
            </p>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100">
                Batal
              </button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data emisi listrik berhasil dihapus.</p>
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
        )}
      </div>
    </div>
  );
}
