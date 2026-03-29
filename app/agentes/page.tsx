"use client";

import { FormEvent, useEffect, useState } from "react";
import { FormField } from "@/components/forms";
import { Button, ConfirmationModal, DataTable, Input, PageHeader, StatusAlert } from "@/components/ui";
import { isValidEmail } from "@/lib/validators";
import { createAgente, deleteAgente, getAgentes, updateAgente } from "@/services";
import { Agente, CreateAgentePayload, UpdateAgentePayload } from "@/types";

type AgenteFormErrors = Partial<Record<"nome" | "matricula" | "telefone" | "email", string>>;

type AgenteFormState = {
  id?: string;
  nome: string;
  matricula: string;
  telefone: string;
  email: string;
};

const initialAgenteForm: AgenteFormState = {
  nome: "",
  matricula: "",
  telefone: "",
  email: ""
};

export default function ModuloAgentesPage() {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AgenteFormState>(initialAgenteForm);
  const [createErrors, setCreateErrors] = useState<AgenteFormErrors>({});
  const [isCreating, setIsCreating] = useState(false);

  const [editForm, setEditForm] = useState<AgenteFormState | null>(null);
  const [editErrors, setEditErrors] = useState<AgenteFormErrors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [agenteToDelete, setAgenteToDelete] = useState<Agente | null>(null);

  useEffect(() => {
    void loadAgentes();
  }, []);

  function clearFeedback() {
    setFeedbackError(null);
    setFeedbackSuccess(null);
  }

  async function loadAgentes() {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await getAgentes();
      setAgentes(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Nao foi possivel carregar os agentes.");
    } finally {
      setLoadingList(false);
    }
  }

  function normalizeOptionalValue(value: string): string | undefined {
    const normalized = value.trim();
    return normalized ? normalized : undefined;
  }

  function validateForm(formData: AgenteFormState): AgenteFormErrors {
    const nextErrors: AgenteFormErrors = {};

    if (!formData.nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!formData.matricula.trim()) nextErrors.matricula = "Informe a matricula.";

    const telefone = formData.telefone.trim();
    if (telefone && telefone.length < 8) {
      nextErrors.telefone = "Telefone deve ter ao menos 8 caracteres.";
    }

    const email = formData.email.trim();
    if (email && !isValidEmail(email)) {
      nextErrors.email = "E-mail invalido.";
    }

    return nextErrors;
  }

  function openCreateModal() {
    clearFeedback();
    setCreateErrors({});
    setCreateForm(initialAgenteForm);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateErrors({});
  }

  function openEditModal(agente: Agente) {
    clearFeedback();
    setEditErrors({});
    setEditForm({
      id: agente.id,
      nome: agente.nome,
      matricula: agente.matricula,
      telefone: agente.telefone ?? "",
      email: agente.email ?? ""
    });
  }

  function closeEditModal() {
    setEditForm(null);
    setEditErrors({});
  }

  function updateCreateField<K extends keyof AgenteFormState>(key: K, value: AgenteFormState[K]) {
    setCreateForm((current) => ({ ...current, [key]: value }));
    if (key !== "id") {
      setCreateErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  function updateEditField<K extends keyof AgenteFormState>(key: K, value: AgenteFormState[K]) {
    setEditForm((current) => (current ? { ...current, [key]: value } : current));
    if (key !== "id") {
      setEditErrors((current) => ({ ...current, [key]: undefined }));
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const validationErrors = validateForm(createForm);
    setCreateErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: CreateAgentePayload = {
      nome: createForm.nome.trim(),
      matricula: createForm.matricula.trim().toUpperCase(),
      telefone: normalizeOptionalValue(createForm.telefone),
      email: normalizeOptionalValue(createForm.email)
    };

    setIsCreating(true);
    try {
      await createAgente(payload);
      setFeedbackSuccess("Agente cadastrado com sucesso.");
      closeCreateModal();
      await loadAgentes();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel cadastrar agente.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    if (!editForm?.id) return;

    const validationErrors = validateForm(editForm);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: UpdateAgentePayload = {
      nome: editForm.nome.trim(),
      matricula: editForm.matricula.trim().toUpperCase(),
      telefone: normalizeOptionalValue(editForm.telefone),
      email: normalizeOptionalValue(editForm.email)
    };

    setIsEditing(true);
    try {
      await updateAgente(editForm.id, payload);
      setFeedbackSuccess("Agente atualizado com sucesso.");
      closeEditModal();
      await loadAgentes();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel atualizar agente.");
    } finally {
      setIsEditing(false);
    }
  }

  function openDeleteModal(agente: Agente) {
    clearFeedback();
    setAgenteToDelete(agente);
  }

  async function confirmDelete() {
    if (!agenteToDelete) return;

    setDeletingId(agenteToDelete.id);
    try {
      await deleteAgente(agenteToDelete.id);
      setFeedbackSuccess("Agente excluido com sucesso.");
      setAgenteToDelete(null);
      await loadAgentes();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel excluir agente.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Modulo de Agentes"
          description="Cadastre, liste, edite e exclua agentes responsaveis pelas ocorrencias."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openCreateModal}>
            Novo agente
          </Button>
          <Button variant="ghost" onClick={() => void loadAgentes()} isLoading={loadingList}>
            Atualizar
          </Button>
        </div>
      </div>

      {listError ? <StatusAlert type="error" message={listError} /> : null}
      {feedbackError ? <StatusAlert type="error" message={feedbackError} /> : null}
      {feedbackSuccess ? <StatusAlert type="success" message={feedbackSuccess} /> : null}

      <DataTable
        title="Agentes Cadastrados"
        data={agentes}
        loading={loadingList}
        emptyMessage="Nenhum agente cadastrado."
        columns={[
          { header: "Nome", render: (agente) => agente.nome },
          { header: "Matricula", render: (agente) => agente.matricula },
          { header: "Telefone", render: (agente) => agente.telefone ?? "-" },
          { header: "E-mail", render: (agente) => agente.email ?? "-" },
          { header: "Ocorrencias", render: (agente) => agente.ocorrencias?.length ?? 0 },
          {
            header: "Acoes",
            render: (agente) => (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => openEditModal(agente)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  isLoading={deletingId === agente.id}
                  onClick={() => openDeleteModal(agente)}
                >
                  Excluir
                </Button>
              </div>
            )
          }
        ]}
      />

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cadastrar agente"
            className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Novo agente
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Preencha os dados para cadastrar um novo agente responsavel.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
              <div className="md:col-span-2">
                <FormField label="Nome" error={createErrors.nome}>
                  <Input
                    value={createForm.nome}
                    onChange={(event) => updateCreateField("nome", event.target.value)}
                    error={createErrors.nome}
                  />
                </FormField>
              </div>

              <FormField label="Matricula" error={createErrors.matricula}>
                <Input
                  value={createForm.matricula}
                  onChange={(event) => updateCreateField("matricula", event.target.value)}
                  error={createErrors.matricula}
                />
              </FormField>

              <FormField label="Telefone" error={createErrors.telefone}>
                <Input
                  value={createForm.telefone}
                  onChange={(event) => updateCreateField("telefone", event.target.value)}
                  error={createErrors.telefone}
                />
              </FormField>

              <FormField label="E-mail" error={createErrors.email}>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => updateCreateField("email", event.target.value)}
                  error={createErrors.email}
                />
              </FormField>

              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeCreateModal} disabled={isCreating}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isCreating}>
                  Cadastrar agente
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Editar agente"
            className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Editar agente
              </h2>
              <p className="text-sm text-[var(--muted)]">Atualize os dados do agente selecionado.</p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEdit}>
              <div className="md:col-span-2">
                <FormField label="Nome" error={editErrors.nome}>
                  <Input
                    value={editForm.nome}
                    onChange={(event) => updateEditField("nome", event.target.value)}
                    error={editErrors.nome}
                  />
                </FormField>
              </div>

              <FormField label="Matricula" error={editErrors.matricula}>
                <Input
                  value={editForm.matricula}
                  onChange={(event) => updateEditField("matricula", event.target.value)}
                  error={editErrors.matricula}
                />
              </FormField>

              <FormField label="Telefone" error={editErrors.telefone}>
                <Input
                  value={editForm.telefone}
                  onChange={(event) => updateEditField("telefone", event.target.value)}
                  error={editErrors.telefone}
                />
              </FormField>

              <FormField label="E-mail" error={editErrors.email}>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => updateEditField("email", event.target.value)}
                  error={editErrors.email}
                />
              </FormField>

              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeEditModal} disabled={isEditing}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isEditing}>
                  Salvar alteracoes
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmationModal
        isOpen={Boolean(agenteToDelete)}
        title="Confirmar exclusao"
        message={
          agenteToDelete
            ? `Deseja excluir o agente ${agenteToDelete.nome}? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isLoading={Boolean(deletingId)}
        onCancel={() => {
          if (!deletingId) setAgenteToDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
