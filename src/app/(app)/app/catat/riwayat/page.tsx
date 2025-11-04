import React from "react"
import { ReportHistoryList } from "@/components/shared/riwayat/ReportHistoryList"
import { HistoryHeader } from "@/components/shared/riwayat/HistoryHeader"
import type { MonthReport } from "@/components/shared/riwayat/types"

export default function Page() {
  const reports: MonthReport[] = [
    {
      id: "2025-09",
      monthLabel: "September 2025",
      periodLabel: "Laporan Bulanan",
      progressPercent: 15,
      totalEmisiKg: 1250,
      penguranganKg: 25.6,
      categories: [
        { id: "elec",  name: "Energi Listrik",  valueKg: 650, accent: "orange", iconSrc: "/images/catat/energy.png" },
        { id: "trans", name: "Transportasi",     valueKg: 450, accent: "blue",   iconSrc: "/images/catat/transport.png" },
        { id: "waste", name: "Produksi Sampah",  valueKg: 150, accent: "red",    iconSrc: "/images/catat/plastic.png" },
        // { id: "food",  name: "Makanan",          valueKg: 120, accent: "green",  iconSrc: "/images/catat/food.png" },
      ],
    },
    {
      id: "2025-08",
      monthLabel: "Agustus 2025",
      periodLabel: "Laporan Bulanan",
      progressPercent: 15,
      totalEmisiKg: 1250,
      penguranganKg: 25.6,
      categories: [
        { id: "elec",  name: "Energi Listrik",  valueKg: 650, accent: "orange", iconSrc: "/images/catat/energy.png" },
        { id: "trans", name: "Transportasi",     valueKg: 450, accent: "blue",   iconSrc: "/images/catat/transport.png" },
        { id: "waste", name: "Produksi Sampah",  valueKg: 150, accent: "red",    iconSrc: "/images/catat/plastic.png" },
      ],
    },
  ]

  return (
    <main className="mx-auto max-w-screen-sm">
      <HistoryHeader backHref="/app/catat" />
      <div className="px-4 py-4">
        <ReportHistoryList reports={reports} />
      </div>
    </main>
  )
}
