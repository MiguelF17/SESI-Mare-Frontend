import { apiRequest } from "../api";

export interface Musica {
    id: number;
    titulo: string;
    genero?: string | null;
    capa: string | null;
    duracaoSegundos?: number;
    nota?: number;
    avaliacoes?: number;
    artista?: {
        id: number;
        nome: string;
        fotoURL?: string | null;
    };

    _count?: {
        posts?: number;
    };

    spotifyUrl?: string | null;
    appleMusicUrl?: string | null;
    amazonMusicUrl?: string | null;
    youtubeMusicUrl?: string | null;
}

export async function buscarMusicas(): Promise<Musica[]> {
    const dados = await apiRequest<unknown>("/musicas");

    if (!Array.isArray(dados)) {
        throw new Error("A API retornou uma lista de músicas inválida.");
    }

    return dados as Musica[];
}

export async function buscarMusicaPorId(id: number): Promise<Musica> {
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("ID de música inválido.");
    }

    return apiRequest<Musica>(`/musicas/${id}`);
}