export type UserRole = "ADMIN" | "AGENTE" | "PROPRIETARIO";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  perfil: UserRole;
  ativo: boolean;
  proprietarioId: string | null;
  agenteId: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AuthSessionResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  senha: string;
}

export interface RegisterProprietarioPayload {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  senha: string;
}
