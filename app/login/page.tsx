"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/forms";
import { Button, Card, Input, StatusAlert } from "@/components/ui";
import { useAuth } from "@/hooks";
import { formatCpf } from "@/lib/formatters";
import { isValidCpf, isValidEmail } from "@/lib/validators";
import { getDefaultRouteForRole } from "@/lib/access";

type AuthTab = "login" | "register";

type LoginFormState = {
  email: string;
  senha: string;
};

type RegisterFormState = {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  senha: string;
  confirmarSenha: string;
};

const initialLoginForm: LoginFormState = {
  email: "",
  senha: "",
};

const initialRegisterForm: RegisterFormState = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  endereco: "",
  senha: "",
  confirmarSenha: "",
};

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUpProprietario } = useAuth();

  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm);
  const [registerForm, setRegisterForm] = useState<RegisterFormState>(initialRegisterForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formattedCpf = useMemo(() => formatCpf(registerForm.cpf), [registerForm.cpf]);

  function clearFeedback() {
    setError(null);
    setSuccess(null);
  }

  function handleTabChange(tab: AuthTab) {
    setActiveTab(tab);
    clearFeedback();
  }

  function validateLoginForm() {
    if (!loginForm.email.trim() || !loginForm.senha.trim()) {
      throw new Error("Informe e-mail e senha para continuar.");
    }

    if (!isValidEmail(loginForm.email)) {
      throw new Error("E-mail invalido.");
    }
  }

  function validateRegisterForm() {
    if (!registerForm.nome.trim()) throw new Error("Informe o nome completo.");
    if (!registerForm.cpf.trim()) throw new Error("Informe o CPF.");
    if (!isValidCpf(registerForm.cpf)) throw new Error("CPF invalido.");
    if (!registerForm.telefone.trim()) throw new Error("Informe o telefone.");
    if (!registerForm.email.trim()) throw new Error("Informe o e-mail.");
    if (!isValidEmail(registerForm.email)) throw new Error("E-mail invalido.");
    if (!registerForm.endereco.trim()) throw new Error("Informe o endereco.");
    if (!registerForm.senha.trim() || registerForm.senha.length < 6) {
      throw new Error("A senha deve ter no minimo 6 caracteres.");
    }

    if (registerForm.senha !== registerForm.confirmarSenha) {
      throw new Error("A confirmacao da senha nao confere.");
    }
  }

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      validateLoginForm();

      const user = await signIn({
        email: loginForm.email.trim().toLowerCase(),
        senha: loginForm.senha,
      });

      router.replace(getDefaultRouteForRole(user.perfil));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel realizar login.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearFeedback();
    setLoading(true);

    try {
      validateRegisterForm();

      const user = await signUpProprietario({
        nome: registerForm.nome.trim(),
        cpf: registerForm.cpf.replace(/\D/g, ""),
        telefone: registerForm.telefone.trim(),
        email: registerForm.email.trim().toLowerCase(),
        endereco: registerForm.endereco.trim(),
        senha: registerForm.senha,
      });

      setSuccess("Conta criada com sucesso.");
      router.replace(getDefaultRouteForRole(user.perfil));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nao foi possivel criar a conta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-xl space-y-5">
        <div className="space-y-1">
          <h1 className="font-[var(--font-heading)] text-2xl font-semibold text-brand-900">
            Acesso ao Sistema
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Entre com seu e-mail e senha ou crie uma conta de proprietario.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-[var(--border)] bg-brand-50 p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === "login"
                ? "bg-white text-brand-900 shadow"
                : "text-brand-700 hover:bg-brand-100"
            }`}
            onClick={() => handleTabChange("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === "register"
                ? "bg-white text-brand-900 shadow"
                : "text-brand-700 hover:bg-brand-100"
            }`}
            onClick={() => handleTabChange("register")}
          >
            Criar conta
          </button>
        </div>

        {error ? <StatusAlert type="error" message={error} /> : null}
        {success ? <StatusAlert type="success" message={success} /> : null}

        {activeTab === "login" ? (
          <form className="space-y-4" onSubmit={handleLoginSubmit}>
            <FormField label="E-mail">
              <Input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, email: event.target.value }))
                }
                placeholder="usuario@prefeitura.gov.br"
              />
            </FormField>

            <FormField label="Senha">
              <Input
                type="password"
                value={loginForm.senha}
                onChange={(event) =>
                  setLoginForm((current) => ({ ...current, senha: event.target.value }))
                }
                placeholder="********"
              />
            </FormField>

            <Button type="submit" className="w-full" isLoading={loading}>
              Entrar
            </Button>
          </form>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleRegisterSubmit}>
            <div className="md:col-span-2">
              <FormField label="Nome completo">
                <Input
                  value={registerForm.nome}
                  onChange={(event) =>
                    setRegisterForm((current) => ({ ...current, nome: event.target.value }))
                  }
                />
              </FormField>
            </div>

            <FormField label="CPF">
              <Input
                value={formattedCpf}
                maxLength={14}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    cpf: event.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </FormField>

            <FormField label="Telefone">
              <Input
                value={registerForm.telefone}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, telefone: event.target.value }))
                }
              />
            </FormField>

            <FormField label="E-mail">
              <Input
                type="email"
                value={registerForm.email}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, email: event.target.value }))
                }
              />
            </FormField>

            <FormField label="Endereco">
              <Input
                value={registerForm.endereco}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, endereco: event.target.value }))
                }
              />
            </FormField>

            <FormField label="Senha">
              <Input
                type="password"
                value={registerForm.senha}
                onChange={(event) =>
                  setRegisterForm((current) => ({ ...current, senha: event.target.value }))
                }
              />
            </FormField>

            <FormField label="Confirmar senha">
              <Input
                type="password"
                value={registerForm.confirmarSenha}
                onChange={(event) =>
                  setRegisterForm((current) => ({
                    ...current,
                    confirmarSenha: event.target.value,
                  }))
                }
              />
            </FormField>

            <div className="md:col-span-2">
              <Button type="submit" className="w-full" isLoading={loading}>
                Criar conta
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
