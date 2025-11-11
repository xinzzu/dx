"use client";

type Props = {
  label: string;
  value: string;
  sub?: string;
};

export default function StatTile({ label, value, sub }: Props) {
  return (
    <div className="rounded-xl border bg-white p-4"
         style={{ borderColor: "var(--color-primary)" }}>
      <div className="text-black/70 text-sm">{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub ? <div className="text-sm text-black/60">{sub}</div> : null}
    </div>
  );
}
