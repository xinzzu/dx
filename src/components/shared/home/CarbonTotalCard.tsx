"use client";

type Props = {
  totalKg: number;
};

export default function CarbonTotalCard({ totalKg }: Props) {
  const formatted =
    typeof totalKg === "number" && !Number.isNaN(totalKg)
      ? Intl.NumberFormat("id-ID").format(totalKg)
      : "0";

  return (
    <section
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <p className="text-center text-black/70 text-sm">Jejak Karbon Anda:</p>
      <div className="mt-2 text-center text-5xl font-semibold text-[color:var(--color-primary)]">
        {formatted}
      </div>
      <p className="text-center text-sm">kg CO₂e bulan ini</p>
    </section>
  );
}
