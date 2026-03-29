import { Card } from "./Card";

interface StatCardProps {
  title: string;
  value: number;
  hint: string;
}

export function StatCard({ title, value, hint }: StatCardProps) {
  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-[var(--muted)]">{title}</p>
      <p className="font-[var(--font-heading)] text-4xl font-semibold text-brand-900">{value}</p>
      <p className="text-xs uppercase tracking-wide text-brand-600">{hint}</p>
    </Card>
  );
}

