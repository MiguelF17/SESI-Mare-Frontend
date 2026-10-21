
import { apiRequest } from "../api";

export interface Artista {
  id: number;
  nome: string;
  fotoURL?: string | null;
}

export async function buscarArtistas(): Promise<Artista[]> {
  const dados = await apiRequest<unknown>("/artistas");

  if (!Array.isArray(dados)) {
    throw new Error("A API retornou uma lista de artistas inválida.");
  }

  return dados as Artista[];
}

export async function buscarArtistaPorId(id: number): Promise<Artista> {
  return apiRequest<Artista>(`/artistas/${id}`);
}
