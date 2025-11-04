"use client"

import React from "react"
import Button from "@/components/ui/Button"
import type { ApplianceId } from "@/stores/assetWizard"

const CATALOG: { id: ApplianceId; label: string }[] = [
  { id: "lampu", label: "Lampu" },
  { id: "kipas", label: "Kipas Angin" },
  { id: "ac", label: "AC" },
  { id: "kulkas", label: "Kulkas" },
  { id: "kompor", label: "Kompor Listrik" },
  { id: "magiccom", label: "Magic Com" },
  { id: "pemanas", label: "Pemanas Air" },
  { id: "blender", label: "Blender/Mixer" },
  { id: "mesin_cuci", label: "Mesin Cuci" },
  { id: "setrika", label: "Setrika" },
  { id: "pompa_air", label: "Pompa Air" },
  { id: "komputer", label: "Komputer/PC" },
  { id: "proyektor", label: "Proyektor" },
  { id: "sound_system", label: "Sound Sistem" },
];

type Props = {
  open: boolean
  initial?: Partial<Record<ApplianceId, number>>
  onClose: () => void
  onApply: (vals: Partial<Record<ApplianceId, number>>) => void
}

export default function ApplianceSheet({ open, initial, onClose, onApply }: Props) {
  const [vals, setVals] = React.useState<Partial<Record<ApplianceId, number>>>(initial ?? {})

  React.useEffect(() => { setVals(initial ?? {}) }, [initial, open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 animate-in fade-in duration-200" onClick={onClose} />
      
      {/* Bottom Sheet */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-[80vh] flex-col rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1.5 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 px-5 py-3">
          <div className="text-center text-lg font-semibold text-black">Peralatan Listrik</div>
          <p className="mt-1 text-center text-sm text-black/60">
            Tambahkan jumlah peralatan listrik yang ada di bangunan ini
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5">
          <div className="divide-y divide-gray-100">
            {CATALOG.map(item => {
              const n = vals[item.id] ?? 0
              return (
                <div key={item.id} className="flex items-center justify-between py-4">
                  <span className="font-medium text-black">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={n === 0}
                      className="grid h-9 w-9 place-items-center rounded-full border-2 border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      onClick={() => setVals(v => ({ ...v, [item.id]: Math.max(0, (v[item.id] ?? 0) - 1) }))}
                    >−</button>
                    <span className="min-w-[2rem] text-center font-semibold text-black">{n}</span>
                    <button
                      type="button"
                      className="grid h-9 w-9 place-items-center rounded-full bg-[var(--color-primary)] text-white hover:opacity-90 active:scale-95 transition-all"
                      onClick={() => setVals(v => ({ ...v, [item.id]: (v[item.id] ?? 0) + 1 }))}
                    >+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 border-t border-gray-200 bg-white px-5 py-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onClose}>Batal</Button>
            <Button onClick={() => onApply(vals)}>Selesai</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
