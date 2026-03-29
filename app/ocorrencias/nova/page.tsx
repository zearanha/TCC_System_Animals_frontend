"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { FormField } from "@/components/forms";
import {
  Button,
  Card,
  ConfirmationModal,
  DataTable,
  Input,
  PageHeader,
  Select,
  StatusAlert,
  Textarea,
} from "@/components/ui";
import { useAsyncAction, useAuth } from "@/hooks";
import { createOcorrencia, deleteOcorrencia, getAgentes, getOcorrencias, updateOcorrenciaStatus } from "@/services";
import { Agente, CreateOcorrenciaPayload, Ocorrencia, StatusOcorrencia } from "@/types";
import { formatDate } from "@/lib/formatters";
import { isValidGbCode } from "@/lib/validators";

type FormErrors = Partial<Record<keyof CreateOcorrenciaPayload, string>>;

const initialForm: CreateOcorrenciaPayload = {
  codigoIdentificacao: "",
  agenteId: "",
  local: "",
  descricao: "",
  status: "ABERTA"
};

const statusOptions: StatusOcorrencia[] = ["ABERTA", "RESOLVIDA", "CANCELADA"];

export default function RegistroOcorrenciaPage() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";
  const isAgente = user?.perfil === "AGENTE";

  const [form, setForm] = useState<CreateOcorrenciaPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [ocorrenciaToDelete, setOcorrenciaToDelete] = useState<Ocorrencia | null>(null);
  const { loading, error, success, run, clearMessages } = useAsyncAction();

  const loadData = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      if (isAdmin) {
        const [agentesData, ocorrenciasData] = await Promise.all([getAgentes(), getOcorrencias()]);
        setAgentes(agentesData);
        setOcorrencias(ocorrenciasData);
        return;
      }

      const ocorrenciasData = await getOcorrencias();
      setOcorrencias(ocorrenciasData);
      setAgentes([]);

      if (isAgente && user?.agenteId) {
        setForm((current) => ({ ...current, agenteId: user.agenteId! }));
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Nao foi possivel carregar os dados.");
    } finally {
      setLoadingList(false);
    }
  }, [isAdmin, isAgente, user?.agenteId]);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user, loadData]);

  async function loadAgentesOnly() {
    if (!isAdmin) return;

    try {
      const data = await getAgentes();
      setAgentes(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Nao foi possivel atualizar agentes.");
    }
  }

  async function loadOcorrencias() {
    try {
      const data = await getOcorrencias();
      setOcorrencias(data);
    } catch {
      // Mantem o estado atual caso falhe uma atualizacao posterior.
    }
  }

  function clearActionFeedback() {
    setActionError(null);
    setActionSuccess(null);
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.codigoIdentificacao.trim()) {
      nextErrors.codigoIdentificacao = "Informe o codigo.";
    } else if (!isValidGbCode(form.codigoIdentificacao)) {
      nextErrors.codigoIdentificacao = "Use o formato LLNNNN (ex: MO3247).";
    }

    if (isAdmin && !(form.agenteId ?? "").trim()) nextErrors.agenteId = "Selecione um agente.";
    if (isAgente && !user?.agenteId) {
      nextErrors.agenteId = "Seu usuario nao possui agente vinculado.";
    }
    if (!form.local.trim()) nextErrors.local = "Informe o local.";
    if (!form.descricao.trim()) nextErrors.descricao = "Informe a descricao.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField<K extends keyof CreateOcorrenciaPayload>(
    key: K,
    value: CreateOcorrenciaPayload[K]
  ) {
    clearMessages();
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    clearActionFeedback();

    const payload: CreateOcorrenciaPayload = {
      ...form,
      ...(isAgente && user?.agenteId ? { agenteId: user.agenteId } : {}),
      codigoIdentificacao: form.codigoIdentificacao.trim().toUpperCase()
    };

    const result = await run(() => createOcorrencia(payload), {
      successMessage: "Ocorrencia registrada com sucesso."
    });

    if (result) {
      setForm(initialForm);
      setErrors({});
      await loadOcorrencias();
    }
  }

  async function concludeOcorrencia(ocorrenciaId: string) {
    clearActionFeedback();
    setStatusUpdatingId(ocorrenciaId);

    try {
      await updateOcorrenciaStatus(ocorrenciaId, "RESOLVIDA");
      setActionSuccess("Ocorrencia concluida com sucesso.");
      await loadOcorrencias();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Nao foi possivel concluir ocorrencia.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  function openDeleteModal(ocorrencia: Ocorrencia) {
    clearActionFeedback();
    setOcorrenciaToDelete(ocorrencia);
  }

  async function confirmDeleteOcorrencia() {
    if (!ocorrenciaToDelete) return;

    clearActionFeedback();
    setDeletingId(ocorrenciaToDelete.id);

    try {
      await deleteOcorrencia(ocorrenciaToDelete.id);
      setActionSuccess("Ocorrencia retirada com sucesso.");
      setOcorrenciaToDelete(null);
      await loadOcorrencias();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Nao foi possivel retirar ocorrencia.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registro de Ocorrencia"
        description="Registre ocorrencias vinculando o animal pelo codigo de identificacao."
      />

      <Card className="space-y-4">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormField label="Codigo de identificacao" error={errors.codigoIdentificacao}>
            <Input
              value={form.codigoIdentificacao}
              onChange={(event) => updateField("codigoIdentificacao", event.target.value)}
              placeholder="MO3247"
              maxLength={6}
              error={errors.codigoIdentificacao}
            />
          </FormField>

          <FormField label="Agente responsavel" error={errors.agenteId}>
            {isAdmin ? (
              <div className="space-y-2">
                <Select
                  value={form.agenteId}
                  onChange={(event) => updateField("agenteId", event.target.value)}
                  error={errors.agenteId}
                  disabled={loadingList}
                >
                  <option value="">
                    {loadingList
                      ? "Carregando agentes..."
                      : agentes.length > 0
                        ? "Selecione um agente"
                        : "Nenhum agente cadastrado"}
                  </option>
                  {agentes.map((agente) => (
                    <option key={agente.id} value={agente.id}>
                      {agente.nome} ({agente.matricula})
                    </option>
                  ))}
                </Select>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/agentes"
                    className="inline-flex items-center justify-center rounded-xl bg-accent-100 px-3 py-1.5 text-xs font-semibold text-accent-800 transition-colors hover:bg-accent-200"
                  >
                    Ir para modulo de agentes
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => void loadAgentesOnly()}
                  >
                    Atualizar agentes
                  </Button>
                </div>
              </div>
            ) : (
              <Input value={user?.nome ?? "-"} disabled />
            )}
          </FormField>

          <FormField label="Status" error={errors.status}>
            <Select
              value={form.status}
              onChange={(event) => updateField("status", event.target.value as StatusOcorrencia)}
              error={errors.status}
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Local" error={errors.local}>
            <Input
              value={form.local}
              onChange={(event) => updateField("local", event.target.value)}
              placeholder="Rodovia Municipal KM 12"
              error={errors.local}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Descricao da ocorrencia" error={errors.descricao}>
              <Textarea
                value={form.descricao}
                onChange={(event) => updateField("descricao", event.target.value)}
                placeholder="Animal solto proximo a curva de alto risco."
                error={errors.descricao}
              />
            </FormField>
          </div>

          <div className="md:col-span-2 space-y-3">
            {isAdmin && !loadingList && agentes.length === 0 ? (
              <StatusAlert
                type="info"
                message="Nenhum agente cadastrado. Cadastre no modulo de agentes antes de registrar ocorrencia."
              />
            ) : null}
            {listError ? <StatusAlert type="error" message={listError} /> : null}
            {error ? <StatusAlert type="error" message={error} /> : null}
            {success ? <StatusAlert type="success" message={success} /> : null}
            {actionError ? <StatusAlert type="error" message={actionError} /> : null}
            {actionSuccess ? <StatusAlert type="success" message={actionSuccess} /> : null}
            <Button type="submit" isLoading={loading}>
              Registrar ocorrencia
            </Button>
          </div>
        </form>
      </Card>

      <DataTable
        title="Ocorrencias Recentes"
        data={ocorrencias}
        loading={loadingList}
        emptyMessage="Nenhuma ocorrencia registrada."
        columns={[
          {
            header: "Codigo",
            render: (ocorrencia) => (
              <span className="rounded-lg bg-brand-50 px-2 py-1 font-semibold text-brand-800">
                {ocorrencia.codigoIdentificacao}
              </span>
            )
          },
          { header: "Local", render: (ocorrencia) => ocorrencia.local },
          { header: "Status", render: (ocorrencia) => ocorrencia.status },
          { header: "Agente", render: (ocorrencia) => ocorrencia.agente?.nome ?? ocorrencia.agenteId },
          { header: "Data", render: (ocorrencia) => formatDate(ocorrencia.createdAt) },
          {
            header: "Acoes",
            render: (ocorrencia) => {
              const canConclude = ocorrencia.status === "ABERTA";

              return (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-3 py-1.5 text-xs"
                    disabled={!canConclude}
                    isLoading={statusUpdatingId === ocorrencia.id}
                    onClick={() => void concludeOcorrencia(ocorrencia.id)}
                  >
                    Concluir
                  </Button>

                  {isAdmin ? (
                    <Button
                      type="button"
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      isLoading={deletingId === ocorrencia.id}
                      onClick={() => openDeleteModal(ocorrencia)}
                    >
                      Retirar
                    </Button>
                  ) : null}
                </div>
              );
            }
          }
        ]}
      />

      <ConfirmationModal
        isOpen={Boolean(ocorrenciaToDelete)}
        title="Confirmar retirada"
        message={
          ocorrenciaToDelete
            ? `Deseja retirar a ocorrencia ${ocorrenciaToDelete.codigoIdentificacao}? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmLabel="Retirar"
        isLoading={Boolean(deletingId)}
        onCancel={() => {
          if (!deletingId) setOcorrenciaToDelete(null);
        }}
        onConfirm={() => void confirmDeleteOcorrencia()}
      />
    </div>
  );
}
