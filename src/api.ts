export const API_URL = "http://10.92.199.19:3000";

interface ApiRequestOptions extends RequestInit {
  token?: string | null;
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

  // Adiciona o token quando disponível.
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Define JSON como padrão, exceto quando o corpo for FormData.
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

  // Algumas rotas podem não retornar conteúdo.
  if (resposta.status === 204) {
    return undefined as T;
  }

  const tipoConteudo = resposta.headers.get("content-type");

  const dados: unknown = tipoConteudo?.includes("application/json")
    ? await resposta.json()
    : await resposta.text();

  if (!resposta.ok) {
    let mensagem = "Ocorreu um erro na requisição.";

    if (dados && typeof dados === "object") {
      const erro = dados as Record<string, unknown>;
      mensagem = String(
        erro.error ?? erro.erro ?? erro.message ?? mensagem
      );
    } else if (typeof dados === "string" && dados.trim()) {
      mensagem = dados;
    }

    throw new Error(mensagem);
  }

  return dados as T;
}
