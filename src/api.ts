
export const API_URL = import.meta.env.VITE_API_URL;

interface ApiRequestOptions extends RequestInit {
    token?: string | null;
}

export class ApiError extends Error {
    code?: string;

    constructor(message: string, code?: string) {
        super(message);
        this.name = "ApiError";
        this.code = code;
    }
}

export async function apiRequest<T = unknown>(
    rota: string,
    opcoes: ApiRequestOptions = {}
): Promise<T> {
    const {
        token = localStorage.getItem("token"),
        headers: headersOriginais,
        ...opcoesFetch
    } = opcoes;

    const headers = new Headers(headersOriginais);

    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    if (
        opcoesFetch.body &&
        !(opcoesFetch.body instanceof FormData) &&
        !headers.has("Content-Type")
    ) {
        headers.set("Content-Type", "application/json");
    }

    const resposta = await fetch(`${API_URL}${rota}`, {
        ...opcoesFetch,
        headers,
    });

    if (resposta.status === 204) {
        return undefined as T;
    }

    const tipoConteudo = resposta.headers.get("content-type");

    const dados: unknown = tipoConteudo?.includes("application/json")
        ? await resposta.json()
        : await resposta.text();

    if (!resposta.ok) {
        let mensagem = "Ocorreu um erro na requisição.";
        let codigo: string | undefined;

        if (dados && typeof dados === "object") {
            const erro = dados as Record<string, unknown>;

            mensagem = String(
                erro.error ?? erro.erro ?? erro.message ?? mensagem
            );

            if (typeof erro.code === "string") {
                codigo = erro.code;
            }
        } else if (typeof dados === "string" && dados.trim()) {
            mensagem = dados;
        }

        throw new ApiError(mensagem, codigo);
    }

    return dados as T;
}
