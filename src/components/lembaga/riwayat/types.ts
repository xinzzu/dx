export type OrgReport = {
  id: string;
  year: number;     // e.g. 2025
  month: number;    // 1-12
  totalEmisi: number;     // kg CO2e
  pengurangan: number;    // kg CO2e bulan tsb
  trendPct: number;       // +15 / -10 (dibanding bulan lalu)
};

export function formatMonthYear(m: number, y: number) {
  const namaBulan = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];
  return `${namaBulan[m - 1]} ${y}`;
}
