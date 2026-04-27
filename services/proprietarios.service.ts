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
  payload: UpdateProprietarioPayload,
  foto?: File
): Promise<Proprietario> {
  if (foto) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    formData.append("foto", foto);
    return api.put<Proprietario>(`/proprietarios/${id}`, formData);
  }

  return api.put<Proprietario>(`/proprietarios/${id}`, payload);
}

export async function deleteProprietario(id: string): Promise<void> {
  await api.delete<void>(`/proprietarios/${id}`);
}

export async function uploadFotoPerfilProprietario(
  id: string,
  foto: File
): Promise<Proprietario> {
  const formData = new FormData();
  formData.append("foto", foto);

  try {
    return await api.post<Proprietario>(`/proprietarios/${id}/foto`, formData);
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes("rota nao encontrada")) {
      return api.put<Proprietario>(`/proprietarios/${id}`, formData);
    }

    throw error;
  }
}
