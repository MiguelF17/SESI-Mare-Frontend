
import { apiRequest } from "../api";

export interface Post {
    id: number;
    texto: string | null;
    nota: number;
    dataCriacao: string;
    editado?: boolean;

    usuario?: {
        id: number;
        nome: string;
        username: string;
        foto: string | null;
    };

    musica?: {
        id: number;
        titulo: string;
        capa: string | null;
        duracaoSegundos: number;
        nota?: number;
        avaliacoes?: number;

        _count?: {
            posts: number;
        };

        artista?: {
            id: number;
            nome: string;
            fotoURL?: string | null;
        };
    };

    _count?: {
        curtidas: number;
        comentarios: number;
    };

    curtidoPorMim?: boolean;
}

interface BuscarPostsOpcoes {
    rota?: string;
    token?: string | null;
}

export interface CriarPostDados {
    musicaId: number;
    nota: number;
    texto: string;
}

export async function criarPost(dados: CriarPostDados) {
    return apiRequest("/posts", {
        method: "POST",
        body: JSON.stringify(dados),
    });
}

export async function buscarPosts({
    rota = "/posts",
    token,
}: BuscarPostsOpcoes = {}): Promise<Post[]> {
    const dados = await apiRequest<unknown>(rota, { token });

    if (!Array.isArray(dados)) {
        throw new Error("A API retornou uma lista de posts inválida.");
    }

    return dados as Post[];
}


export async function buscarPostPorId(postId: number): Promise<Post> {
    return apiRequest<Post>(`/posts/${postId}`);
}


export async function buscarPostsDaMusica(
    musicaId: number
): Promise<Post[]> {
    return buscarPosts({
        rota: `/posts?musicaId=${musicaId}`,
    });
}

export interface EditarPostDados {
    texto: string | null;
    nota: number;
}

export async function editarPost(
    postId: number,
    dados: EditarPostDados
): Promise<Post> {
    return apiRequest<Post>(`/posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify(dados),
    });
}

export async function excluirPost(postId: number): Promise<void> {
    await apiRequest<void>(`/posts/${postId}`, {
        method: "DELETE",
    });
}

export async function denunciarPost(
    postId: number,
    motivo: string
): Promise<void> {
    await apiRequest<void>(`/posts/${postId}/denunciar`, {
        method: "POST",
        body: JSON.stringify({ motivo }),
    });
}
