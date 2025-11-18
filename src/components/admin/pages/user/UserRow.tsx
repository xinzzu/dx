// components/UserRow.tsx
import { User, Building2, TrashIcon, Eye, Pen } from 'lucide-react';
import { UserTypes } from '@/types/userType';

interface UserRowProps extends UserTypes {
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function UserRow({ user_id, name, user_type, email, phone_number, address, is_active, onEdit, onView, onDelete }: UserRowProps) {
  const isIndividu = user_type === 'individu';
  const isActive = is_active;

  return (
    <tr className="border-b border-gray-200 last:border-none hover:bg-gray-50">
      <td className="py-3 flex items-center gap-3">
        {isIndividu ? <User className="bg-emerald-100 text-emerald-600 p-2 rounded-full w-8 h-8" /> : <Building2 className="bg-indigo-100 text-indigo-600 p-2 rounded-full w-8 h-8" />}
        <span className="font-medium text-gray-700">{name}</span>
      </td>

      <td>
        <span className={`px-3 py-2 text-xs rounded-md ${user_type ? (isIndividu ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600') : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>{user_type || '-'}</span>
      </td>

      <td className="text-gray-700">{email}</td>
      <td className="text-gray-700">{phone_number}</td>

      {/* Alamat dibungkus dan dibatasi lebarnya */}
      <td className="text-gray-700 max-w-[200px] whitespace-normal wrap-break-word leading-snug">{address}</td>

      <td>
        <span className={`px-3 py-2 text-xs rounded-md ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>{isActive ? 'Aktif' : 'Non-Aktif'}</span>
      </td>

      {/* Aksi */}
      <td>
        <div className="flex gap-2">
          <button type="button" onClick={() => onView?.(user_id)} className="bg-white hover:bg-blue-600 text-blue-600 hover:text-white rounded-md p-2 transition">
            <Eye className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => onEdit?.(user_id)} className="bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-md p-2 transition">
            <Pen className="w-4 h-4" />
          </button>

          <button type="button" onClick={() => onDelete?.(user_id)} className="bg-white hover:bg-red-600 text-red-600 hover:text-white rounded-md p-2 transition">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
