// src/components/analysis/DonutChart.tsx
"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Slice = { key: string; value: number; color: string };

export default function DonutChartLembaga({ data }: { data: Slice[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="grid grid-cols-2 items-center gap-4">
      {/* 1. Beri aspek rasio pada container */}
      <div className="relative w-full" style={{ paddingBottom: '100%' }}>
        <div className="absolute inset-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                // formatter={(v: number, _, idx) => [
                //   `${v} kg CO₂e`,
                //   data[idx as number]?.key ?? "Kategori",
                // ]}
                formatter={(v: number, _, idx) => [
                  `${formatCarbonFootprint(v).value} ${formatCarbonFootprint(v).unit}`,
                  data[idx as number]?.key ?? "Kategori",
                ]}
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                innerRadius="75%" // 2. Sesuaikan radius agar pas
                outerRadius="100%"
                paddingAngle={3}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((s, i) => (
                  <Cell key={s.key} fill={s.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend kanan (stack) */}
      <ul className="space-y-2">
        {data.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li key={s.key} className="flex items-center gap-3">
              <span
                className="inline-block h-3 w-3 rounded"
                style={{ backgroundColor: s.color }}
              />
              <div className="flex-1 text-sm">
                <span className="font-medium">{s.key} </span>
                <span className="text-black/60">{pct}%</span>
                <div className="text-xs text-black/60">{formatCarbonFootprint(s.value).value} {formatCarbonFootprint(s.value).unit}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}