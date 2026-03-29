import { Proprietario } from "./proprietario";

export type PorteAnimal = "PEQUENO" | "MEDIO" | "GRANDE";
export type SexoAnimal = "MACHO" | "FEMEA";

export interface Identificacao {
  id: string;
  codigo: string;
  animalId: string;
  createdAt?: string;
}

export interface Animal {
  id: string;
  nome: string;
  especie: string;
  raca: string;
  porte: PorteAnimal | string;
  sexo: SexoAnimal | string;
  cor: string;
  dataNascimento: string;
  proprietarioId: string;
  proprietario?: Proprietario;
  identificacao?: Identificacao;
  codigoIdentificacao?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAnimalPayload {
  nome: string;
  especie: string;
  raca: string;
  porte: PorteAnimal;
  sexo: SexoAnimal;
  cor: string;
  dataNascimento: string;
  proprietarioId: string;
}

export interface UpdateAnimalPayload {
  nome?: string;
  especie?: string;
  raca?: string;
  porte?: PorteAnimal;
  sexo?: SexoAnimal;
  cor?: string;
  dataNascimento?: string;
  proprietarioId?: string;
}
