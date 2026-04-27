"use client";

import { FormEvent, useMemo, useState } from "react";
import { FormField } from "@/components/forms";
import { Button, Card, Input, PageHeader, StatusAlert } from "@/components/ui";
import { useAsyncAction } from "@/hooks";
import { createProprietario, updateProprietario } from "@/services";
import { CreateProprietarioPayload } from "@/types";
import { formatCpf } from "@/lib/formatters";
import { isValidCpf, isValidEmail } from "@/lib/validators";

type FormErrors = Partial<Record<keyof CreateProprietarioPayload, string>>;

const initialForm: CreateProprietarioPayload = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: ""
};

export default function CadastroProprietarioPage() {
  const [form, setForm] = useState<CreateProprietarioPayload>(initialForm);
  const [foto, setFoto] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const { loading, error, success, run, clearMessages } = useAsyncAction();

  const formattedCpf = useMemo(() => formatCpf(form.cpf), [form.cpf]);

  function validate(): boolean {
    const nextErrors: FormErrors = {};

    if (!form.nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!form.cpf.trim()) nextErrors.cpf = "Informe o CPF.";
    if (form.cpf && !isValidCpf(form.cpf)) nextErrors.cpf = "CPF invalido.";
    if (!form.telefone.trim()) nextErrors.telefone = "Informe o telefone.";
    if (!form.email.trim()) nextErrors.email = "Informe o e-mail.";
    if (form.email && !isValidEmail(form.email)) nextErrors.email = "E-mail invalido.";
    if (!form.endereco.trim()) nextErrors.endereco = "Informe o endereco.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function updateField<K extends keyof CreateProprietarioPayload>(
    key: K,
    value: CreateProprietarioPayload[K]
  ) {
    clearMessages();
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;

    const payload: CreateProprietarioPayload = {
      ...form,
      cpf: form.cpf.replace(/\D/g, "")
    };

    const result = await run(async () => {
      const created = await createProprietario(payload);

      if (foto) {
        await updateProprietario(created.id, {}, foto);
      }

      return created;
    }, {
      successMessage: foto
        ? "Proprietario e foto de perfil cadastrados com sucesso."
        : "Proprietario cadastrado com sucesso."
    });

    if (result) {
      setForm(initialForm);
      setFoto(null);
      setErrors({});
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastro de Proprietario"
        description="Registre novos proprietarios para vincular animais e notificacoes."
      />

      <Card className="max-w-3xl">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="md:col-span-2">
            <FormField label="Nome completo" error={errors.nome}>
              <Input
                value={form.nome}
                onChange={(event) => updateField("nome", event.target.value)}
                placeholder="Maria Oliveira"
                error={errors.nome}
              />
            </FormField>
          </div>

          <FormField label="CPF" error={errors.cpf}>
            <Input
              value={formattedCpf}
              onChange={(event) => updateField("cpf", event.target.value.replace(/\D/g, ""))}
              placeholder="390.533.447-05"
              maxLength={14}
              error={errors.cpf}
            />
          </FormField>

          <FormField label="Telefone" error={errors.telefone}>
            <Input
              value={form.telefone}
              onChange={(event) => updateField("telefone", event.target.value)}
              placeholder="11999999999"
              error={errors.telefone}
            />
          </FormField>

          <FormField label="E-mail" error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="maria@prefeitura.gov.br"
              error={errors.email}
            />
          </FormField>

          <FormField label="Endereco" error={errors.endereco}>
            <Input
              value={form.endereco}
              onChange={(event) => updateField("endereco", event.target.value)}
              placeholder="Rua das Acacias, 123"
              error={errors.endereco}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField label="Foto de perfil (opcional)">
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setFoto(event.target.files?.[0] ?? null)}
              />
            </FormField>
          </div>

          <div className="md:col-span-2 space-y-3 pt-2">
            {error ? <StatusAlert type="error" message={error} /> : null}
            {success ? <StatusAlert type="success" message={success} /> : null}
            <Button type="submit" isLoading={loading}>
              Cadastrar proprietario
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
