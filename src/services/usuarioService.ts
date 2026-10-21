import { apiRequest } from "../api";
import type { Post } from "./postService";

export interface MeuPerfil {
  id: number;
  nome: string;
  username: string;
  email: string;
  foto: string | null;
  capa?: string | null;
  bio?: string | null;
  preferenciasConcluidas?: boolean;

  _count: {
    seguidores: number;
    seguindo: number;
    posts: number;
    comentarios: number;
    salvamentos: number;
  };
}

export interface PerfilPublico {
  id: number;
  nome: string;
  username: string;
  foto: string | null;
  capa: string | null;
  bio: string | null;
  seguindoPorMim: boolean;
  _count: {
    seguidores: number;
    seguindo: number;
    posts: number;
  };
  posts: Post[];
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

export async function buscarPerfilPublico(
  username: string,
): Promise<PerfilPublico> {
  return apiRequest<PerfilPublico>(
    `/usuarios/publico/${encodeURIComponent(username)}`,
  );
}

export async function seguirUsuario(id: number) {
  return apiRequest(`/usuarios/${id}/seguir`, {
    method: "POST",
  });
}

export async function deixarDeSeguirUsuario(id: number) {
  return apiRequest(`/usuarios/${id}/seguir`, {
    method: "DELETE",
  });
}