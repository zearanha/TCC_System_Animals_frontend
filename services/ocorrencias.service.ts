import { api } from "./api";
import { CreateOcorrenciaPayload, Ocorrencia, StatusOcorrencia } from "@/types";

export async function getOcorrencias(): Promise<Ocorrencia[]> {
  return api.get<Ocorrencia[]>("/ocorrencias");
}

export async function createOcorrencia(payload: CreateOcorrenciaPayload): Promise<Ocorrencia> {
  return api.post<Ocorrencia>("/ocorrencias", payload);
}

export async function updateOcorrenciaStatus(
  id: string,
  status: StatusOcorrencia
): Promise<Ocorrencia> {
  return api.put<Ocorrencia>(`/ocorrencias/${id}/status`, { status });
}

export async function deleteOcorrencia(id: string): Promise<void> {
  await api.delete<void>(`/ocorrencias/${id}`);
}
