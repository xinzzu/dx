"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import RequireProgress from "@/components/guards/RequireProgress";
import { useAssetWizard } from "@/stores/assetWizard";
import { useOnboarding } from "@/stores/onboarding";
import useAuth from "@/hooks/useAuth";
import { assetsService } from "@/services/assets";
import { userService } from "@/services/user";

export default function AssetsLayout({ children }: { children: React.ReactNode }) {
  const { subject } = useParams<{ subject: "individu" | "lembaga" }>();
  const pathname = usePathname();
  const router = useRouter();
  const { getIdToken } = useAuth();

  // hitung item untuk enable/disable
  const { buildings, vehicles, reset: resetAssets } = useAssetWizard();
  const buildingCount = buildings.length;
  const vehicleCount = vehicles.length;

  // aksi onboarding
  const { markAssetsBuildingsCompleted, markAssetsCompleted } = useOnboarding();

  // loading state untuk submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // deteksi halaman aktif (hindari trailing slash)
  const onBuildings = useMemo(() => /\/assets\/bangunan\/?$/.test(pathname || ""), [pathname]);
  const onVehicles  = useMemo(() => /\/assets\/kendaraan\/?$/.test(pathname || ""), [pathname]);

  // Fetch user profile to get user_id
  useEffect(() => {
    async function fetchUserId() {
      try {
        const token = await getIdToken();
        if (!token) return;
        
        const profile = await userService.getMe(token);
        setUserId(profile.id);
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    }
    fetchUserId();
  }, [getIdToken]);

  // tombol utama aktif jika sudah ada minimal 1 entri pada step tsb
  const canGoNext = onBuildings ? buildingCount > 0 : vehicleCount > 0;

  const title    = onVehicles ? "Daftarkan Aset Kendaraan" : "Daftarkan Aset Bangunan";
  const subtitle = onVehicles ? "Tambahkan Kendaraan yang dimiliki" : "Tambahkan Bangunan yang dimiliki";

  const targetNext = `/setup/${subject}/assets/kendaraan`;

  // prefetch halaman kendaraan biar transisi halus
  useEffect(() => {
    if (onBuildings && subject) router.prefetch(targetNext);
  }, [onBuildings, subject, targetNext, router]);

  async function handlePrimary() {
    if (!canGoNext || isSubmitting) return;

    if (onBuildings) {
      // selesai step bangunan → lanjut ke kendaraan
      markAssetsBuildingsCompleted();
      router.push(targetNext);
    } else {
      // selesai flow aset (kendaraan minimal 1) → POST semua assets
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const token = await getIdToken();
        if (!token) {
          throw new Error("No authentication token available");
        }

        if (!userId) {
          throw new Error("User ID not available");
        }

        // 1. Submit all assets (buildings + vehicles)
        console.log("📤 Submitting assets...", { buildings: buildingCount, vehicles: vehicleCount, userId });
        await assetsService.submitAllAssets(buildings, vehicles, userId, token);
        console.log("✅ Assets submitted successfully");

        // 2. Update user profile - mark assets as completed
        await userService.updateProfile(
          {
            is_asset_buildings_completed: buildingCount > 0,
            is_asset_vehicles_completed: vehicleCount > 0,
          },
          token
        );
        console.log("✅ User profile updated");

        // 3. Mark onboarding complete
        markAssetsCompleted();

        // 4. Clear store
        resetAssets();

        // 5. Redirect to dashboard
        router.replace(subject === "lembaga" ? "/lembaga" : "/app");
      } catch (error) {
        console.error("❌ Failed to submit assets:", error);
        setSubmitError(
          error instanceof Error ? error.message : "Gagal menyimpan data. Silakan coba lagi."
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  return (
    <RequireProgress step={onBuildings ? "assets-bangunan" : "assets-kendaraan"} subject={subject}>
      <div className="min-h-dvh bg-white text-black">
        <div className="container mx-auto max-w-xl px-4 py-6">
          <h1 className="text-xl font-semibold text-center">{title}</h1>
          <p className="text-sm text-black/60 text-center">{subtitle}</p>

          <div className="mt-4">{children}</div>
        </div>

        {/* Sticky footer: satu tombol besar, tanpa border atas */}
        <div
          className="fixed inset-x-0 bottom-0 bg-white/90 backdrop-blur"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
        >
          <div className="container mx-auto max-w-xl px-4 py-3">
            {/* Error message */}
            {submitError && (
              <div className="mb-3 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            {onBuildings ? (
              <button
                type="button"
                onClick={handlePrimary}
                disabled={!canGoNext || isSubmitting}
                className={`w-full rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-sm
                ${canGoNext && !isSubmitting ? "bg-[var(--color-primary)] active:scale-[.99]" : "bg-gray-300 cursor-not-allowed pointer-events-none"}`}
                aria-disabled={!canGoNext || isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Selanjutnya"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-x-3">
                <button
                  type="button"
                  onClick={() => router.push(`/setup/${subject}/assets/bangunan`)}
                  className="w-full rounded-2xl bg-white px-5 py-4 text-base font-semibold text-[var(--color-primary)] shadow-sm ring-1 ring-inset ring-[var(--color-primary)] active:scale-[.99]"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={handlePrimary}
                  disabled={!canGoNext || isSubmitting}
                  className={`w-full rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-sm
                ${canGoNext && !isSubmitting ? "bg-[var(--color-primary)] active:scale-[.99]" : "bg-gray-300 cursor-not-allowed pointer-events-none"}`}
                  aria-disabled={!canGoNext || isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Selesai"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireProgress>
  );
}
