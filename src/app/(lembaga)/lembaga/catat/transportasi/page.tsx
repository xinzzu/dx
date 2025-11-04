"use client";

import { useMemo, useState } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import { useUsage } from "@/stores/catat/usage";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";


const FUEL_OPTS = [
  { value: "bensin", label: "Bensin" },
  { value: "diesel", label: "Diesel" },
  { value: "listrik", label: "Listrik (EV)" },
  { value: "bbm_lain", label: "Lainnya" },
];

export default function CatatTransportasiLembagaPage() {
  const { vehicles } = useAssetWizard();
  const { addTransport } = useUsage();
const router = useRouter();
  const [date, setDate] = useState<string>("");
  const [vehicleId, setVehicleId] = useState("");
  const [fuelType, setFuelType] = useState("bensin");
  const [monthlyCost, setMonthlyCost] = useState("");

  const vehicleOptions = useMemo(
    () => vehicles.map((v) => ({ value: v.id, label: v.name })),
    [vehicles]
  );

  const canSubmit =
    !!date && !!vehicleId && fuelType !== "" && Number(monthlyCost) >= 0;

  function handleSave() {
    if (!canSubmit) return;
    addTransport({
      date,
      vehicleId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fuelType: fuelType as any,
      monthlyCost: Number(monthlyCost || 0),
    });
    // reset ringan
    setVehicleId("");
    setMonthlyCost("0");
  }

  return (
    <main className="px-1 pb-20">
       <header className="mb-3 flex items-center gap-2">
        <button onClick={() => router.back()} aria-label="Kembali" className="h-9 w-9 grid place-items-center">
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Transportasi
        </h1>
        <div className="h-9 w-9" />
      </header>
      
      <div
          className="mx-auto mt-3 h-[2px] w-full"
          style={{ backgroundColor: "var(--color-primary)" }}
        />

      <div className="rounded-2xl    p-4 space-y-4">
        <TextField
          id="tgl"
          label="Tanggal Laporan*"
          placeholder="klik untuk memilih tanggal"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          id="kendaraan"
          label="Pilih kendaraan terdaftar*"
          placeholder={vehicleOptions.length ? "Pilih Kendaraan" : "Belum ada kendaraan"}
          options={vehicleOptions}
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          disabled={!vehicleOptions.length}
          required
        />

        <Select
          id="bbm"
          label="Bahan Bakar yang dibeli*"
          options={FUEL_OPTS}
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          required
        />

        <TextField
          id="biaya"
          label="Berapa biaya bahan bakar selama satu bulan?"
          leftIcon={<span className="text-black/60">Rp</span>}
          inputMode="numeric"
          placeholder="0"
          value={monthlyCost}
          onChange={(e) => setMonthlyCost(e.target.value)}
        />

        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSave}>
          Simpan Data
        </Button>
      </div>
    </main>
  );
}
