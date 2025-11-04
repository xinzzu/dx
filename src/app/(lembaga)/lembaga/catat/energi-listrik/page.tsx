"use client";

import { useMemo, useState } from "react";
import { useAssetWizard } from "@/stores/assetWizard";
import { useUsage } from "@/stores/catat/usage";
import Select from "@/components/ui/Select";
import TextField from "@/components/ui/TextField";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const CLEAN_TYPES = [
  { value: "solar", label: "Solar (PLTS)" },
  { value: "angin", label: "Angin" },
  { value: "air", label: "Air" },
  { value: "lainnya", label: "Lainnya" },
];

export default function CatatEnergiLembagaPage() {
  const { buildings } = useAssetWizard();
  const { addEnergy } = useUsage();
  const router = useRouter();
  const [date, setDate] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [billCost, setBillCost] = useState("");
  const [useClean, setUseClean] = useState<boolean | undefined>(undefined);
  const [cleanType, setCleanType] = useState("");
  const [cleanKwh, setCleanKwh] = useState("");



  const buildingOptions = useMemo(
    () => buildings.map((b) => ({ value: b.id, label: b.name })),
    [buildings]
  );

  const canSubmit =
    !!date &&
    !!buildingId &&
    Number(billCost) >= 0 &&
    (useClean === undefined ||
      (useClean === true ? cleanType !== "" && Number(cleanKwh) >= 0 : true));

  function handleSave() {
    if (!canSubmit) return;
    addEnergy({
      date,
      buildingId,
      billCost: Number(billCost || 0),
      useClean: useClean,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cleanType: useClean ? (cleanType as any) : undefined,
      cleanKwh: useClean ? Number(cleanKwh || 0) : undefined,
    });
    // reset ringan
    setBillCost("0");
    setCleanType("");
    setCleanKwh("0");
  }

  return (
    <main className="px-4 pb-28">
      <header className="mb-3 flex items-center gap-2">
        <button
          onClick={() => router.back()}
          aria-label="Kembali"
          className="h-9 w-9 grid place-items-center"
        >
          <Image src="/arrow-left.svg" alt="" width={18} height={18} />
        </button>
        <h1 className="flex-1 text-center text-lg font-semibold">
          Energi Listrik
        </h1>
        <div className="h-9 w-9" />
      </header>

      <div
        className="mx-auto mt-3 h-[2px] w-full"
        style={{ backgroundColor: "var(--color-primary)" }}
      />

      <div className="rounded-2xl  p-4 space-y-4">
        <TextField
          id="tgl"
          label="Tanggal Laporan*"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          id="bangunan"
          label="Pilih bangunan terdaftar*"
          placeholder={
            buildingOptions.length ? "Pilih Bangunan" : "Belum ada bangunan"
          }
          options={buildingOptions}
          value={buildingId}
          onChange={(e) => setBuildingId(e.target.value)}
          disabled={!buildingOptions.length}
          required
        />

        <TextField
          id="biayaListrik"
          label="Berapa biaya tagihan listrik bulanan?"
          placeholder="0"
          leftIcon={<span className="text-black/60">Rp</span>}
          inputMode="numeric"
          value={billCost}
          onChange={(e) => setBillCost(e.target.value)}
        />

        {/* Toggle energi bersih */}
        <div>
          <div className="mb-2 text-sm text-black">
            Apakah di bangunan ini juga menggunakan energi bersih?{" "}
            <span className="text-xs text-black/50">(Opsional)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={useClean === true ? "primary" : "outline"}
              onClick={() => setUseClean(true)}
            >
              Ya
            </Button>
            <Button
              type="button"
              variant={useClean === false ? "primary" : "outline"}
              onClick={() => setUseClean(false)}
            >
              Tidak
            </Button>
          </div>
        </div>

        {useClean === true && (
          <>
            <Select
              id="jenisBersih"
              label="Jenis Energi Bersih"
              placeholder="Pilih jenis energi bersih"
              options={CLEAN_TYPES}
              value={cleanType}
              onChange={(e) => setCleanType(e.target.value)}
            />
            <TextField
              id="kwh"
              label="Berapa kWh yang dihasilkan?"
              placeholder="0"
              rightIcon={<span className="text-black/60">kWh</span>}
              inputMode="numeric"
              value={cleanKwh}
              onChange={(e) => setCleanKwh(e.target.value)}
            />
          </>
        )}

        <Button fullWidth size="lg" disabled={!canSubmit} onClick={handleSave}>
          Simpan Data
        </Button>
      </div>
    </main>
  );
}
