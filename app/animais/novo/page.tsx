"use client";

import { FormEvent, useEffect, useState } from "react";
import { FormField } from "@/components/forms";
import { Button, Card, Input, PageHeader, Select, StatusAlert } from "@/components/ui";
import { useAsyncAction } from "@/hooks";
import { createAnimal, getProprietarios } from "@/services";
import { CreateAnimalPayload, PorteAnimal, Proprietario, SexoAnimal } from "@/types";

type FormErrors = Partial<Record<keyof CreateAnimalPayload, string>>;

const initialForm: CreateAnimalPayload = {
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

export default function CadastroAnimalPage() {
  const [form, setForm] = useState<CreateAnimalPayload>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [loadingProprietarios, setLoadingProprietarios] = useState(true);
  const [proprietariosError, setProprietariosError] = useState<string | null>(null);
  const { loading, error, success, run, clearMessages } = useAsyncAction();

  useEffect(() => {
    async function loadProprietarios() {
      try {
        const data = await getProprietarios();
        setProprietarios(data);
      } catch (err) {
        setProprietariosError(
          err instanceof Error ? err.message : "Nao foi possivel carregar proprietarios."
        );
      } finally {
        setLoadingProprietarios(false);
      }
    }

    void loadProprietarios();
  }, []);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!form.especie.trim()) nextErrors.especie = "Informe a especie.";
    if (!form.raca.trim()) nextErrors.raca = "Informe a raca.";
    if (!form.cor.trim()) nextErrors.cor = "Informe a cor.";
    if (!form.dataNascimento) nextErrors.dataNascimento = "Informe a data de nascimento.";
    if (!form.proprietarioId) nextErrors.proprietarioId = "Selecione um proprietario.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField<K extends keyof CreateAnimalPayload>(key: K, value: CreateAnimalPayload[K]) {
    clearMessages();
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const payload: CreateAnimalPayload = {
      ...form,
      dataNascimento: `${form.dataNascimento}T00:00:00.000Z`
    };

    const result = await run(() => createAnimal(payload), {
      successMessage: "Animal cadastrado com sucesso. O codigo de identificacao foi gerado automaticamente."
    });

    if (result) {
      setForm(initialForm);
      setErrors({});
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastro de Animal"
        description="Cadastre animais vinculando ao proprietario ja registrado."
      />

      <Card className="max-w-4xl">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormField label="Nome do animal" error={errors.nome}>
            <Input
              value={form.nome}
              onChange={(event) => updateField("nome", event.target.value)}
              placeholder="Trovao"
              error={errors.nome}
            />
          </FormField>

          <FormField label="Especie" error={errors.especie}>
            <Input
              value={form.especie}
              onChange={(event) => updateField("especie", event.target.value)}
              placeholder="Cavalo"
              error={errors.especie}
            />
          </FormField>

          <FormField label="Raca" error={errors.raca}>
            <Input
              value={form.raca}
              onChange={(event) => updateField("raca", event.target.value)}
              placeholder="Mangalarga"
              error={errors.raca}
            />
          </FormField>

          <FormField label="Cor" error={errors.cor}>
            <Input
              value={form.cor}
              onChange={(event) => updateField("cor", event.target.value)}
              placeholder="Castanho"
              error={errors.cor}
            />
          </FormField>

          <FormField label="Porte" error={errors.porte}>
            <Select
              value={form.porte}
              onChange={(event) => updateField("porte", event.target.value as PorteAnimal)}
              error={errors.porte}
            >
              {porteOptions.map((porte) => (
                <option key={porte} value={porte}>
                  {porte}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Sexo" error={errors.sexo}>
            <Select
              value={form.sexo}
              onChange={(event) => updateField("sexo", event.target.value as SexoAnimal)}
              error={errors.sexo}
            >
              {sexoOptions.map((sexo) => (
                <option key={sexo} value={sexo}>
                  {sexo}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Data de nascimento" error={errors.dataNascimento}>
            <Input
              type="date"
              value={form.dataNascimento}
              onChange={(event) => updateField("dataNascimento", event.target.value)}
              error={errors.dataNascimento}
            />
          </FormField>

          <FormField label="Proprietario" error={errors.proprietarioId}>
            <Select
              value={form.proprietarioId}
              onChange={(event) => updateField("proprietarioId", event.target.value)}
              error={errors.proprietarioId}
              disabled={loadingProprietarios}
            >
              <option value="">
                {loadingProprietarios ? "Carregando proprietarios..." : "Selecione um proprietario"}
              </option>
              {proprietarios.map((proprietario) => (
                <option key={proprietario.id} value={proprietario.id}>
                  {proprietario.nome}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="md:col-span-2 space-y-3 pt-2">
            {proprietariosError ? <StatusAlert type="error" message={proprietariosError} /> : null}
            {error ? <StatusAlert type="error" message={error} /> : null}
            {success ? <StatusAlert type="success" message={success} /> : null}
            <Button type="submit" isLoading={loading} disabled={loadingProprietarios}>
              Cadastrar animal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
