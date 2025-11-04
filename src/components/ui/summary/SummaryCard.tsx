import MetricBar from "./MetricBar"

export default function SummaryCard({
  name,
  totalKg,
  transportKg,
  energyKg,
  lifestyleKg,
  equivalencyText,
}: {
  name: string
  totalKg: number
  transportKg: number
  energyKg: number
  lifestyleKg: number
  equivalencyText: string  // contoh: "Jumlah ini setara dengan menebang 30 pohon setiap bulan"
}) {
  return (
    <section
      className="rounded-2xl border p-5"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <h2 className="text-center text-lg font-semibold">
        Kerja Bagus, {name}!
      </h2>
      <p className="mt-1 text-center text-black/70 text-sm">
        Ini Hasil Jejak Karbonmu Dalam Satu Bulan
      </p>

      <div className="my-4 text-center">
        <div className="text-5xl font-semibold leading-none">
          {Intl.NumberFormat("id-ID").format(totalKg)}
        </div>
        <div className="mt-1 text-sm tracking-wide">kg CO<sub>2</sub>e</div>
      </div>

      <MetricBar label="Transportasi"            valueKg={transportKg} totalKg={totalKg} />
      <MetricBar label="Listrik & Rumah Tangga"  valueKg={energyKg}    totalKg={totalKg} />
      <MetricBar label="Limbah & Gaya Hidup"     valueKg={lifestyleKg} totalKg={totalKg} />

      <div
        className="mt-3 rounded-xl border p-3 text-sm flex items-start gap-2"
        style={{ borderColor: "var(--color-primary)" }}
      >
        <span className="mt-0.5">💡</span>
        <p className="leading-relaxed">{equivalencyText}</p>
      </div>
    </section>
  )
}
