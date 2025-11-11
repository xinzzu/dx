'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EmissionPagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`flex items-center px-3 py-1.5 text-sm border rounded-md transition 
          ${currentPage === 1 ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-gray-700 border-gray-300 hover:bg-gray-100 active:bg-gray-200'}`}
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Sebelumnya
      </button>

      <span className="text-sm text-gray-600">
        Halaman {currentPage} dari {totalPages}
      </span>

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className={`flex items-center px-3 py-1.5 text-sm border rounded-md transition 
          ${currentPage === totalPages ? 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50' : 'text-gray-700 border-gray-300 hover:bg-gray-100 active:bg-gray-200'}`}
      >
        Berikutnya <ChevronRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
}
