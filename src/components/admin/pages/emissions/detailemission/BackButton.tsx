'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export function BackButton() {
  const router = useRouter();

  return (
    <button onClick={() => router.back()} className="self-start inline-flex items-center gap-2 bg-white border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
      <ArrowLeft className="w-4 h-4" />
      <span className="font-medium">Kembali ke Daftar</span>
    </button>
  );
}
