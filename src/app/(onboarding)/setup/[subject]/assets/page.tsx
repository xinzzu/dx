import { redirect } from "next/navigation";

type AssetsPageProps = {
  params: Promise<{ subject: "individu" | "lembaga" }>;
};

export default async function AssetsIndex({ params }: AssetsPageProps) {
  const { subject } = await params;
  redirect(`/setup/${subject}/assets/bangunan`);
}
