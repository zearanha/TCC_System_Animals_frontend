import { api } from "./api";
import { Animal, CreateAnimalPayload, UpdateAnimalPayload } from "@/types";

export async function getAnimais(): Promise<Animal[]> {
  return api.get<Animal[]>("/animais");
}

export async function createAnimal(payload: CreateAnimalPayload): Promise<Animal> {
  return api.post<Animal>("/animais", payload);
}

export async function updateAnimal(id: string, payload: UpdateAnimalPayload): Promise<Animal> {
  return api.put<Animal>(`/animais/${id}`, payload);
}

export async function deleteAnimal(id: string): Promise<void> {
  await api.delete<void>(`/animais/${id}`);
}

export async function findAnimalByCodigo(codigo: string): Promise<Animal | null> {
  const normalized = codigo.trim().toUpperCase();

  try {
    return await api.get<Animal>(`/animais/codigo/${normalized}`);
  } catch (err) {
    if (err instanceof Error && err.message.toLowerCase().includes("nao encontrado")) {
      return null;
    }

    throw err;
  }
}

export async function uploadImagensIdentificacaoAnimal(
  id: string,
  imagens: File[]
): Promise<Animal> {
  const formData = new FormData();
  imagens.forEach((imagem) => formData.append("imagens", imagem));

  return api.post<Animal>(`/animais/${id}/imagens-identificacao`, formData);
}

export async function deleteImagemIdentificacaoAnimal(
  id: string,
  imagemId: string
): Promise<Animal> {
  return api.delete<Animal>(`/animais/${id}/imagens-identificacao/${imagemId}`);
}
