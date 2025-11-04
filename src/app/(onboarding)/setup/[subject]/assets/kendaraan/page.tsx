"use client";

import { useState, useEffect } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import EmptyState from "@/features/assets/EmptyState";
import VehicleCardList from "@/features/assets/VehicleCardList";
import VehicleForm from "@/features/assets/VehicleForm";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import { assetsService, VehicleResponse } from "@/services/assets";

export default function KendaraanPage() {
  const { vehicles, addVehicle } = useAssetWizard();
  const { getIdToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasItems = vehicles.length > 0;

  // Fetch existing vehicles from backend on mount
  useEffect(() => {
    async function loadExistingVehicles() {
      try {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const apiVehicles = await assetsService.getVehicles(token);
        
        // Convert API vehicles to store format and add to store
        // Only add if store is empty (avoid duplicates on re-render)
        if (vehicles.length === 0 && apiVehicles.length > 0) {
          apiVehicles.forEach((apiVehicle: VehicleResponse) => {
            // Convert API format to store format
            const fuelType = apiVehicle.metadata?.fuel_type?.toLowerCase() || 'bensin';
            
            // Extract data from metadata (already saved by backend)
            const vehicleTypeLabel = (apiVehicle.metadata?.vehicle_type as string) || '';
            const capacityRangeLabel = (apiVehicle.metadata?.capacity_range as string) || '';
            
            // Determine vehicle type from label
            let type: 'mobil' | 'motor' = 'mobil';
            if (vehicleTypeLabel.toLowerCase().includes('motor') || 
                vehicleTypeLabel.toLowerCase().includes('sepeda motor')) {
              type = 'motor';
            }
            
            addVehicle({
              name: apiVehicle.name,
              emissionFactorId: apiVehicle.emission_factor_id,
              vehicleTypeLabel: vehicleTypeLabel,
              capacityRangeLabel: capacityRangeLabel,
              fuelTypeLabel: apiVehicle.metadata?.fuel_type || '',
              type: type,
              engineCapacity: '', // Not needed for display, only for form
              fuelType: fuelType as 'bensin' | 'diesel' | 'listrik' | 'hybrid' | 'lainnya',
            });
          });
        }
      } catch (error) {
        console.error("Failed to load existing vehicles:", error);
      } finally {
        setLoading(false);
      }
    }

    loadExistingVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getIdToken]); // Only run once on mount, vehicles.length and addVehicle are intentionally excluded

  if (loading) {
    return (
      <div className="space-y-4 pb-28">
        <div className="rounded-2xl border border-[var(--color-border,theme(colors.gray.200))] bg-white p-4">
          <div className="text-center py-8 text-gray-500">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      {/* SECTION: list / empty → HILANG saat form dibuka */}
      {!showForm && (
        <div className="rounded-2xl border border-[var(--color-border,theme(colors.gray.200))] bg-white p-4">
          {hasItems ? (
            <VehicleCardList />
          ) : (
            <EmptyState variant="vehicle" text="Belum ada kendaraan terdaftar" />
          )}
        </div>
      )}

      {/* CTA tambah → toggle form */}
      {!showForm && (
        <Button size="lg" fullWidth onClick={() => setShowForm(true)}>
          ＋  Tambah Kendaraan
        </Button>
      )}

      {/* SECTION: form → tampil sendiri, empty & list disembunyikan */}
      {showForm && (
        <VehicleForm
          onSaved={() => setShowForm(false)}   // selesai simpan → tutup form → list tampil
          onCancel={() => setShowForm(false)}  // batal → kembali ke empty/list
        />
      )}
    </div>
  );
}
