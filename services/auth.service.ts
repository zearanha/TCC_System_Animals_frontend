import { api } from "./api";
import {
  AuthSessionResponse,
  AuthUser,
  LoginPayload,
  RegisterProprietarioPayload,
} from "@/types";

export async function login(payload: LoginPayload): Promise<AuthSessionResponse> {
  return api.post<AuthSessionResponse>("/auth/login", payload);
}

export async function registerProprietario(
  payload: RegisterProprietarioPayload
): Promise<AuthSessionResponse> {
  return api.post<AuthSessionResponse>("/auth/registrar-proprietario", payload);
}

export async function getCurrentUser(): Promise<AuthUser> {
  return api.get<AuthUser>("/auth/me");
}

export async function logout(): Promise<void> {
  await api.post<void>("/auth/logout", {});
}
