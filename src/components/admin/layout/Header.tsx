'use client';
import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HeaderAdminProps {
  title: string;
  userName?: string;
}

export default function Header({ title, userName = 'Admin CahayaMu' }: HeaderAdminProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('is_admin');
    router.push('/login-admin');
  };

  // Tutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-64 right-0 z-40 bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Judul halaman */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">Dashboard Admin - Sistem Jejak Karbon</p>
        </div>

        {/* Dropdown Profile */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setDropdownOpen((prev) => !prev)} className="flex items-center space-x-3 px-3 py-2 rounded-md hover:bg-slate-100 focus:outline-none">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-500 text-white">
              <User className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-slate-900">{userName}</div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-md">
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-slate-50 rounded-md">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
