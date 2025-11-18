'use client';
import React from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import Sidebar from '@/components/admin/layout/Sidebar';
import Header from '@/components/admin/layout/Header';
import { usePathname } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface LayoutProps {
  children: React.ReactNode;
}

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const pathTitles: Record<string, string> = {
  '/admin/dashboard': 'Dashboard Overview',
  '/admin/emissions': 'Data Emisi',
  '/admin/distribution-map': 'Peta Persebaran Emisi',
  '/admin/users': 'Manajemen Pengguna',
  '/admin/settings': 'Pengaturan',
  '/admin/settings/transportation': 'Pengaturan Transportasi',
  '/admin/settings/electricity': 'Pengaturan Listrik',
  '/admin/settings/waste': 'Pengaturan Sampah',
  '/admin/settings/food': 'Pengaturan Makanan',
  '/admin/settings/gamification': 'Pengaturan Gamifikasi',
  '/admin/settings/other': 'Pengaturan Lainnya',
};

export default function AdminLayout({ children }: LayoutProps) {
  const { isLoading } = useAdminAuth();

  const pathname = usePathname();
  let title = pathTitles[pathname] || 'Dashboard';
  if (pathname?.startsWith('/admin/emissions/detail/')) {
    title = 'Detail Emisi Pengguna';
  }
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  // Layout utama admin
  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans flex min-h-screen bg-slate-50`}>
      <Sidebar />
      <div className="flex-1 flex flex-col font-sans ml-64">
        <Header title={title} />
        <main className="p-6 mt-21 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
