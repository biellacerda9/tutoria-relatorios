export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-2">
      <h3 className="font-serif text-xl text-ink">{title}</h3>
      {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
    </div>
  );
}
