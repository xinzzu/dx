export default function RegisterAsetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-white text-black">
      {/* Container utama untuk halaman lembaga */}
      <div className="mx-auto max-w-sm px-4 pt-4 pb-20">{children}</div>
    </div>
  );
}
