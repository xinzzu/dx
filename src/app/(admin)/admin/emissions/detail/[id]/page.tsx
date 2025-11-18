import { DetailEmissionContent } from '@/components/admin/pages/emissions/detailemission/DetailEmissionContent';

type Params = Promise<{ id: string }>;

export default async function EmissionDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  return <DetailEmissionContent id={id} />;
}
