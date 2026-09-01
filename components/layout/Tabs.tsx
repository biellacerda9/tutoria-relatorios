"use client";

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <nav className="flex gap-6 border-b border-line">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 pb-3 text-sm transition-colors ${
            active === tab.id
              ? "font-semibold text-ink"
              : "text-muted hover:text-ink"
          }`}
        >
          {tab.label}
          {typeof tab.badge === "number" && tab.badge > 0 && (
            <span className="rounded-full bg-warn-soft px-1.5 py-0.5 text-[11px] font-semibold text-warn-ink">
              {tab.badge}
            </span>
          )}
          {active === tab.id && (
            <span className="absolute right-0 -bottom-px left-0 h-0.5 bg-accent" />
          )}
        </button>
      ))}
    </nav>
  );
}
