"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FormField } from "@/components/forms";
import { Button, ConfirmationModal, DataTable, Input, PageHeader, Select, StatusAlert } from "@/components/ui";
import { useAuth } from "@/hooks";
import { formatDate } from "@/lib/formatters";
import { createAnimal, deleteAnimal, getAnimais, getProprietarios, updateAnimal } from "@/services";
import { Animal, CreateAnimalPayload, PorteAnimal, Proprietario, SexoAnimal, UpdateAnimalPayload } from "@/types";

type AnimalFormState = {
  nome: string;
  especie: string;
  raca: string;
  porte: PorteAnimal;
  sexo: SexoAnimal;
  cor: string;
  dataNascimento: string;
  proprietarioId: string;
};

type EditAnimalFormState = AnimalFormState & {
  id: string;
};

type AnimalFormErrors = Partial<Record<keyof AnimalFormState, string>>;

const initialForm: AnimalFormState = {
  nome: "",
  especie: "",
  raca: "",
  porte: "MEDIO",
  sexo: "MACHO",
  cor: "",
  dataNascimento: "",
  proprietarioId: ""
};

const porteOptions: PorteAnimal[] = ["PEQUENO", "MEDIO", "GRANDE"];
const sexoOptions: SexoAnimal[] = ["MACHO", "FEMEA"];

