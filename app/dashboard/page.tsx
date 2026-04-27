"use client";

import { Link } from "react-router-dom";
import { PageHeader, StatCard, StatusAlert, Button, Card } from "@/components/ui";
import { useDashboardData } from "@/hooks";

const shortcuts = [
  { href: "/usuarios", label: "Modulo usuarios" },
  { href: "/proprietarios", label: "Modulo proprietarios" },
  { href: "/agentes", label: "Modulo agentes" },
  { href: "/animais", label: "Modulo animais" },
  { href: "/ocorrencias/nova", label: "Nova ocorrencia" },
  { href: "/busca-codigo", label: "Buscar MO3247" }
];

export default function DashboardPage() {
  const { counters, loading, error, refresh } = useDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Dashboard"
          description="Visao geral do monitoramento municipal de animais e ocorrencias."
        />
        <Button variant="secondary" onClick={() => void refresh()} isLoading={loading}>
          Atualizar dados
        </Button>
      </div>

      {error ? <StatusAlert type="error" message={error} /> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total de Animais" value={counters.totalAnimais} hint="Animais cadastrados" />
        <StatCard
          title="Ocorrencias"
          value={counters.totalOcorrencias}
          hint="Registros no sistema"
        />
        <StatCard
          title="Notificacoes"
          value={counters.totalNotificacoes}
          hint="Alertas para proprietarios"
        />
      </section>

      <Card className="space-y-4">
        <div>
          <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
            Atalhos Operacionais
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Acesse rapidamente as acoes mais usadas pela equipe administrativa.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shortcuts.map((shortcut) => (
            <Link
              key={shortcut.href}
              to={shortcut.href}
              className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-100"
            >
              {shortcut.label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
