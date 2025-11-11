"use client"

import React from "react"
import TextField from "@/components/ui/TextField"
import Select from "@/components/ui/Select"
import type { Unit, WasteCategoryDef } from "./types"

interface Props {
  def: WasteCategoryDef
  amount: string
  unit: Unit
  onAmountChange: (v: string) => void
  onUnitChange: (u: Unit) => void
}

export function WasteCategoryField({
  def, amount, unit, onAmountChange, onUnitChange,
}: Props) {
  return (
    <div className="rounded-xl border border-emerald-500 p-4">
      <div className="flex items-start justify-between gap-3">
        {/* Label + hint */}
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-gray-900">{def.label}</div>
          {def.hint ? (
            <div className="mt-1 text-sm leading-snug text-gray-500">{def.hint}</div>
          ) : null}
        </div>

        {/* Amount + Unit */}
        <div className="flex shrink-0 items-center gap-2">
          <div className="w-[84px]">
            <TextField
              type="number"
              inputMode="decimal"
              step="any"
              value={amount}
              placeholder="0"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onAmountChange(e.target.value)
              }
            />
          </div>

          <div className="w-[84px]">
            <Select
              value={unit}
              options={[
                { value: "kg", label: "kg" },
                { value: "g",  label: "g"  },
              ]}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                onUnitChange(e.target.value as Unit)
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
