import { api } from "./api";
import { Notificacao } from "@/types";

export async function getNotificacoes(): Promise<Notificacao[]> {
  return api.get<Notificacao[]>("/notificacoes");
}

