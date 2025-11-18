import { Suspense } from 'react';
import { EmissionContent } from '@/components/admin/pages/emissions/EmissionContent';

export default function EmissionPage() {
  return (
    <Suspense fallback={<div className="p-6">Memuat data emisi...</div>}>
      <EmissionContent />
    </Suspense>
  );
}
