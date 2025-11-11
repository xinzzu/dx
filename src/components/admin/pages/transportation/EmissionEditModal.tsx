'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getVehicleEmissionFactorById, updateVehicleEmissionFactor } from '@/lib/api/vehicleEmissionFactor';
import { VehicleEmissionFactorTypes } from '@/types/vehicleEmissionFactorTypes';
import { getFuelProducts } from '@/lib/api/fuelProduct';
import { FuelProductTypes } from '@/types/fuelProductTypes';

interface EmissionEditModalProps {
  isOpen: boolean;
  id: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function EmissionEditModal({ isOpen, id, onClose, onSuccess }: EmissionEditModalProps) {
  const [form, setForm] = useState<Omit<VehicleEmissionFactorTypes, 'id'>>({
    vehicle_type: '',
    fuel_type: '',
    capacity_range_label: '',
    default_km_per_liter: 0,
    g_co2e_per_km: 0,
    active: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fuelProducts, setFuelProducts] = useState<FuelProductTypes[]>([]);

  // Fetch fuel products untuk fuel_type unik
  useEffect(() => {
    const fetchFuelProducts = async () => {
      try {
        const data = await getFuelProducts();
        setFuelProducts(data);
      } catch (err) {
        console.error('Gagal mengambil fuel products:', err);
      }
    };
    fetchFuelProducts();
  }, []);

  // Ambil fuel_type unik
  const uniqueFuelTypes = Array.from(new Set(fuelProducts.map((fp) => fp.fuel_type)));

  // Fetch data by ID saat modal terbuka
  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        const data = await getVehicleEmissionFactorById(id);
        setForm({
          vehicle_type: data.vehicle_type,
          fuel_type: data.fuel_type,
          capacity_range_label: data.capacity_range_label,
          default_km_per_liter: data.default_km_per_liter,
          g_co2e_per_km: data.g_co2e_per_km,
          active: data.active,
        });
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Gagal mengambil data');
      }
    };
    fetchData();
  }, [id, isOpen]);

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
      await updateVehicleEmissionFactor(id, form);
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

        <h2 className="text-lg font-semibold text-gray-800 mb-4">Edit Nilai Emisi Kendaraan</h2>

        {showSuccess ? (
          <div className="text-center py-6">
            <h3 className="text-lg font-semibold text-emerald-600 mb-2">Berhasil!</h3>
            <p className="text-gray-700 mb-4">Data emisi kendaraan berhasil diperbarui.</p>
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
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Tipe Kendaraan</label>
              <input type="text" name="vehicle_type" value={form.vehicle_type} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Jenis Bahan Bakar</label>
              <select name="fuel_type" value={form.fuel_type} onChange={handleChange} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <option value="">-- Pilih Bahan Bakar --</option>
                {uniqueFuelTypes.map((fuelType) => (
                  <option key={fuelType} value={fuelType}>
                    {fuelType}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity Range */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Kapasitas Mesin</label>
              <input
                type="text"
                name="capacity_range_label"
                value={form.capacity_range_label}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Default km/l */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Default (km/l)</label>
              <input
                type="number"
                name="default_km_per_liter"
                value={form.default_km_per_liter}
                onChange={handleChange}
                required
                min={0}
                step={0.1}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* gCO2e per km */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Emisi (gCO₂e/km)</label>
              <input
                type="number"
                name="g_co2e_per_km"
                value={form.g_co2e_per_km}
                onChange={handleChange}
                required
                min={0}
                step={0.1}
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
