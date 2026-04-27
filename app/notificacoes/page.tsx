"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, DataTable, PageHeader, StatusAlert } from "@/components/ui";
import { getNotificacoes } from "@/services";
import { Notificacao } from "@/types";
import { formatDate } from "@/lib/formatters";

interface NotificacaoAgrupada {
  id: string;
  mensagem: string;
  proprietarioNome: string;
  canais: string[];
  status: string[];
  createdAt?: string;
}

function toTimestamp(value?: string): number {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notificacoesAgrupadas = useMemo<NotificacaoAgrupada[]>(() => {
    const grouped = new Map<string, NotificacaoAgrupada>();

    for (const notificacao of notificacoes) {
      const proprietarioId = notificacao.proprietario?.id ?? "SEM_PROPRIETARIO";
      const key = `${notificacao.ocorrenciaId}-${proprietarioId}-${notificacao.mensagem}`;

      const existing = grouped.get(key);
      if (!existing) {
        grouped.set(key, {
          id: key,
          mensagem: notificacao.mensagem,
          proprietarioNome: notificacao.proprietario?.nome ?? "-",
          canais: [String(notificacao.canal)],
          status: [String(notificacao.status)],
          createdAt: notificacao.createdAt
        });
        continue;
      }

      if (!existing.canais.includes(String(notificacao.canal))) {
        existing.canais.push(String(notificacao.canal));
      }

      if (!existing.status.includes(String(notificacao.status))) {
        existing.status.push(String(notificacao.status));
      }

      if (toTimestamp(notificacao.createdAt) > toTimestamp(existing.createdAt)) {
        existing.createdAt = notificacao.createdAt;
      }
    }

    return Array.from(grouped.values()).sort(
      (a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt)
    );
  }, [notificacoes]);

  async function loadNotificacoes() {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotificacoes();

      if (!Array.isArray(data)) {
        setNotificacoes([]);
        setError("Formato de resposta inesperado para notificacoes.");
        return;
      }

      const safeData = data.filter(
        (item): item is Notificacao => Boolean(item && typeof item === "object")
      );

      setNotificacoes(safeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar as notificacoes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNotificacoes();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Lista de Notificacoes"
          description="Acompanhe o historico de notificacoes enviadas aos proprietarios."
        />
        <Button variant="secondary" onClick={() => void loadNotificacoes()} isLoading={loading}>
          Atualizar
        </Button>
      </div>

      {error ? <StatusAlert type="error" message={error} /> : null}

      <DataTable
        title="Notificacoes"
        data={notificacoesAgrupadas}
        loading={loading}
        emptyMessage="Nenhuma notificacao encontrada."
        columns={[
          {
            header: "Status",
            render: (notificacao) => (
              <span className="rounded-lg bg-accent-50 px-2 py-1 text-xs font-semibold text-accent-700">
                {notificacao.status.join(" / ")}
              </span>
            )
          },
          {
            header: "Canal",
            render: (notificacao) => notificacao.canais.join(" + ")
          },
          { header: "Mensagem", render: (notificacao) => notificacao.mensagem },
          { header: "Proprietario", render: (notificacao) => notificacao.proprietarioNome },
          { header: "Data", render: (notificacao) => formatDate(notificacao.createdAt) }
        ]}
      />
    </div>
  );
}
