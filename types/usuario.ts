import { AuthUser, UserRole } from "./auth";

export interface Usuario extends AuthUser {}

export interface CreateUsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  perfil: UserRole;
  ativo?: boolean;
  agenteId?: string | null;
  proprietarioId?: string | null;
}

export interface UpdateUsuarioPayload {
  nome?: string;
  email?: string;
  senha?: string;
  perfil?: UserRole;
  ativo?: boolean;
  agenteId?: string | null;
  proprietarioId?: string | null;
}
