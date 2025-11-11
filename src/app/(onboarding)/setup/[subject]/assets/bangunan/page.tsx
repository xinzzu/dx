"use client";

import { useState, useEffect } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import EmptyState from "@/features/assets/EmptyState";
import BuildingCardList from "@/features/assets/BuildingCardList";
import BuildingForm from "@/features/assets/BuildingForm";
import Button from "@/components/ui/Button";
import useAuth from "@/hooks/useAuth";
import { assetsService, BuildingResponse } from "@/services/assets";

export default function BangunanPage() {
  const { buildings, addBuilding, reset } = useAssetWizard();
  const { getIdToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const hasItems = buildings.length > 0;

  // Fetch existing buildings from backend on mount
  useEffect(() => {
    async function loadExistingBuildings() {
      try {
        const token = await getIdToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const apiBuildings = await assetsService.getBuildings(token);

        // Convert API buildings to store format and add to store
        // Only add if store is empty (avoid duplicates on re-render)
        if (buildings.length === 0 && apiBuildings.length > 0) {
          apiBuildings.forEach((apiBuilding: BuildingResponse) => {
            // Convert API format to store format
            addBuilding({
              name: apiBuilding.name,
              tariffId: apiBuilding.electricity_tariff_id,
              categoryId: '', // Not available from API
              categoryName: apiBuilding.address_label || '',
              tariffLabel: '',
              dayaVa: 0, // Not available from API
              luasM2: apiBuilding.metadata?.area_sqm,
              alamatJalan: apiBuilding.full_address || '',
              provinsi: apiBuilding.province_code,
              kabKota: apiBuilding.regency_code,
              kecamatan: apiBuilding.district_code,
              kelurahan: apiBuilding.village_code,
              postalCode: apiBuilding.postal_code ? parseInt(apiBuilding.postal_code) : undefined,
              appliances: apiBuilding.metadata?.electronics_inventory || {},
            });
          });
        }
      } catch (error) {
        console.error("Failed to load existing buildings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadExistingBuildings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getIdToken]); // Only run once on mount, buildings.length and addBuilding are intentionally excluded

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
            <BuildingCardList />
          ) : (
            <EmptyState text="Belum ada bangunan terdaftar" />
          )}
        </div>
      )}

      {/* CTA tambah → toggle form */}
      {!showForm && (
        <Button size="lg" fullWidth onClick={() => setShowForm(true)}>
          ＋  Tambah Bangunan
        </Button>
      )}

      {/* SECTION: form → tampil sendiri, empty & list disembunyikan */}
      {showForm && (
        <BuildingForm
          onSaved={() => setShowForm(false)}   // setelah simpan → tutup form → list muncul
          onCancel={() => setShowForm(false)}  // batal → kembali ke empty/list
        />
      )}
    </div>
  );
}
