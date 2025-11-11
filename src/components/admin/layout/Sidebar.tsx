'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Database, Map, Users, Settings, ChevronDown, ChevronRight, Car, Zap, Trash2, Utensils, Medal, Puzzle } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';

const menuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard Overview',
    icon: BarChart3,
    path: '/admin/dashboard',
  },
  {
    id: 'emissions',
    label: 'Data Emisi',
    icon: Database,
    path: '/admin/emissions',
  },
  {
    id: 'map',
    label: 'Peta Persebaran',
    icon: Map,
    path: '/admin/distribution-map',
  },
  {
    id: 'users',
    label: 'Data Pengguna',
    icon: Users,
    path: '/admin/users',
  },
  {
    id: 'settings',
    label: 'Pengaturan',
    icon: Settings,
    children: [
      {
        id: 'transportation',
        label: 'Transportasi',
        icon: Car,
        path: '/admin/settings/transportation',
      },
      {
        id: 'electricity',
        label: 'Listrik',
        icon: Zap,
        path: '/admin/settings/electricity',
      },
      {
        id: 'waste',
        label: 'Sampah',
        icon: Trash2,
        path: '/admin/settings/waste',
      },
      {
        id: 'food',
        label: 'Makanan',
        icon: Utensils,
        path: '/admin/settings/food',
      },
      {
        id: 'gamification',
        label: 'Gamifikasi',
        icon: Medal,
        path: '/admin/settings/gamification',
      },
      { id: 'other', label: 'Lainnya', icon: Puzzle, path: '/admin/settings/other' },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col shadow-lg z-50">
      {/* Logo Section */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <Image src="/logo-1000-cahaya.svg" alt="logo" width={100} height={100} className="rounded-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">1000CahayaMu</h1>
            <p className="text-sm text-slate-400">Carbon Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            // Jika item punya children → dropdown
            if (item.children) {
              const isOpen = openDropdown === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => toggleDropdown(item.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                      isOpen ? 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5 text-slate-400" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  </button>

                  {/* Dropdown Items */}
                  <ul className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 mt-2' : 'max-h-0'}`}>
                    {item.children.map((child) => {
                      const childActive = pathname === child.path;
                      const ChildIcon = child.icon;
                      return (
                        <li key={child.id}>
                          <Link
                            href={child.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                              childActive ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400'
                            }`}
                          >
                            <ChildIcon className={`w-5 h-5 ${childActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                            <span className="font-medium">{child.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            }

            // Menu utama tanpa dropdown
            return (
              <li key={item.id}>
                <Link
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 
                    ${isActive ? 'bg-emerald-500/10 text-emerald-400 border-r-2 border-emerald-400' : 'text-slate-300 hover:bg-slate-800 hover:text-emerald-400'}
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-center text-xs text-slate-500">© 2024 1000CahayaMu</div>
      </div>
    </aside>
  );
}
