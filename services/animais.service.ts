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
