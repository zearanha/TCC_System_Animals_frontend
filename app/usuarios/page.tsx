"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FormField } from "@/components/forms";
import { Button, ConfirmationModal, DataTable, Input, PageHeader, Select, StatusAlert } from "@/components/ui";
import { createUsuario, deleteUsuario, getAgentes, getProprietarios, getUsuarios, updateUsuario } from "@/services";
import { Agente, Proprietario, UpdateUsuarioPayload, UserRole, Usuario } from "@/types";
import { isValidEmail } from "@/lib/validators";

type FormErrors = Partial<
  Record<"nome" | "email" | "senha" | "perfil" | "agenteId" | "proprietarioId", string>
>;

type UsuarioFormState = {
  id?: string;
  nome: string;
  email: string;
  senha: string;
  perfil: UserRole;
  agenteId: string;
  proprietarioId: string;
  ativo: boolean;
};

const initialForm: UsuarioFormState = {
  nome: "",
  email: "",
  senha: "",
  perfil: "PROPRIETARIO",
  agenteId: "",
  proprietarioId: "",
  ativo: true,
};

const roleOptions: UserRole[] = ["ADMIN", "AGENTE", "PROPRIETARIO"];

export default function ModuloUsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<UsuarioFormState>(initialForm);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});
  const [isCreating, setIsCreating] = useState(false);

  const [editForm, setEditForm] = useState<UsuarioFormState | null>(null);
  const [editErrors, setEditErrors] = useState<FormErrors>({});
  const [isEditing, setIsEditing] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);

  const agentesById = useMemo(() => {
    const map = new Map<string, Agente>();
    agentes.forEach((agente) => map.set(agente.id, agente));
    return map;
  }, [agentes]);

  const proprietariosById = useMemo(() => {
    const map = new Map<string, Proprietario>();
    proprietarios.forEach((proprietario) => map.set(proprietario.id, proprietario));
    return map;
  }, [proprietarios]);

  useEffect(() => {
    void loadData();
  }, []);

  function clearFeedback() {
    setFeedbackError(null);
    setFeedbackSuccess(null);
  }

  async function loadData() {
    setLoadingList(true);
    setListError(null);

    try {
      const [usuariosData, agentesData, proprietariosData] = await Promise.all([
        getUsuarios(),
        getAgentes(),
        getProprietarios(),
      ]);

      setUsuarios(usuariosData);
      setAgentes(agentesData);
      setProprietarios(proprietariosData);
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Nao foi possivel carregar os usuarios.");
    } finally {
      setLoadingList(false);
    }
  }

  function validateForm(form: UsuarioFormState, mode: "create" | "edit"): FormErrors {
    const nextErrors: FormErrors = {};

    if (!form.nome.trim()) nextErrors.nome = "Informe o nome.";

    if (!form.email.trim()) {
      nextErrors.email = "Informe o e-mail.";
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = "E-mail invalido.";
    }

    if (mode === "create" && !form.senha.trim()) {
      nextErrors.senha = "Informe a senha.";
    }

    if (form.senha.trim() && form.senha.trim().length < 6) {
      nextErrors.senha = "Senha deve ter no minimo 6 caracteres.";
    }

    if (form.perfil === "AGENTE" && !form.agenteId) {
      nextErrors.agenteId = "Selecione um agente para vinculo.";
    }

    if (form.perfil === "PROPRIETARIO" && !form.proprietarioId) {
      nextErrors.proprietarioId = "Selecione um proprietario para vinculo.";
    }

    return nextErrors;
  }

  function normalizeRoleBindings(form: UsuarioFormState) {
    if (form.perfil === "ADMIN") {
      return { agenteId: null, proprietarioId: null };
    }

    if (form.perfil === "AGENTE") {
      return { agenteId: form.agenteId || null, proprietarioId: null };
    }

    return { agenteId: null, proprietarioId: form.proprietarioId || null };
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

  function openEditModal(usuario: Usuario) {
    clearFeedback();
    setEditErrors({});
    setEditForm({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      perfil: usuario.perfil,
      agenteId: usuario.agenteId ?? "",
      proprietarioId: usuario.proprietarioId ?? "",
      ativo: usuario.ativo,
    });
  }

  function closeEditModal() {
    setEditForm(null);
    setEditErrors({});
  }

  function updateCreateField<K extends keyof UsuarioFormState>(key: K, value: UsuarioFormState[K]) {
    setCreateForm((current) => {
      const next = { ...current, [key]: value };

      if (key === "perfil") {
        if (value === "ADMIN") {
          next.agenteId = "";
          next.proprietarioId = "";
        } else if (value === "AGENTE") {
          next.proprietarioId = "";
        } else if (value === "PROPRIETARIO") {
          next.agenteId = "";
        }
      }

      return next;
    });

    setCreateErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateEditField<K extends keyof UsuarioFormState>(key: K, value: UsuarioFormState[K]) {
    setEditForm((current) => {
      if (!current) return current;

      const next = { ...current, [key]: value };

      if (key === "perfil") {
        if (value === "ADMIN") {
          next.agenteId = "";
          next.proprietarioId = "";
        } else if (value === "AGENTE") {
          next.proprietarioId = "";
        } else if (value === "PROPRIETARIO") {
          next.agenteId = "";
        }
      }

      return next;
    });

    setEditErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const validationErrors = validateForm(createForm, "create");
    setCreateErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const links = normalizeRoleBindings(createForm);

    setIsCreating(true);
    try {
      await createUsuario({
        nome: createForm.nome.trim(),
        email: createForm.email.trim().toLowerCase(),
        senha: createForm.senha,
        perfil: createForm.perfil,
        ativo: createForm.ativo,
        agenteId: links.agenteId,
        proprietarioId: links.proprietarioId,
      });

      setFeedbackSuccess("Usuario cadastrado com sucesso.");
      closeCreateModal();
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel cadastrar usuario.");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    if (!editForm?.id) return;

    const validationErrors = validateForm(editForm, "edit");
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const links = normalizeRoleBindings(editForm);

    const payload: UpdateUsuarioPayload = {
      nome: editForm.nome.trim(),
      email: editForm.email.trim().toLowerCase(),
      perfil: editForm.perfil,
      ativo: editForm.ativo,
      agenteId: links.agenteId,
      proprietarioId: links.proprietarioId,
    };

    if (editForm.senha.trim()) {
      payload.senha = editForm.senha.trim();
    }

    setIsEditing(true);
    try {
      await updateUsuario(editForm.id, payload);
      setFeedbackSuccess("Usuario atualizado com sucesso.");
      closeEditModal();
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel atualizar usuario.");
    } finally {
      setIsEditing(false);
    }
  }

  function openDeleteModal(usuario: Usuario) {
    clearFeedback();
    setUsuarioToDelete(usuario);
  }

  async function confirmDelete() {
    if (!usuarioToDelete) return;

    setDeletingId(usuarioToDelete.id);
    try {
      await deleteUsuario(usuarioToDelete.id);
      setFeedbackSuccess("Usuario excluido com sucesso.");
      setUsuarioToDelete(null);
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel excluir usuario.");
    } finally {
      setDeletingId(null);
    }
  }

  function renderVinculo(usuario: Usuario): string {
    if (usuario.perfil === "AGENTE") {
      if (!usuario.agenteId) return "-";
      const agente = agentesById.get(usuario.agenteId);
      return agente ? `${agente.nome} (${agente.matricula})` : usuario.agenteId;
    }

    if (usuario.perfil === "PROPRIETARIO") {
      if (!usuario.proprietarioId) return "-";
      const proprietario = proprietariosById.get(usuario.proprietarioId);
      return proprietario ? proprietario.nome : usuario.proprietarioId;
    }

    return "-";
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Modulo de Usuarios"
          description="Area administrativa para criar, listar, editar e excluir usuarios de acesso."
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={openCreateModal}>
            Novo usuario
          </Button>
          <Button variant="ghost" onClick={() => void loadData()} isLoading={loadingList}>
            Atualizar
          </Button>
        </div>
      </div>

      {listError ? <StatusAlert type="error" message={listError} /> : null}
      {feedbackError ? <StatusAlert type="error" message={feedbackError} /> : null}
      {feedbackSuccess ? <StatusAlert type="success" message={feedbackSuccess} /> : null}

      <DataTable
        title="Usuarios Cadastrados"
        data={usuarios}
        loading={loadingList}
        emptyMessage="Nenhum usuario cadastrado."
        columns={[
          { header: "Nome", render: (usuario) => usuario.nome },
          { header: "E-mail", render: (usuario) => usuario.email },
          { header: "Perfil", render: (usuario) => usuario.perfil },
          { header: "Vinculo", render: (usuario) => renderVinculo(usuario) },
          {
            header: "Status",
            render: (usuario) => (usuario.ativo ? "ATIVO" : "INATIVO"),
          },
          {
            header: "Acoes",
            render: (usuario) => (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => openEditModal(usuario)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  className="px-3 py-1.5 text-xs"
                  isLoading={deletingId === usuario.id}
                  onClick={() => openDeleteModal(usuario)}
                >
                  Excluir
                </Button>
              </div>
            ),
          },
        ]}
      />

      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cadastrar usuario"
            className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card max-h-[90vh] overflow-y-auto"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Novo usuario
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Defina os dados de acesso e perfil do usuario.
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

              <FormField label="E-mail" error={createErrors.email}>
                <Input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => updateCreateField("email", event.target.value)}
                  error={createErrors.email}
                />
              </FormField>

              <FormField label="Senha" error={createErrors.senha}>
                <Input
                  type="password"
                  value={createForm.senha}
                  onChange={(event) => updateCreateField("senha", event.target.value)}
                  error={createErrors.senha}
                />
              </FormField>

              <FormField label="Perfil" error={createErrors.perfil}>
                <Select
                  value={createForm.perfil}
                  onChange={(event) => updateCreateField("perfil", event.target.value as UserRole)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Status">
                <Select
                  value={createForm.ativo ? "ATIVO" : "INATIVO"}
                  onChange={(event) => updateCreateField("ativo", event.target.value === "ATIVO")}
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </Select>
              </FormField>

              {createForm.perfil === "AGENTE" ? (
                <div className="md:col-span-2">
                  <FormField label="Vincular agente" error={createErrors.agenteId}>
                    <Select
                      value={createForm.agenteId}
                      onChange={(event) => updateCreateField("agenteId", event.target.value)}
                    >
                      <option value="">Selecione um agente</option>
                      {agentes.map((agente) => (
                        <option key={agente.id} value={agente.id}>
                          {agente.nome} ({agente.matricula})
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              ) : null}

              {createForm.perfil === "PROPRIETARIO" ? (
                <div className="md:col-span-2">
                  <FormField label="Vincular proprietario" error={createErrors.proprietarioId}>
                    <Select
                      value={createForm.proprietarioId}
                      onChange={(event) => updateCreateField("proprietarioId", event.target.value)}
                    >
                      <option value="">Selecione um proprietario</option>
                      {proprietarios.map((proprietario) => (
                        <option key={proprietario.id} value={proprietario.id}>
                          {proprietario.nome}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              ) : null}

              <div className="md:col-span-2 mt-2 flex flex-wrap justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeCreateModal} disabled={isCreating}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isCreating}>
                  Cadastrar usuario
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Editar usuario"
            className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card max-h-[90vh] overflow-y-auto"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Editar usuario
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Atualize os dados de acesso e vinculo do usuario.
              </p>
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

              <FormField label="E-mail" error={editErrors.email}>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => updateEditField("email", event.target.value)}
                  error={editErrors.email}
                />
              </FormField>

              <FormField label="Nova senha (opcional)" error={editErrors.senha}>
                <Input
                  type="password"
                  value={editForm.senha}
                  onChange={(event) => updateEditField("senha", event.target.value)}
                  error={editErrors.senha}
                />
              </FormField>

              <FormField label="Perfil" error={editErrors.perfil}>
                <Select
                  value={editForm.perfil}
                  onChange={(event) => updateEditField("perfil", event.target.value as UserRole)}
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Status">
                <Select
                  value={editForm.ativo ? "ATIVO" : "INATIVO"}
                  onChange={(event) => updateEditField("ativo", event.target.value === "ATIVO")}
                >
                  <option value="ATIVO">ATIVO</option>
                  <option value="INATIVO">INATIVO</option>
                </Select>
              </FormField>

              {editForm.perfil === "AGENTE" ? (
                <div className="md:col-span-2">
                  <FormField label="Vincular agente" error={editErrors.agenteId}>
                    <Select
                      value={editForm.agenteId}
                      onChange={(event) => updateEditField("agenteId", event.target.value)}
                    >
                      <option value="">Selecione um agente</option>
                      {agentes.map((agente) => (
                        <option key={agente.id} value={agente.id}>
                          {agente.nome} ({agente.matricula})
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              ) : null}

              {editForm.perfil === "PROPRIETARIO" ? (
                <div className="md:col-span-2">
                  <FormField label="Vincular proprietario" error={editErrors.proprietarioId}>
                    <Select
                      value={editForm.proprietarioId}
                      onChange={(event) => updateEditField("proprietarioId", event.target.value)}
                    >
                      <option value="">Selecione um proprietario</option>
                      {proprietarios.map((proprietario) => (
                        <option key={proprietario.id} value={proprietario.id}>
                          {proprietario.nome}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>
              ) : null}

              <div className="md:col-span-2 mt-2 flex flex-wrap justify-end gap-2">
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
        isOpen={Boolean(usuarioToDelete)}
        title="Confirmar exclusao"
        message={
          usuarioToDelete
            ? `Deseja excluir o usuario ${usuarioToDelete.nome}? Esta acao nao pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isLoading={Boolean(deletingId)}
        onCancel={() => {
          if (!deletingId) setUsuarioToDelete(null);
        }}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
