
import { apiRequest } from "../api";
import type { Musica } from "./musicaService";
import type { Post } from "./postService";

export interface Artista {
  id: number;
  nome: string;
  fotoURL?: string | null;
}

export interface DadosBusca {
  musicas: Musica[];
  artistas: Artista[];
  posts: Post[];
}

export async function buscarDadosBusca(): Promise<DadosBusca> {
  const [musicas, artistas, posts] = await Promise.all([
    apiRequest<Musica[]>("/musicas"),
    apiRequest<Artista[]>("/artistas"),
    apiRequest<Post[]>("/posts"),
  ]);

  return { musicas, artistas, posts };
}
