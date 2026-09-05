"use client";

export default function TabSwitcher<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: T; label: string; icon?: React.ReactNode }[];
  active: T;
  onChange: (key: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-line pb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition ${
            active === tab.key
              ? "bg-primary text-white shadow-xs"
              : "bg-base text-neutral-600 hover:bg-neutral-200"
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
