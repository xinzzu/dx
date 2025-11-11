'use client';
import { X, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { deleteGridEmissionFactor } from '@/lib/api/gridEmissionFactor';

interface GridEmissionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (id: string) => void;
  id: string;
  name: string;
}

export function GridEmissionDeleteModal({ isOpen, onClose, onSuccess, id, name }: GridEmissionDeleteModalProps) {
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteGridEmissionFactor(id);
      setShowSuccess(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menghapus data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        {/* Tombol Tutup */}
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        {/* Modal Konfirmasi */}
        {!showSuccess && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="text-red-500 w-6 h-6" />
              <h2 className="text-lg font-semibold text-gray-800">Hapus Grid Emission Factor</h2>
            </div>

            <p className="text-gray-700 mb-6">
              Apakah kamu yakin ingin menghapus grid emission <span className="font-semibold text-gray-900">&quot;{name}&quot;</span>?<br />
              Tindakan ini tidak dapat dibatalkan.
            </p>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100" disabled={loading}>
                Batal
              </button>
              <button onClick={handleDelete} disabled={loading} className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-70">
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </>
        )}

        {/* Modal Sukses */}
        {showSuccess && (
          <div className="text-center">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Grid Emission berhasil dihapus.</p>
            <button
              onClick={() => {
                setShowSuccess(false);
                onSuccess(id);
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
