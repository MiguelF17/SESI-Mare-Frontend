
import { apiRequest } from "../api";

export interface Comentario {
  id: number;
  texto: string;
  dataCriacao: string;
  usuario: {
    id: number;
    nome: string;
    username?: string;
    foto?: string | null;
  };
  editado?: boolean;
}

export async function buscarComentarios(
  postId: number
): Promise<Comentario[]> {
  const dados = await apiRequest<unknown>(
    `/posts/${postId}/comentarios`
  );

  if (!Array.isArray(dados)) {
    throw new Error("A API retornou uma lista de comentários inválida.");
  }

  return dados as Comentario[];
}

export interface CriarComentarioDados {
  texto: string;
}

export async function criarComentario(
  postId: number,
  dados: CriarComentarioDados
): Promise<Comentario> {
  return apiRequest<Comentario>(`/posts/${postId}/comentarios`, {
    method: "POST",
    body: JSON.stringify(dados),
  });
}

export async function excluirComentario(
  comentarioId: number
): Promise<void> {
  await apiRequest<void>(`/comentarios/${comentarioId}`, {
    method: "DELETE",
  });
}
