import { api } from "./api";
import { CreateUsuarioPayload, UpdateUsuarioPayload, Usuario } from "@/types";

export async function getUsuarios(): Promise<Usuario[]> {
  return api.get<Usuario[]>("/usuarios");
}

export async function createUsuario(payload: CreateUsuarioPayload): Promise<Usuario> {
  return api.post<Usuario>("/usuarios", payload);
}

export async function updateUsuario(id: string, payload: UpdateUsuarioPayload): Promise<Usuario> {
  return api.put<Usuario>(`/usuarios/${id}`, payload);
}

export async function deleteUsuario(id: string): Promise<void> {
  await api.delete<void>(`/usuarios/${id}`);
}
