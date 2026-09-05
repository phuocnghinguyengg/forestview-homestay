export default function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <p className="text-sm text-neutral-500">
        {label}
      </p>

      <p
        className={`mt-2 font-display text-2xl font-semibold ${
          accent ? "text-primary" : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}