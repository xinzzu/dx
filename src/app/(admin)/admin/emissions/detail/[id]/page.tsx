import { DetailEmissionContent } from '@/components/admin/pages/emissions/detailemission/DetailEmissionContent';

type Params = { id: string };
type Props = { params: Promise<Params> };

export default async function EmissionDetailPage({ params }: Props) {
  const { id } = await params;
  return <DetailEmissionContent id={id} />;
}
