export interface Proprietario {
  id: string;
  nome: string;
  cpf: string;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  animais?: Array<{
    id: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProprietarioPayload {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
}

export interface UpdateProprietarioPayload {
  nome?: string;
  cpf?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
}
