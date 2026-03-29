export interface Agente {
  id: string;
  nome: string;
  matricula: string;
  telefone?: string | null;
  email?: string | null;
  ocorrencias?: Array<{
    id: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAgentePayload {
  nome: string;
  matricula: string;
  telefone?: string;
  email?: string;
}

export interface UpdateAgentePayload {
  nome?: string;
  matricula?: string;
  telefone?: string;
  email?: string;
}
