"use client";

import { formatCarbonFootprint } from "@/utils/carbonAnalysis";
import {
  Line,
  LineChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { ServerData, processDataForMultiLine } from "@/utils/chart";

const COLORS = {
  listrik: '#8B7CFF',
  limbah: '#00C49F',
  makanan: '#FFBB28',
  transportasi: '#FF8042',
  default: '#CCCCCC',
};


export default function TrendMultiLineChart({
  serverData,
  displayMode
}: {
  serverData: ServerData;
  displayMode?: "monthly" | "weekly";
}) {
  const data = processDataForMultiLine(serverData);

  const categories = serverData.datasets.map(d => d.name);

  const formatTooltipValue = (value: number, name: string) => {
    const formatted = formatCarbonFootprint(value);
    return [`${formatted.value} ${formatted.shortUnit}`, name.charAt(0).toUpperCase() + name.slice(1)];
  };

  return (
    <div className="w-full" style={{ height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* 💡 Gunakan LineChart */}
        <LineChart data={data} margin={{ top: 20, right: 8, left: 16, bottom: 0 }}>
          <CartesianGrid stroke="#EAEAEA" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            interval={displayMode === "weekly" ? 0 : "preserveEnd"}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            width={32}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }} // Cursor dashed line
            formatter={formatTooltipValue}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />

          {/* 💡 Render satu Line untuk setiap kategori */}
          {categories.map(category => (
            <Line
              key={category}
              type="monotone" // Garis halus
              dataKey={category} // Key diambil dari nama kategori (listrik, limbah, dll.)
              name={category.charAt(0).toUpperCase() + category.slice(1)} // Nama untuk Legend
              stroke={COLORS[category as keyof typeof COLORS] || COLORS.default}
              strokeWidth={2}
              dot={false} // Titik data dihilangkan agar grafik tidak terlalu ramai
              activeDot={{ r: 4 }}
            />
          ))}

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// "use client";

// import { formatCarbonFootprint } from "@/utils/carbonAnalysis";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
//   LabelList,
// } from "recharts";

// export type MonthPoint = { label: string; value: number };

// export default function TrendBarLembaga({ data, displayMode, legendLabel, legendColor }: { data: MonthPoint[]; displayMode?: 'monthly' | 'weekly'; legendLabel?: string; legendColor?: string }) {

//   const markerColor = legendColor ?? '#8B7CFF';

//   return (
//     <div className="w-full" style={{ height: 260 }}>
//       <ResponsiveContainer width="100%" height="100%">
//         <BarChart data={data} margin={{ top: 20, right: 8, left: 16, bottom: 0 }}>
//           <CartesianGrid stroke="#EAEAEA" vertical={false} />
//           {/* ⬇️ kunci: pakai 'label' bukan 'name' */}
//           <XAxis
//             dataKey="label"
//             tickLine={false}
//             axisLine={false}
//             tick={{ fontSize: 12 }}
//             // For weekly view we expect labels like 'W1','W2' or 'Minggu 1' — show numeric week
//             tickFormatter={
//               displayMode === 'weekly'
//                 ? ((label: string) => {
//                     if (!label) return '';
//                     const s = String(label).trim();
//                     // Handle 'W1' or 'W 1'
//                     const w = s.match(/^W\s*(\d+)/i) || s.match(/^W(\d+)/i);
//                     if (w) return w[1];
//                     // Handle localized 'Minggu 1'
//                     const m2 = s.match(/^Minggu\s*(\d+)/i);
//                     if (m2) return m2[1];
//                     // Fallback: extract leading number if present
//                     const num = s.match(/^\s*(\d+)/);
//                     return num ? num[1] : s;
//                   })
//                 : undefined
//             }
//             // show all ticks for weekly view so labels are numeric 1..5
//             interval={displayMode === 'weekly' ? 0 : 'preserveEnd'}
//           />
//           <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} width={28} />
//           <Tooltip
//             cursor={{ fill: "rgba(0,0,0,0.04)" }}
//             formatter={(v: number) => [`${formatCarbonFootprint(v).value} ${formatCarbonFootprint(v).unit}`, "Emisi"]}
//           />
//           <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8B7CFF">
//             <LabelList
//               dataKey="value"
//               position="top"
//               formatter={(v: unknown) => formatCarbonFootprint(v as number).value}
//               style={{ fontSize: 12, fill: "#666" }}
//             />
//           </Bar>
//         </BarChart>
//       </ResponsiveContainer>
//       {/* Legend placed below and centered */}
//       {(legendLabel || legendColor) && (
//         <div className="mt-1 flex items-center justify-center gap-3">
//           <span className="w-3 h-3 rounded-full" style={{ background: markerColor }} />
//           <div className="text-sm text-gray-700">{legendLabel ?? 'Nilai'}</div>
//         </div>
//       )}
//     </div>
//   );
// }


