"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import { TransportEntry, VehicleType, Fuel } from "./types";

function Pill({
  active, children, onClick,
}: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "h-10 rounded-xl px-4 text-sm border transition",
        active
          ? "bg-[color:var(--color-secondary)] border-[color:var(--color-primary)]"
          : "bg-white border-black/15",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
type FuelOption = "bensin" | "solar" | "listrik";
const FUEL_OPTS: FuelOption[] = ["bensin", "solar", "listrik"];

export default function TransportModal({
  open,
  type,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  type: VehicleType;
  initial?: TransportEntry;
  onClose: () => void;
  onSave: (entry: TransportEntry) => void;
}) {
  const [uses, setUses] = useState<string>("");       // kali/bulan
  const [dist, setDist] = useState<string>("");       // km/hari
  const [fuel, setFuel] = useState<Fuel>(null);

  useEffect(() => {
    if (!open) return;
    setUses(initial ? String(initial.usesPerMonth) : "");
    setDist(initial ? String(initial.dailyDistanceKm) : "");
    setFuel(initial ? initial.fuel : (["mobil","motor"].includes(type) ? "bensin" : null));
  }, [open, initial, type]);

  const canFuel = type === "mobil" || type === "motor";

  const valid = useMemo(() => {
    const u = Number(uses), d = Number(dist);
    return Number.isFinite(u) && u > 0 && Number.isFinite(d) && d > 0 && (!canFuel || !!fuel);
  }, [uses, dist, fuel, canFuel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4">
        {/* header */}
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">{type}</h2>
          <button onClick={onClose} aria-label="Tutup" className="text-xl">×</button>
        </div>

        {/* form */}
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">
              Berapa kali anda menggunakannya dalam satu bulan?
            </p>
            <div className="mt-2 flex items-center gap-2">
              <TextField
                inputMode="numeric"
                pattern="\d*"
                value={uses}
                onChange={(e) => setUses(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="flex-1"
              />
              <span className="text-sm">kali</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Perkiraan jarak tempuh dalam satu hari?</p>
            <div className="mt-2 flex items-center gap-2">
              <TextField
                inputMode="numeric"
                pattern="\d*"
                value={dist}
                onChange={(e) => setDist(e.target.value.replace(/\D/g, ""))}
                placeholder="0"
                className="flex-1"
              />
              <span className="text-sm">km</span>
            </div>
          </div>

          {canFuel && (
            <div>
              <p className="text-sm font-medium">Bahan bakar yang digunakan?</p>
              <div className="mt-2 flex gap-2">
                {FUEL_OPTS.map((f) => (
                  <Pill key={f} active={fuel === f} onClick={() => setFuel(f)}>
                    {f[0].toUpperCase() + f.slice(1)}
                  </Pill>
                ))}
              </div>
            </div>
          )}

          <Button
            className="w-full mt-2"
            disabled={!valid}
            onClick={() => {
              onSave({
                type,
                usesPerMonth: Number(uses),
                dailyDistanceKm: Number(dist),
                fuel: canFuel ? fuel : null,
                updatedAt: Date.now(),
              });
              onClose();
            }}
          >
            Simpan
          </Button>
        </div>
      </div>
    </div>
  );
}
