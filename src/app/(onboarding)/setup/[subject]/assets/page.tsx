import { redirect } from "next/navigation";

export default function AssetsIndex({
  params,
}: {
  params: { subject: "individu" | "lembaga" };
}) {
  redirect(`/setup/${params.subject}/assets/bangunan`);
}
