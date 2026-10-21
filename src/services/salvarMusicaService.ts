import { apiRequest } from "../api";

interface MusicaSalva {
    musica?: {
        id: number;
    };
}

export async function verificarMusicaSalva(
    musicaId: number
): Promise<boolean> {
    const token = localStorage.getItem("token");

    if (!token) return false;

    const dados = await apiRequest<unknown>("/usuarios/me/salvos");

    if (!Array.isArray(dados)) {
        throw new Error("A API retornou uma lista de músicas salvas inválida.");
    }

    return (dados as MusicaSalva[]).some(
        (item) => item.musica?.id === musicaId
    );
}

export async function alternarMusicaSalva(
    musicaId: number,
    jaEstaSalva: boolean
): Promise<void> {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Faça login para salvar músicas.");
    }

    await apiRequest(`/musicas/${musicaId}/salvar`, {
        method: jaEstaSalva ? "DELETE" : "POST",
    });
}