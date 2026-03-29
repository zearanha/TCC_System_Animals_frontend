"use client";

import { useEffect, useState } from "react";
import { Button, DataTable, PageHeader, StatusAlert } from "@/components/ui";
import { getNotificacoes } from "@/services";
import { Notificacao } from "@/types";
import { formatDate } from "@/lib/formatters";

export default function NotificacoesPage() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNotificacoes() {
    setLoading(true);
    setError(null);
    try {
      const data = await getNotificacoes();
      setNotificacoes(data);
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
        data={notificacoes}
        loading={loading}
        emptyMessage="Nenhuma notificacao encontrada."
        columns={[
          {
            header: "Status",
            render: (notificacao) => (
              <span className="rounded-lg bg-accent-50 px-2 py-1 text-xs font-semibold text-accent-700">
                {notificacao.status}
              </span>
            )
          },
          { header: "Canal", render: (notificacao) => notificacao.canal },
          { header: "Mensagem", render: (notificacao) => notificacao.mensagem },
          {
            header: "Proprietario",
            render: (notificacao) => notificacao.proprietario?.nome ?? "-"
          },
          { header: "Data", render: (notificacao) => formatDate(notificacao.createdAt) }
        ]}
      />
    </div>
  );
}

