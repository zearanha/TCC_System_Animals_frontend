import { api } from "./api";
import { Agente, CreateAgentePayload, UpdateAgentePayload } from "@/types";

export async function getAgentes(): Promise<Agente[]> {
  return api.get<Agente[]>("/agentes");
}

export async function createAgente(payload: CreateAgentePayload): Promise<Agente> {
  return api.post<Agente>("/agentes", payload);
}

export async function updateAgente(id: string, payload: UpdateAgentePayload): Promise<Agente> {
  return api.put<Agente>(`/agentes/${id}`, payload);
}

export async function deleteAgente(id: string): Promise<void> {
  await api.delete<void>(`/agentes/${id}`);
}
