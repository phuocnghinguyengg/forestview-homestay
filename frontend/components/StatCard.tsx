import { LucideIcon, TrendingUp } from "lucide-react";

export default function StatCard({
  label,
  value,
  accent = false,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  icon?: LucideIcon;
}) {
  const ShownIcon = Icon ?? TrendingUp;
  return (
    <div className="panel-card relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-neutral-500">{label}</p>
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-none ${accent ? "bg-lantern/15 text-lantern-dark" : "bg-primary/10 text-primary"}`}>
          <ShownIcon size={15} />
        </span>
      </div>

      <p className={`mt-3 font-display text-2xl font-semibold ${accent ? "text-accent-dark" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
