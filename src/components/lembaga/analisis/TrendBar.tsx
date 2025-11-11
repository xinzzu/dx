"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

export type MonthPoint = { label: string; value: number };

export default function TrendBarLembaga({ data }: { data: MonthPoint[] }) {
  return (
    <div className="w-full" style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 10, bottom: 0 }}>
          <CartesianGrid stroke="#EAEAEA" vertical={false} />
          {/* ⬇️ kunci: pakai 'label' bukan 'name' */}
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={28} />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            formatter={(v: number) => [`${v} kg CO₂e`, "Emisi"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8B7CFF">
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v: unknown) => (v as number).toString()} 
              style={{ fontSize: 12, fill: "#666" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
