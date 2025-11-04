"use client"

import React from "react"
import { WasteForm } from "./WasteForm"
import type { WasteCategoryDef, Unit } from "./types"

type Payload = {
  date: string
  items: { id: string; amount: number; unit: Unit; amountKg: number }[]
  totalKg: number
}

export default function WasteFormSection({
  categories,
}: { categories: WasteCategoryDef[] }) {
  const handleSubmit = React.useCallback((payload: Payload) => {
    // tempat interaksi client (API call, toast, router, dll)
    console.log("LEMBAGA_WASTE_PAYLOAD", payload)
  }, [])

  return <WasteForm categories={categories} onSubmit={handleSubmit} />
}
