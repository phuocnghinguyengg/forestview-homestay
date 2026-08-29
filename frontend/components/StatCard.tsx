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
    <div className="rounded-2xl border border-neutral-200 p-5">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent ? "text-rose-600" : "text-neutral-900"}`}>
        {value}
      </p>
    </div>
  );
}