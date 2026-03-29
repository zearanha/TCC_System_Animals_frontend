import { Ocorrencia } from "./ocorrencia";
import { Proprietario } from "./proprietario";

export type CanalNotificacao = "WHATSAPP" | "SMS" | "EMAIL";
export type StatusNotificacao = "PENDENTE" | "ENVIADA" | "LIDA" | "FALHA";

export interface Notificacao {
  id: string;
  ocorrenciaId: string;
  mensagem: string;
  canal: CanalNotificacao | string;
  status: StatusNotificacao | string;
  ocorrencia?: Ocorrencia;
  proprietario?: Proprietario;
  createdAt?: string;
  updatedAt?: string;
}

