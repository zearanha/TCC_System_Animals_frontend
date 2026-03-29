import { api } from "./api";
import { CreateProprietarioPayload, Proprietario, UpdateProprietarioPayload } from "@/types";

export async function getProprietarios(): Promise<Proprietario[]> {
  return api.get<Proprietario[]>("/proprietarios");
}

export async function createProprietario(payload: CreateProprietarioPayload): Promise<Proprietario> {
  return api.post<Proprietario>("/proprietarios", payload);
}

export async function updateProprietario(
  id: string,
  payload: UpdateProprietarioPayload
): Promise<Proprietario> {
  return api.put<Proprietario>(`/proprietarios/${id}`, payload);
}

export async function deleteProprietario(id: string): Promise<void> {
  await api.delete<void>(`/proprietarios/${id}`);
}
