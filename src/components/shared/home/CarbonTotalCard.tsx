"use client";

type Props = {
  totalKg: number;
};

export default function CarbonTotalCard({ totalKg }: Props) {
  return (
    <section
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <p className="text-center text-black/70 text-sm">Jejak Karbon Anda:</p>
      <div className="mt-2 text-center text-5xl font-semibold text-[color:var(--color-primary)]">
        {totalKg}
      </div>
      <p className="text-center text-sm">kg CO₂e bulan ini</p>
    </section>
  );
}
