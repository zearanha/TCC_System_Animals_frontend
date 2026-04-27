"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { FormField } from "@/components/forms";
import { Button, ConfirmationModal, DataTable, Input, PageHeader, Select, StatusAlert } from "@/components/ui";
import { useAuth } from "@/hooks";
import { formatDate } from "@/lib/formatters";
import { resolveApiAssetUrl } from "@/lib/media";
import {
  createAnimal,
  deleteAnimal,
  deleteImagemIdentificacaoAnimal,
  getAnimais,
  getProprietarios,
  updateAnimal,
  uploadImagensIdentificacaoAnimal
} from "@/services";
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
  const [animalDetails, setAnimalDetails] = useState<Animal | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<AnimalFormState>(initialForm);
  const [createImages, setCreateImages] = useState<File[]>([]);
  const [createErrors, setCreateErrors] = useState<AnimalFormErrors>({});
  const [savingCreate, setSavingCreate] = useState(false);

  const [editForm, setEditForm] = useState<EditAnimalFormState | null>(null);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [editErrors, setEditErrors] = useState<AnimalFormErrors>({});
  const [savingEdit, setSavingEdit] = useState(false);
  const [removingImageId, setRemovingImageId] = useState<string | null>(null);

  const detailImageUrls = useMemo(() => {
    if (!animalDetails) return [];

    return (animalDetails.identificacao?.imagens ?? [])
      .map((imagem) => resolveApiAssetUrl(imagem.imagemUrl))
      .filter((url): url is string => Boolean(url));
  }, [animalDetails]);

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
    setCreateImages([]);
    setIsCreateModalOpen(true);
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false);
    setCreateErrors({});
    setCreateImages([]);
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
    setEditImages([]);
  }

  function closeEditModal() {
    setEditForm(null);
    setEditErrors({});
    setEditImages([]);
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
      const createdAnimal = await createAnimal(payload);

      if (createImages.length > 0) {
        await uploadImagensIdentificacaoAnimal(createdAnimal.id, createImages);
      }

      setFeedbackSuccess(
        createImages.length > 0
          ? "Animal e imagens de identificacao cadastrados com sucesso."
          : "Animal cadastrado com sucesso."
      );
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

      if (editImages.length > 0) {
        await uploadImagensIdentificacaoAnimal(editForm.id, editImages);
      }

      setFeedbackSuccess(
        editImages.length > 0
          ? "Animal e imagens de identificacao atualizados com sucesso."
          : "Animal atualizado com sucesso."
      );
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

  function openAnimalDetailsModal(animal: Animal) {
    setAnimalDetails(animal);
    setCarouselIndex(0);
  }

  function closeAnimalDetailsModal() {
    setAnimalDetails(null);
    setCarouselIndex(0);
  }

  function goToPreviousImage() {
    setCarouselIndex((current) => {
      if (detailImageUrls.length === 0) return 0;
      return (current - 1 + detailImageUrls.length) % detailImageUrls.length;
    });
  }

  function goToNextImage() {
    setCarouselIndex((current) => {
      if (detailImageUrls.length === 0) return 0;
      return (current + 1) % detailImageUrls.length;
    });
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

  async function handleRemoveIdentificacaoImagem(animalId: string, imagemId: string) {
    setRemovingImageId(imagemId);
    clearFeedback();

    try {
      await deleteImagemIdentificacaoAnimal(animalId, imagemId);
      setFeedbackSuccess("Imagem de identificacao removida com sucesso.");
      await loadData();
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : "Nao foi possivel remover a imagem.");
    } finally {
      setRemovingImageId(null);
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
          {
            header: "Imagens",
            render: (animal) => {
              const primeiraImagem = animal.identificacao?.imagens?.[0]?.imagemUrl;
              const total = animal.identificacao?.imagens?.length ?? 0;
              const url = resolveApiAssetUrl(primeiraImagem);

              if (!url) return "-";

              return (
                <button
                  type="button"
                  onClick={() => openAnimalDetailsModal(animal)}
                  className="flex items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-brand-50/40"
                >
                  <img
                    src={url}
                    alt={`Identificacao de ${animal.nome}`}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "8px",
                      objectFit: "cover"
                    }}
                    loading="lazy"
                  />
                  <span>{total} img.</span>
                </button>
              );
            }
          },
          {
            header: "Nome",
            render: (animal) => (
              <button
                type="button"
                onClick={() => openAnimalDetailsModal(animal)}
                className="text-left font-semibold text-brand-800 underline decoration-brand-300 underline-offset-4"
              >
                {animal.nome}
              </button>
            )
          },
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

      {animalDetails ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes do animal ${animalDetails.nome}`}
            className="w-full max-w-4xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card max-h-[92vh] overflow-y-auto"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-[var(--font-heading)] text-xl font-semibold text-brand-900">
                  {animalDetails.nome}
                </h2>
                <p className="text-sm text-[var(--muted)]">
                  Codigo: {animalDetails.identificacao?.codigo ?? animalDetails.codigoIdentificacao ?? "-"}
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={closeAnimalDetailsModal}>
                <CloseIcon fontSize="small" />
                Fechar
              </Button>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-3">
                {detailImageUrls.length > 0 ? (
                  <>
                    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
                      <img
                        src={detailImageUrls[carouselIndex]}
                        alt={`Imagem ${carouselIndex + 1} de ${animalDetails.nome}`}
                        style={{
                          width: "100%",
                          height: "320px",
                          objectFit: "cover",
                          display: "block"
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Button type="button" variant="secondary" onClick={goToPreviousImage}>
                        <ChevronLeftIcon fontSize="small" />
                        Anterior
                      </Button>
                      <span className="text-sm text-[var(--muted)]">
                        {carouselIndex + 1} de {detailImageUrls.length}
                      </span>
                      <Button type="button" variant="secondary" onClick={goToNextImage}>
                        Proxima
                        <ChevronRightIcon fontSize="small" />
                      </Button>
                    </div>

                    {detailImageUrls.length > 1 ? (
                      <div className="flex flex-wrap gap-2">
                        {detailImageUrls.map((url, index) => (
                          <button
                            key={url}
                            type="button"
                            onClick={() => setCarouselIndex(index)}
                            style={{
                              border: index === carouselIndex ? "2px solid #3f6b48" : "1px solid #d5e1d8",
                              borderRadius: "8px",
                              padding: 0,
                              overflow: "hidden",
                              cursor: "pointer"
                            }}
                          >
                            <img
                              src={url}
                              alt={`Miniatura ${index + 1}`}
                              style={{
                                width: "68px",
                                height: "68px",
                                objectFit: "cover",
                                display: "block"
                              }}
                              loading="lazy"
                            />
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="rounded-xl border border-[var(--border)] bg-brand-50 p-4 text-sm text-[var(--muted)]">
                    Este animal ainda nao possui imagens de identificacao.
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Especie</p>
                  <p className="text-base font-semibold text-brand-900">{animalDetails.especie || "-"}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Raca</p>
                  <p className="text-base font-semibold text-brand-900">{animalDetails.raca || "-"}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Porte e sexo</p>
                  <p className="text-base font-semibold text-brand-900">
                    {animalDetails.porte || "-"} | {animalDetails.sexo || "-"}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Cor</p>
                  <p className="text-base font-semibold text-brand-900">{animalDetails.cor || "-"}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Nascimento</p>
                  <p className="text-base font-semibold text-brand-900">{formatDate(animalDetails.dataNascimento)}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Proprietario</p>
                  <p className="text-base font-semibold text-brand-900">
                    {animalDetails.proprietario?.nome || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isAdmin && isCreateModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Cadastrar animal"
            className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card max-h-[90vh] overflow-y-auto"
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

              <div className="md:col-span-2">
                <FormField label="Imagens de identificacao (opcional)">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(event) => setCreateImages(Array.from(event.target.files ?? []))}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2 mt-2 flex flex-wrap justify-end gap-2">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Editar animal"
            className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-white p-5 shadow-card max-h-[90vh] overflow-y-auto"
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

              <div className="md:col-span-2">
                <FormField label="Imagens atuais de identificacao">
                  {animais
                    .find((item) => item.id === editForm.id)
                    ?.identificacao?.imagens?.map((imagem) => {
                      const imageUrl = resolveApiAssetUrl(imagem.imagemUrl);
                      if (!imageUrl) return null;

                      return (
                        <div
                          key={imagem.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            marginBottom: "8px"
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt="Imagem de identificacao"
                            style={{
                              width: "64px",
                              height: "64px",
                              borderRadius: "8px",
                              objectFit: "cover"
                            }}
                            loading="lazy"
                          />
                          <Button
                            type="button"
                            variant="danger"
                            isLoading={removingImageId === imagem.id}
                            onClick={() => void handleRemoveIdentificacaoImagem(editForm.id, imagem.id)}
                          >
                            Remover imagem
                          </Button>
                        </div>
                      );
                    })}
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Adicionar novas imagens (opcional)">
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(event) => setEditImages(Array.from(event.target.files ?? []))}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2 mt-2 flex flex-wrap justify-end gap-2">
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
