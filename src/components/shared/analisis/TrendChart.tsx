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

export default function TrendBarLembaga({ data, displayMode }: { data: MonthPoint[]; displayMode?: 'default' | 'day' }) {
  return (
    <div className="w-full" style={{ height: 250 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: 16, bottom: 0 }}>
          <CartesianGrid stroke="#EAEAEA" vertical={false} />
          {/* ⬇️ kunci: pakai 'label' bukan 'name' */}
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            // When displaying monthly/day view, show only the day number (e.g. '1', '2')
            tickFormatter={displayMode === 'day' ? ((label: string) => {
              // label expected like '1 Nov' or '12 Nov' -> return the leading number
              if (!label) return '';
              const m = String(label).match(/^\s*(\d+)/);
              return m ? m[1] : label;
            }) : undefined}
            // show all ticks for daily view so labels are numeric 1..30
            interval={displayMode === 'day' ? 0 : 'preserveEnd'}
          />
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
