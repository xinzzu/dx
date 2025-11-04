// src/app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-white text-black">
      <main className="mx-auto max-w-md px-4 pb-10 pt-6">{children}</main>
    </div>
  )
}