import { Animal } from "./animal";
import { Agente } from "./agente";

export type StatusOcorrencia = "ABERTA" | "RESOLVIDA" | "CANCELADA";

export interface Ocorrencia {
  id: string;
  codigoIdentificacao: string;
  agenteId: string;
  local: string;
  descricao: string;
  status: StatusOcorrencia | string;
  animal?: Animal;
  agente?: Agente;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOcorrenciaPayload {
  codigoIdentificacao: string;
  agenteId?: string;
  local: string;
  descricao: string;
  status: StatusOcorrencia;
}

export interface UpdateOcorrenciaStatusPayload {
  status: StatusOcorrencia;
}
