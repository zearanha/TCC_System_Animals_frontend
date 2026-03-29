interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="font-[var(--font-heading)] text-2xl font-semibold text-brand-900 md:text-3xl">
        {title}
      </h1>
      <p className="text-sm text-[var(--muted)] md:text-base">{description}</p>
    </div>
  );
}

