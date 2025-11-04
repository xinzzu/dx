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
        { id: "elec",  name: "Energi Listrik",  valueKg: 650, accent: "orange", iconSrc: "/images/lembaga/catat/riwayat/energy.png" },
        { id: "trans", name: "Transportasi",     valueKg: 450, accent: "blue",   iconSrc: "/images/lembaga/catat/riwayat/transport.png" },
        { id: "waste", name: "Produksi Sampah",  valueKg: 150, accent: "red",    iconSrc: "/images/lembaga/catat/riwayat/trash.png" },
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
        { id: "elec",  name: "Energi Listrik",  valueKg: 650, accent: "orange", iconSrc: "/images/lembaga/catat/riwayat/energy.png" },
        { id: "trans", name: "Transportasi",     valueKg: 450, accent: "blue",   iconSrc: "/images/lembaga/catat/riwayat/transport.png" },
        { id: "waste", name: "Produksi Sampah",  valueKg: 150, accent: "red",    iconSrc: "/images/lembaga/catat/riwayat/trash.png" },
      ],
    },
  ]

  return (
    <main className="mx-auto max-w-screen-sm">
      <HistoryHeader backHref="/lembaga/catat" />
      <div className="px-4 py-4">
        <ReportHistoryList reports={reports} />
      </div>
    </main>
  )
}
