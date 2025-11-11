'use-client';
import { UserFilter } from './UserFilter';
import { UserTable } from './UserTable';
import { StatCardUser } from './StatCard';

export function UserContent() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCardUser title="Total Pengguna" value="3.989" change="Pengguna" />
        <StatCardUser title="Pengguna Aktif" value="3.847" change="Pengguna" />
        <StatCardUser title="Lembaga" value="2.847" change="Pengguna" />
        <StatCardUser title="Individu" value="1.847" change="Pengguna" />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 shadow-sm">
        <UserFilter />
        <UserTable />
      </div>
    </div>
  );
}
