"use client";

import { useState } from "react";

export function useAsyncAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function run<T>(
    promiseFactory: () => Promise<T>,
    options?: { successMessage?: string }
  ): Promise<T | null> {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await promiseFactory();
      if (options?.successMessage) {
        setSuccess(options.successMessage);
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Nao foi possivel concluir a operacao.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }

  function clearMessages() {
    setError(null);
    setSuccess(null);
  }

  return {
    loading,
    error,
    success,
    run,
    clearMessages
  };
}

