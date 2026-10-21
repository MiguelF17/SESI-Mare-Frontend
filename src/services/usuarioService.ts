import { apiRequest } from "../api";

export interface MeuPerfil {
  id: number;
  nome: string;
  username: string;
  email: string;
  foto: string | null;
  capa?: string | null;
  bio?: string | null;
  preferenciasConcluidas?: boolean;
}

export async function buscarMeuPerfil(): Promise<MeuPerfil> {
  return apiRequest<MeuPerfil>("/usuarios/me");
}

export async function buscarGenerosFavoritos(): Promise<string[]> {
  const dados = await apiRequest<unknown>("/usuarios/me/generos");

  if (!Array.isArray(dados)) {
    throw new Error("A API retornou uma lista de gêneros inválida.");
  }

  return dados as string[];
}
