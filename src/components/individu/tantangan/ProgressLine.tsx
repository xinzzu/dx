"use client";

type Props = {
  value: number;   // 0..1
  className?: string;
};

export default function ProgressLine({ value, className = "" }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className={["h-2 w-full rounded-full bg-black/10", className].join(" ")}>
      <div
        className="h-2 rounded-full"
        style={{ width: `${pct}%`, backgroundColor: "var(--color-primary)" }}
      />
    </div>
  );
}
