"use client"

import React from "react"
import Button from "@/components/ui/Button"
import TextField from "@/components/ui/TextField"
import type { Unit, WasteCategoryDef } from "./types"
import { toKg } from "./types"
import { WasteCategoryField } from "./WasteCategoryField"

type State = Record<string, { amount: string; unit: Unit }>

interface Props {
  categories: WasteCategoryDef[]
  onSubmit?: (payload: {
    date: string,
    items: { id: string, amount: number, unit: Unit, amountKg: number }[],
    totalKg: number,
  }) => void
}

export function WasteForm({ categories, onSubmit }: Props) {
  const [date, setDate] = React.useState<string>("")
  const [touched, setTouched] = React.useState<boolean>(false)

  const [values, setValues] = React.useState<State>(() =>
    Object.fromEntries(categories.map(c => [c.id, { amount: "", unit: "kg" as Unit }]))
  )

  const setAmount = (id: string, v: string) =>
    setValues(s => ({ ...s, [id]: { ...s[id], amount: v } }))

  const setUnit = (id: string, u: Unit) =>
    setValues(s => ({ ...s, [id]: { ...s[id], unit: u } }))

  const items = categories.map(c => {
    const it = values[c.id] ?? { amount: "", unit: "kg" as Unit }
    const amount = parseFloat(it.amount || "0")
    const amountKg = toKg(it.amount, it.unit)
    return { id: c.id, amount, unit: it.unit, amountKg }
  })

  // tanggal wajib + minimal 1 kategori > 0
  const hasAtLeastOne = items.some(it => it.amountKg > 0)
  const canSubmit = Boolean(date) && hasAtLeastOne

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        setTouched(true)
        if (!canSubmit) return
        const totalKg = items.reduce((acc, it) => acc + it.amountKg, 0)
        onSubmit?.({ date, items, totalKg })
      }}
    >
      {/* Tanggal Laporan – DISERAGAMKAN */}
      <TextField
        id="tgl"
        label="Tanggal Laporan"
        type="date"
        value={date}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
        required
      />

      <p className="text-[15px] text-gray-700">
        Berapa banyak produksi sampah dihasilkan pada bulan ini?
        <br />
        <span className="text-xs text-black/60">
          *Minimal isi salah satu kategori. Yang lain boleh dikosongkan.
        </span>
      </p>

      {/* Daftar kategori */}
      <div className="space-y-3">
        {categories.map((c) => (
          <WasteCategoryField
            key={c.id}
            def={c}
            amount={values[c.id]?.amount ?? ""}
            unit={(values[c.id]?.unit ?? "kg") as Unit}
            onAmountChange={(v) => setAmount(c.id, v)}
            onUnitChange={(u) => setUnit(c.id, u)}
          />
        ))}
      </div>

      {/* Pesan error saat submit tanpa kategori terisi */}
      {touched && !hasAtLeastOne && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          Minimal isi salah satu kategori dengan nilai &gt; 0.
        </div>
      )}

      <div className="pt-2">
        <Button type="submit" disabled={!canSubmit} className="w-full">
          Simpan Data
        </Button>
      </div>
    </form>
  )
}