export default function ModuloAnimaisPage() {
  const { user } = useAuth();
  const isAdmin = user?.perfil === "ADMIN";

  const [animais, setAnimais] = useState<Animal[]>([]);
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AnimalFormState>(initialForm);
  const [createErrors, setCreateErrors] = useState<AnimalFormErrors>({});
  const [savingCreate, setSavingCreate] = useState(false);

  const [editForm, setEditForm] = useState<EditAnimalFormState | null>(null);
  const [editErrors, setEditErrors] = useState<AnimalFormErrors>({});
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      if (isAdmin) {
        const [animaisData, proprietariosData] = await Promise.all([getAnimais(), getProprietarios()]);
        setAnimais(animaisData);
        setProprietarios(proprietariosData);
      } else {
        const animaisData = await getAnimais();
        setAnimais(animaisData);
        setProprietarios([]);
      }
    } catch (err) {
      setListError(err instanceof Error ? err.message : "Nao foi possivel carregar os dados.");
    } finally {
      setLoadingList(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!user) return;
    void loadData();
  }, [user, loadData]);

  function clearFeedback() {
    setFeedbackError(null);
    setFeedbackSuccess(null);
  }

  function toDateInputValue(value?: string | null): string {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toISOString().slice(0, 10);
  }

  function validateAnimalForm(form: AnimalFormState): AnimalFormErrors {
    const nextErrors: AnimalFormErrors = {};

    if (!form.nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!form.especie.trim()) nextErrors.especie = "Informe a especie.";
    if (!form.raca.trim()) nextErrors.raca = "Informe a raca.";
    if (!form.cor.trim()) nextErrors.cor = "Informe a cor.";
    if (!form.dataNascimento) nextErrors.dataNascimento = "Informe a data de nascimento.";
    if (!form.proprietarioId) nextErrors.proprietarioId = "Selecione um proprietario.";

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

  function openEditModal(animal: Animal) {
    clearFeedback();
    setEditErrors({});
    setEditForm({
      id: animal.id,
      nome: animal.nome ?? "",
      especie: animal.especie ?? "",
      raca: animal.raca ?? "",
      porte: (animal.porte as PorteAnimal) ?? "MEDIO",
      sexo: (animal.sexo as SexoAnimal) ?? "MACHO",
      cor: animal.cor ?? "",
      dataNascimento: toDateInputValue(animal.dataNascimento),
      proprietarioId: animal.proprietarioId ?? ""
    });
  }

  function closeEditModal() {
    setEditForm(null);
    setEditErrors({});
  }

  function updateCreateField<K extends keyof AnimalFormState>(key: K, value: AnimalFormState[K]) {
    setCreateForm((current) => ({ ...current, [key]: value }));
    setCreateErrors((current) => ({ ...current, [key]: undefined }));
  }

  function updateEditField<K extends keyof AnimalFormState>(key: K, value: AnimalFormState[K]) {
    setEditForm((current) => (current ? { ...current, [key]: value } : current));
    setEditErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    const validationErrors = validateAnimalForm(createForm);
    setCreateErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: CreateAnimalPayload = {
      ...createForm,
      dataNascimento: `${createForm.dataNascimento}T00:00:00.000Z`
    };

    setSavingCreate(true);
    try {
      await createAnimal(payload);
      setFeedbackSuccess("Animal cadastrado com sucesso.");
      closeCreateModal();
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel cadastrar animal.");
    } finally {
      setSavingCreate(false);
    }
  }

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();

    if (!editForm) return;

    const validationErrors = validateAnimalForm(editForm);
    setEditErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    const payload: UpdateAnimalPayload = {
      nome: editForm.nome.trim(),
      especie: editForm.especie.trim(),
      raca: editForm.raca.trim(),
      porte: editForm.porte,
      sexo: editForm.sexo,
      cor: editForm.cor.trim(),
      dataNascimento: `${editForm.dataNascimento}T00:00:00.000Z`,
      proprietarioId: editForm.proprietarioId
    };

    setSavingEdit(true);
    try {
      await updateAnimal(editForm.id, payload);
      setFeedbackSuccess("Animal atualizado com sucesso.");
      closeEditModal();
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel atualizar animal.");
    } finally {
      setSavingEdit(false);
    }
  }

  function openDeleteModal(animal: Animal) {
    clearFeedback();
    setAnimalToDelete(animal);
  }

  async function confirmDelete() {
    if (!animalToDelete) return;

    setDeletingId(animalToDelete.id);
    try {
      await deleteAnimal(animalToDelete.id);
      setFeedbackSuccess("Animal excluido com sucesso.");
      setAnimalToDelete(null);
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel excluir animal.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Modulo de Animais"
          description={
            isAdmin
              ? "Cadastre, liste, edite e exclua animais."
              : "Consulte os animais vinculados ao seu cadastro."
          }
        />
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Button variant="secondary" onClick={openCreateModal}>
              Novo animal
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => void loadData()} isLoading={loadingList}>
            Atualizar
          </Button>
        </div>
      </div>

      {listError ? <StatusAlert type="error" message={listError} /> : null}
      {feedbackError ? <StatusAlert type="error" message={feedbackError} /> : null}
      {feedbackSuccess ? <StatusAlert type="success" message={feedbackSuccess} /> : null}

      <DataTable
        title="Animais Cadastrados"
        data={animais}
        loading={loadingList}
        emptyMessage="Nenhum animal cadastrado."
        columns={[
          {
            header: "Codigo",
            render: (animal) => (
              <span className="rounded-lg bg-brand-50 px-2 py-1 font-semibold text-brand-800">
                {animal.identificacao?.codigo ?? animal.codigoIdentificacao ?? "-"}
              </span>
            )
          },
          { header: "Nome", render: (animal) => animal.nome },
          { header: "Especie", render: (animal) => animal.especie },
          { header: "Raca", render: (animal) => animal.raca },
          { header: "Proprietario", render: (animal) => animal.proprietario?.nome ?? "-" },
          { header: "Nascimento", render: (animal) => formatDate(animal.dataNascimento) },
          ...(isAdmin
            ? [
                {
                  header: "Acoes",
                  render: (animal: Animal) => (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => openEditModal(animal)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-1.5 text-xs"
                        isLoading={deletingId === animal.id}
                        onClick={() => openDeleteModal(animal)}
                      >
                        Excluir
                      </Button>
                    </div>
                  )
                }
              ]
            : [])
        ]}
      />

      {isAdmin && isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cadastrar animal"
            className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Novo animal
              </h2>
              <p className="text-sm text-[var(--muted)]">
                Preencha os dados para cadastrar um novo animal.
              </p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateSubmit}>
              <FormField label="Nome do animal" error={createErrors.nome}>
                <Input
                  value={createForm.nome}
                  onChange={(event) => updateCreateField("nome", event.target.value)}
                  error={createErrors.nome}
                />
              </FormField>

              <FormField label="Especie" error={createErrors.especie}>
                <Input
                  value={createForm.especie}
                  onChange={(event) => updateCreateField("especie", event.target.value)}
                  error={createErrors.especie}
                />
              </FormField>

              <FormField label="Raca" error={createErrors.raca}>
                <Input
                  value={createForm.raca}
                  onChange={(event) => updateCreateField("raca", event.target.value)}
                  error={createErrors.raca}
                />
              </FormField>

              <FormField label="Cor" error={createErrors.cor}>
                <Input
                  value={createForm.cor}
                  onChange={(event) => updateCreateField("cor", event.target.value)}
                  error={createErrors.cor}
                />
              </FormField>

              <FormField label="Porte" error={createErrors.porte}>
                <Select
                  value={createForm.porte}
                  onChange={(event) => updateCreateField("porte", event.target.value as PorteAnimal)}
                  error={createErrors.porte}
                >
                  {porteOptions.map((porte) => (
                    <option key={porte} value={porte}>
                      {porte}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Sexo" error={createErrors.sexo}>
                <Select
                  value={createForm.sexo}
                  onChange={(event) => updateCreateField("sexo", event.target.value as SexoAnimal)}
                  error={createErrors.sexo}
                >
                  {sexoOptions.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Data de nascimento" error={createErrors.dataNascimento}>
                <Input
                  type="date"
                  value={createForm.dataNascimento}
                  onChange={(event) => updateCreateField("dataNascimento", event.target.value)}
                  error={createErrors.dataNascimento}
                />
              </FormField>

              <FormField label="Proprietario" error={createErrors.proprietarioId}>
                <Select
                  value={createForm.proprietarioId}
                  onChange={(event) => updateCreateField("proprietarioId", event.target.value)}
                  error={createErrors.proprietarioId}
                >
                  <option value="">Selecione um proprietario</option>
                  {proprietarios.map((proprietario) => (
                    <option key={proprietario.id} value={proprietario.id}>
                      {proprietario.nome}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="md:col-span-2 mt-2 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeCreateModal} disabled={savingCreate}>
                  Cancelar
                </Button>
                <Button type="submit" isLoading={savingCreate}>
                  Cadastrar animal
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {isAdmin && editForm ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Editar animal"
            className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card"
          >
            <div className="mb-4">
              <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                Editar animal
              </h2>
              <p className="text-sm text-[var(--muted)]">Atualize os dados do animal selecionado.</p>
            </div>

            <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEditSubmit}>
              <FormField label="Nome do animal" error={editErrors.nome}>
                <Input
                  value={editForm.nome}
                  onChange={(event) => updateEditField("nome", event.target.value)}
                  error={editErrors.nome}
                />
              </FormField>

              <FormField label="Especie" error={editErrors.especie}>
                <Input
                  value={editForm.especie}
                  onChange={(event) => updateEditField("especie", event.target.value)}
                  error={editErrors.especie}
                />
              </FormField>

              <FormField label="Raca" error={editErrors.raca}>
                <Input
                  value={editForm.raca}
                  onChange={(event) => updateEditField("raca", event.target.value)}
                  error={editErrors.raca}
                />
              </FormField>

              <FormField label="Cor" error={editErrors.cor}>
                <Input
                  value={editForm.cor}
                  onChange={(event) => updateEditField("cor", event.target.value)}
                  error={editErrors.cor}
                />
              </FormField>

              <FormField label="Porte" error={editErrors.porte}>
                <Select
                  value={editForm.porte}
                  onChange={(event) => updateEditField("porte", event.target.value as PorteAnimal)}
                  error={editErrors.porte}
                >
                  {porteOptions.map((porte) => (
                    <option key={porte} value={porte}>
                      {porte}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Sexo" error={editErrors.sexo}>
                <Select
                  value={editForm.sexo}
                  onChange={(event) => updateEditField("sexo", event.target.value as SexoAnimal)}
                  error={editErrors.sexo}
                >
                  {sexoOptions.map((sexo) => (
                    <option key={sexo} value={sexo}>
                      {sexo}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Data de nascimento" error={editErrors.dataNascimento}>
                <Input
                  type="date"
                  value={editForm.dataNascimento}
                  onChange={(event) => updateEditField("dataNascimento", event.target.value)}
                  error={editErrors.dataNascimento}
                />
              </FormField>

              <FormField label="Proprietario" error={editErrors.proprietarioId}>
                <Select
                  value={editForm.proprietarioId}
                  onChange={(event) => updateEditField("proprietarioId", event.target.value)}
                  error={editErrors.proprietarioId}
                >
                  <option value="">Selecione um proprietario</option>
                  {proprietarios.map((proprietario) => (
                    <option key={proprietario.id} value={proprietario.id}>
                      {proprietario.nome}
                    </option>
                  ))}
                </Select>
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

      {isAdmin ? (
        <ConfirmationModal
          isOpen={Boolean(animalToDelete)}
          title="Confirmar exclusao"
          message={
            animalToDelete
              ? `Deseja excluir o animal ${animalToDelete.nome}? Esta acao nao pode ser desfeita.`
              : ""
          }
          confirmLabel="Excluir"
          isLoading={Boolean(deletingId)}
          onCancel={() => {
            if (!deletingId) setAnimalToDelete(null);
          }}
          onConfirm={() => void confirmDelete()}
        />
      ) : null}
    </div>
  );
}
