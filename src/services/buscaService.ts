
import { apiRequest } from "../api";
import type { Musica } from "./musicaService";
import type { Post } from "./postService";

export interface Artista {
  id: number;
  nome: string;
  fotoURL?: string | null;
}

export interface UsuarioBusca {
  id: number;
  nome: string;
  username: string;
  foto?: string | null;
}

export interface DadosBusca {
  musicas: Musica[];
  artistas: Artista[];
  posts: Post[];
  usuarios: UsuarioBusca[];
}

export async function buscarDadosBusca(): Promise<DadosBusca> {
  const [musicas, artistas, posts, usuarios] = await Promise.all([
    apiRequest<Musica[]>("/musicas"),
    apiRequest<Artista[]>("/artistas"),
    apiRequest<Post[]>("/posts"),
    apiRequest<UsuarioBusca[]>("/usuarios").catch(() => []),
  ]);

  return { musicas, artistas, posts, usuarios };
}
