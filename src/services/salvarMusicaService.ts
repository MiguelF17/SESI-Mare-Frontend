import { apiRequest } from "../api";

interface MusicaSalva {
    musica?: {
        id: number;
    };
}

const DURACAO_CACHE_MS = 15_000;
const requisicoesSalvosEmAndamento = new Map<string, Promise<Set<number>>>();
let cacheSalvos: {
    token: string;
    ids: Set<number>;
    expiraEm: number;
} | null = null;

async function buscarIdsSalvos(token: string): Promise<Set<number>> {
    if (
        cacheSalvos?.token === token &&
        cacheSalvos.expiraEm > Date.now()
    ) {
        return cacheSalvos.ids;
    }

    let requisicao = requisicoesSalvosEmAndamento.get(token);

    if (!requisicao) {
        requisicao = apiRequest<unknown>("/usuarios/me/salvos", { token }).then(
            (dados) => {
                if (!Array.isArray(dados)) {
                    throw new Error(
                        "A API retornou uma lista de músicas salvas inválida."
                    );
                }

                const ids = new Set(
                    (dados as MusicaSalva[])
                        .map((item) => item.musica?.id)
                        .filter((id): id is number => typeof id === "number")
                );

                cacheSalvos = {
                    token,
                    ids,
                    expiraEm: Date.now() + DURACAO_CACHE_MS,
                };

                return ids;
            }
        );

        requisicoesSalvosEmAndamento.set(token, requisicao);
    }

    try {
        return await requisicao;
    } finally {
        if (requisicoesSalvosEmAndamento.get(token) === requisicao) {
            requisicoesSalvosEmAndamento.delete(token);
        }
    }
}

export async function verificarMusicaSalva(
    musicaId: number
): Promise<boolean> {
    const token = localStorage.getItem("token");

    if (!token) return false;

    const idsSalvos = await buscarIdsSalvos(token);
    return idsSalvos.has(musicaId);
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

    if (cacheSalvos?.token === token) {
        const ids = new Set(cacheSalvos.ids);

        if (jaEstaSalva) {
            ids.delete(musicaId);
        } else {
            ids.add(musicaId);
        }

        cacheSalvos = {
            token,
            ids,
            expiraEm: Date.now() + DURACAO_CACHE_MS,
        };
    }
}
