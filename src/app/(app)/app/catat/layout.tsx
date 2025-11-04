// Halaman transportasi butuh tampilan full tanpa BottomNav
export default function CatatAdvanceLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-black">
      <main className="w-full px-auto pt-auto md:mx-auto md:max-w-[480px]">{children}</main>
    </div>
  );
}
