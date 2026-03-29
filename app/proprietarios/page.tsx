"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FormField } from "@/components/forms";
import { Button, ConfirmationModal, DataTable, Input, PageHeader, StatusAlert } from "@/components/ui";
import { formatCpf } from "@/lib/formatters";
import { isValidCpf, isValidEmail } from "@/lib/validators";
import {
  createProprietario,
  deleteProprietario,
  getProprietarios,
  updateProprietario
} from "@/services";
import { CreateProprietarioPayload, Proprietario, UpdateProprietarioPayload } from "@/types";

type OwnerFormState = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
};

type EditFormState = OwnerFormState & {
  id: string;
};

type OwnerFormErrors = Partial<Record<keyof OwnerFormState, string>>;

const initialForm: OwnerFormState = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: ""
};

export default function ListaProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [proprietarioToDelete, setProprietarioToDelete] = useState<Proprietario | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<OwnerFormState>(initialForm);
  const [createErrors, setCreateErrors] = useState<OwnerFormErrors>({});
  const [savingCreate, setSavingCreate] = useState(false);

  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [editErrors, setEditErrors] = useState<OwnerFormErrors>({});

  const formattedCreateCpf = useMemo(() => formatCpf(createForm.cpf), [createForm.cpf]);
  const formattedEditCpf = useMemo(() => {
    if (!editForm) return "";
    return formatCpf(editForm.cpf);
  }, [editForm]);

  useEffect(() => {
    void loadProprietarios();
  }, []);

  async function loadProprietarios() {
    setLoadingList(true);
    setListError(null);
    try {
      const data = await getProprietarios();
      setProprietarios(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Nao foi possivel carregar proprietarios.");
    } finally {
      setLoadingList(false);
    }
  }

  function clearFeedback() {
    setFeedbackError(null);
    setFeedbackSuccess(null);
  }

  function validateOwnerForm(form: OwnerFormState): OwnerFormErrors {
    const nextErrors: OwnerFormErrors = {};

    if (!form.nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!form.cpf.trim()) nextErrors.cpf = "Informe o CPF.";
    if (form.cpf && !isValidCpf(form.cpf)) nextErrors.cpf = "CPF invalido.";
    if (!form.telefone.trim()) nextErrors.telefone = "Informe o telefone.";
    if (!form.email.trim()) nextErrors.email = "Informe o e-mail.";
    if (form.email && !isValidEmail(form.email)) nextErrors.email = "E-mail invalido.";
    if (!form.endereco.trim()) nextErrors.endereco = "Informe o endereco.";

    return nextErrors;
  }

  function openCreateModal() {
    clearFeedback();
    setCreateErrors({});
    setCreateForm(initialForm);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateErrors({});
  }

  function openEditModal(proprietario: Proprietario) {
    clearFeedback();
    setEditErrors({});
    setEditForm({
      id: proprietario.id,
      nome: proprietario.nome,
      cpf: proprietario.cpf,
      telefone: proprietario.telefone ?? "",
      email: proprietario.email ?? "",
      endereco: proprietario.endereco ?? ""
    });
  }

  function closeEditModal() {
    setEditForm(null);
    setEditErrors({});
  }

  function updateCreateField<K extends keyof OwnerFormState>(key: K, value: OwnerFormState[K]) {
    setCreateForm((current) => ({ ...current, [key]: value }));
    setCreateErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateEditField<K extends keyof OwnerFormState>(key: K, value: OwnerFormState[K]) {
    setEditForm((current) => (current ? { ...current, [key]: value } : current));
    setEditErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const validationErrors = validateOwnerForm(createForm);
    setCreateErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: CreateProprietarioPayload = {
      nome: createForm.nome.trim(),
      cpf: createForm.cpf.replace(/\D/g, ""),
      telefone: createForm.telefone.trim(),
      email: createForm.email.trim(),
      endereco: createForm.endereco.trim()
    };

    setSavingCreate(true);
    try {
      await createProprietario(payload);
      setFeedbackSuccess("Proprietario cadastrado com sucesso.");
      closeCreateModal();
      await loadProprietarios();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel cadastrar proprietario.");
    } finally {
      setSavingCreate(false);
    }
  }

  function openDeleteModal(proprietario: Proprietario) {
    clearFeedback();
    setProprietarioToDelete(proprietario);
  }

  async function confirmDelete() {
    if (!proprietarioToDelete) return;

    setDeletingId(proprietarioToDelete.id);
    try {
      await deleteProprietario(proprietarioToDelete.id);
      setFeedbackSuccess("Proprietario excluido com sucesso.");
      setProprietarioToDelete(null);
      await loadProprietarios();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel excluir proprietario.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    if (!editForm) return;

    const validationErrors = validateOwnerForm(editForm);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: UpdateProprietarioPayload = {
      nome: editForm.nome.trim(),
      cpf: editForm.cpf.replace(/\D/g, ""),
      telefone: editForm.telefone.trim(),
      email: editForm.email.trim(),
      endereco: editForm.endereco.trim()
    };

    setSavingEdit(true);
    try {
      await updateProprietario(editForm.id, payload);
      setFeedbackSuccess("Proprietario atualizado com sucesso.");
      closeEditModal();
      await loadProprietarios();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel atualizar proprietario.");
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Modulo de Proprietarios"
          description="Cadastre, liste, edite e exclua proprietarios."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openCreateModal}>
            Novo proprietario
          </Button>
          <Button variant="ghost" onClick={() => void loadProprietarios()} isLoading={loadingList}>
            Atualizar
          </Button>
        </div>
      </div>

      {listError ? <StatusAlert type="error" message={listError} /> : null}
      {feedbackError ? <StatusAlert type="error" message={feedbackError} /> : null}
      {feedbackSuccess ? <StatusAlert type="success" message={feedbackSuccess} /> : null}

      <DataTable
        title="Lista de Proprietarios"
        data={proprietarios}
        loading={loadingList}
        emptyMessage="Nenhum proprietario cadastrado."
        columns={[
          { header: "Nome", render: (proprietario) => proprietario.nome },
          { header: "CPF", render: (proprietario) => formatCpf(proprietario.cpf) },
          { header: "Telefone", render: (proprietario) => proprietario.telefone ?? "-" },
          { header: "E-mail", render: (proprietario) => proprietario.email ?? "-" },
          { header: "Endereco", render: (proprietario) => proprietario.endereco ?? "-" },
          { header: "Animais", render: (proprietario) => proprietario.animais?.length ?? 0 },
          {
            header: "Acoes",
            render: (proprietario) => (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => openEditModal(proprietario)}
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  isLoading={deletingId === proprietario.id}
                  onClick={() => openDeleteModal(proprietario)}
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
            aria-label="Cadastrar proprietario"
            className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Novo proprietario
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Preencha os dados para cadastrar um novo proprietario.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubmit}>
              <div className="md:col-span-2">
                <FormField label="Nome completo" error={createErrors.nome}>
                  <Input
                    value={createForm.nome}
                    onChange={(event) => updateCreateField("nome", event.target.value)}
                    error={createErrors.nome}
                  />
                </FormField>
              </div>

              <FormField label="CPF" error={createErrors.cpf}>
                <Input
                  value={formattedCreateCpf}
                  onChange={(event) => updateCreateField("cpf", event.target.value.replace(/\D/g, ""))}
                  maxLength={14}
                  error={createErrors.cpf}
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

              <FormField label="Endereco" error={createErrors.endereco}>
                <Input
                  value={createForm.endereco}
                  onChange={(event) => updateCreateField("endereco", event.target.value)}
                  error={createErrors.endereco}
                />
              </FormField>

              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeCreateModal} disabled={savingCreate}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={savingCreate}>
                  Cadastrar proprietario
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
            aria-label="Editar proprietario"
            className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Editar proprietario
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Atualize os dados do proprietario selecionado.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              <div className="md:col-span-2">
                <FormField label="Nome completo" error={editErrors.nome}>
                  <Input
                    value={editForm.nome}
                    onChange={(event) => updateEditField("nome", event.target.value)}
                    error={editErrors.nome}
                  />
                </FormField>
              </div>

              <FormField label="CPF" error={editErrors.cpf}>
                <Input
                  value={formattedEditCpf}
                  onChange={(event) => updateEditField("cpf", event.target.value.replace(/\D/g, ""))}
                  maxLength={14}
                  error={editErrors.cpf}
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

              <FormField label="Endereco" error={editErrors.endereco}>
                <Input
                  value={editForm.endereco}
                  onChange={(event) => updateEditField("endereco", event.target.value)}
                  error={editErrors.endereco}
                />
              </FormField>

              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeEditModal} disabled={savingEdit}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={savingEdit}>
                  Salvar alteracoes
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <ConfirmationModal
        isOpen={Boolean(proprietarioToDelete)}
        title="Confirmar exclusao"
        message={
          proprietarioToDelete
            ? `Deseja excluir o proprietario ${proprietarioToDelete.nome}? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isLoading={Boolean(deletingId)}
        onCancel={() => {
          if (!deletingId) setProprietarioToDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
