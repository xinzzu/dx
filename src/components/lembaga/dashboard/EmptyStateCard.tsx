export default function EmptyStateCard({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section
      className="mt-4 rounded-2xl border p-4"
      style={{ borderColor: "var(--color-primary)" }}
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-black/60 mt-1">{children}</p>
    </section>
  );
}
