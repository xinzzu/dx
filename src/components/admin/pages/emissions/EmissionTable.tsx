import { EmissionRow } from './EmissionRow';
import { Database } from 'lucide-react';
import { emissionUser } from '@/data/EmissionUser';

export function EmissionTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-2">
        <Database className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-700">Data Emisi</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">Menampilkan {emissionUser.length} dari seluruh data emisi</p>

      <div className="w-full">
        <table className="w-full text-sm">
          <thead className="text-gray-500 text-left border-b border-gray-200">
            <tr>
              <th className="pb-2">Pengguna</th>
              <th className="pb-2">Jenis</th>
              <th className="pb-2">Total Emisi (ton) CO2e</th>
              <th className="pb-2">Rata-rata Emisi per Bulan (ton) CO2e</th>
              <th className="pb-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {emissionUser.map((row, i) => (
              <EmissionRow key={i} {...row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
