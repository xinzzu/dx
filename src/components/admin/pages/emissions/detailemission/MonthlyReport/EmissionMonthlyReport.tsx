'use client';
import { useMemo, useState, useEffect } from 'react';
import { FileText } from 'lucide-react';
import { EmissionCard, EmissionCardProps } from './EmissionCard';
import { MonthYearFilter } from './MonthYearFilter';
import { getMonthlyReports } from '@/lib/api/monthlyReport';
import type { MonthlyReportData } from '@/types/monthlyReportType';
import { formatCarbonFootprint } from '@/utils/carbonAnalysis';

interface EmissionMonthlyReportProps {
  userId: string;
}

function formatMonthYear(month: number, year: number) {
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1));
}

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function EmissionMonthlyReport({ userId }: EmissionMonthlyReportProps) {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch monthly reports saat month/year berubah
  useEffect(() => {
    if (!userId) return;

    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const data = await getMonthlyReports(userId, month, year);
        if (mounted) setReportData(data);
      } catch (error) {
        console.error('Failed to fetch monthly reports:', error);
        if (mounted) setReportData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, month, year]);

  // ✅ Transform API data to EmissionCard format
  const items: EmissionCardProps[] = useMemo(() => {
    if (!reportData) return [];

    const cards: EmissionCardProps[] = [];

    // Transportation Reports
    reportData.transportation_reports.forEach((report) => {
      cards.push({
        category: 'Transportasi',
        date: formatDate(report.report_date),
        titleLeft: 'Kendaraan:',
        titleRight: report.asset_name,
        fields: [
          { label: 'Biaya:', value: `Rp ${report.total_cost_rp.toLocaleString('id-ID')}` },
          { label: 'Estimasi Liter:', value: `${report.estimasi_liter} L`, strong: true },
        ],
        emissionKg: report.total_co2e,
      });
    });

    // Electricity Reports
    reportData.electricity_reports.forEach((report) => {
      cards.push({
        category: 'Energi Listrik',
        date: formatDate(report.report_date),
        titleLeft: 'Bangunan:',
        titleRight: report.asset_name,
        fields: [
          { label: 'Biaya Listrik:', value: `Rp ${report.total_cost_rp.toLocaleString('id-ID')}` },
          { label: 'Konsumsi Grid:', value: `${report.consumed_grid_kwh.toFixed(2)} kWh`, strong: true },
        ],
        renewable: report.renewable_energy
          ? {
            type: report.renewable_energy.type,
            production: `${report.renewable_energy.energy_produced} kWh`,
          }
          : undefined,
        emissionKg: report.total_co2e,
      });
    });

    // Food Reports
    reportData.food_reports.forEach((report) => {
      const fields = [{ label: 'Periode Laporan:', value: report.periode_laporan === 'Weekly' ? 'Mingguan' : 'Bulanan', strong: true }];

      report.items.forEach((item) => {
        fields.push({
          label: `${item.name}:`,
          value: item.frequency,
          strong: false, // ✅ Tambahkan ini
        });
      });

      cards.push({
        category: 'Konsumsi Makanan',
        date: formatDate(report.report_date),
        fields,
        emissionKg: report.total_co2e_for_this_report,
      });
    });

    // Waste Reports
    reportData.waste_reports.forEach((report) => {
      const fields = [{ label: 'Periode Laporan:', value: report.periode_laporan === 'Weekly' ? 'Mingguan' : 'Bulanan', strong: true }];

      report.items.forEach((item) => {
        fields.push({
          label: `${item.name}:`,
          value: `${item.weight_kg} kg`,
          strong: false, // ✅ Tambahkan ini
        });
      });

      cards.push({
        category: 'Produksi Sampah',
        date: formatDate(report.report_date),
        fields,
        emissionKg: report.total_co2e_for_this_report,
      });
    });

    return cards;
  }, [reportData]);

  const monthTotal = reportData?.total_emisi_kgco2e ?? 0;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-700" />
          <h3 className="text-gray-800 font-semibold">Laporan Emisi per Bulan</h3>
        </div>

        {/* Filter bulan & tahun */}
        <MonthYearFilter month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-800">{formatMonthYear(month, year)}</h4>
          <div className="text-right">
            <div className="text-xs text-gray-500">Total Emisi Bulan Ini</div>
            <div className="text-rose-600 text-2xl font-bold">{loading ? '...' : formatCarbonFootprint(monthTotal).value} {loading ? '' : formatCarbonFootprint(monthTotal).unit}</div>
          </div>
        </div>

        {loading ? (
          <div className="mt-4 h-32 bg-gray-100 animate-pulse rounded-md" />
        ) : items.length > 0 ? (
          <div className="mt-4 max-h-[400px] overflow-y-auto pr-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it, idx) => (
                <EmissionCard key={`${it.category}-${idx}`} {...it} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 text-center py-8 text-gray-500">Tidak ada laporan emisi untuk bulan ini</div>
        )}
      </div>
    </section>
  );
}
