"use client";

import { useCallback, useEffect, useState } from "react";
import { getAnimais, getNotificacoes, getOcorrencias } from "@/services";

interface DashboardCounters {
  totalAnimais: number;
  totalOcorrencias: number;
  totalNotificacoes: number;
}

const initialCounters: DashboardCounters = {
  totalAnimais: 0,
  totalOcorrencias: 0,
  totalNotificacoes: 0
};

export function useDashboardData() {
  const [counters, setCounters] = useState<DashboardCounters>(initialCounters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [animais, ocorrencias, notificacoes] = await Promise.all([
        getAnimais(),
        getOcorrencias(),
        getNotificacoes()
      ]);

      setCounters({
        totalAnimais: animais.length,
        totalOcorrencias: ocorrencias.length,
        totalNotificacoes: notificacoes.length
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel carregar o dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { counters, loading, error, refresh };
}

