// src/components/analysis/TrendChart.tsx
"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";
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

type Point = { name: string; value: number };

export default function TrendChart({ data }: { data: Point[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke="#eee" vertical={false} />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={28}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: "rgba(0,0,0,0.04)" }}
            // formatter={(v: number) => [`${v} kg CO₂e`, "Emisi"]}
            formatter={(v: number) => [`${formatCarbonFootprint(v).value} ${formatCarbonFootprint(v).unit}`, "Emisi"]}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8B7CFF">
            <LabelList
              dataKey="value"
              position="top"
              formatter={(v: unknown) => (v as number).toString()} // Perubahan di sini
              style={{ fontSize: 12, fill: "#666" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}