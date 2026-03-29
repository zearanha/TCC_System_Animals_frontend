"use client";

import { useEffect, useState } from "react";
import { Card, Input, PageHeader, StatusAlert } from "@/components/ui";
import { useDebounce } from "@/hooks";
import { findAnimalByCodigo } from "@/services";
import { Animal } from "@/types";
import { formatDate } from "@/lib/formatters";
import { isValidGbCode } from "@/lib/validators";

export default function BuscaCodigoPage() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const debouncedCodigo = useDebounce(codigo, 500);

  useEffect(() => {
    async function search() {
      const normalized = debouncedCodigo.trim().toUpperCase();
      if (!normalized) {
        setResultado(null);
        setError(null);
        setSearchPerformed(false);
        return;
      }

      if (!isValidGbCode(normalized)) {
        setResultado(null);
        setSearchPerformed(false);
        setError("Codigo invalido. Use o formato LLNNNN (ex: MO3247).");
        return;
      }

      setLoading(true);
      setError(null);
      setSearchPerformed(true);
      try {
        const animal = await findAnimalByCodigo(normalized);
        setResultado(animal);
      } catch (err) {
        setResultado(null);
        setError(err instanceof Error ? err.message : "Nao foi possivel buscar o animal.");
      } finally {
        setLoading(false);
      }
    }

    void search();
  }, [debouncedCodigo]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Busca por Codigo"
        description="Digite o codigo de identificacao (ex: MO3247) para localizar animal e proprietario."
      />

      <Card className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-brand-900">Codigo de identificacao</span>
          <Input
            value={codigo}
            onChange={(event) => setCodigo(event.target.value.toUpperCase())}
            placeholder="MO3247"
            maxLength={6}
          />
        </label>
        <p className="text-xs text-[var(--muted)]">
          A busca e automatica enquanto voce digita (com pequeno atraso para evitar chamadas em excesso).
        </p>
      </Card>

      {loading ? <StatusAlert type="info" message="Buscando animal..." /> : null}
      {error ? <StatusAlert type="error" message={error} /> : null}

      {searchPerformed && !loading && !error && !resultado ? (
        <StatusAlert type="info" message="Nenhum animal encontrado para o codigo informado." />
      ) : null}

      {resultado ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="font-[var(--font-heading)] text-lg font-semibold text-brand-900">Animal</h2>
            <p>
              <strong>Codigo:</strong>{" "}
              {resultado.identificacao?.codigo ?? resultado.codigoIdentificacao ?? "-"}
            </p>
            <p>
              <strong>Nome:</strong> {resultado.nome}
            </p>
            <p>
              <strong>Especie:</strong> {resultado.especie}
            </p>
            <p>
              <strong>Raca:</strong> {resultado.raca}
            </p>
            <p>
              <strong>Nascimento:</strong> {formatDate(resultado.dataNascimento)}
            </p>
          </Card>

          <Card className="space-y-3">
            <h2 className="font-[var(--font-heading)] text-lg font-semibold text-brand-900">
              Proprietario
            </h2>
            <p>
              <strong>Nome:</strong> {resultado.proprietario?.nome ?? "-"}
            </p>
            <p>
              <strong>CPF:</strong> {resultado.proprietario?.cpf ?? "-"}
            </p>
            <p>
              <strong>Telefone:</strong> {resultado.proprietario?.telefone ?? "-"}
            </p>
            <p>
              <strong>Email:</strong> {resultado.proprietario?.email ?? "-"}
            </p>
            <p>
              <strong>Endereco:</strong> {resultado.proprietario?.endereco ?? "-"}
            </p>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
