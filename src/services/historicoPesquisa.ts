const CHAVE_HISTORICO_PESQUISA = "mare:historico-pesquisa:v1";
const LIMITE_HISTORICO = 8;

function normalizar(termo: string) {
  return termo.trim().toLocaleLowerCase("pt-BR");
}

function salvarHistorico(historico: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAVE_HISTORICO_PESQUISA, JSON.stringify(historico));
  } catch (erro) {
    console.warn("Não foi possível salvar o histórico de pesquisa.", erro);
  }
}

export function buscarHistoricoPesquisa(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const salvo = window.localStorage.getItem(CHAVE_HISTORICO_PESQUISA);
    const dados: unknown = salvo ? JSON.parse(salvo) : [];
    return Array.isArray(dados)
      ? dados.filter((termo): termo is string => typeof termo === "string").slice(0, LIMITE_HISTORICO)
      : [];
  } catch (erro) {
    console.warn("Não foi possível carregar o histórico de pesquisa.", erro);
    return [];
  }
}

export function registrarPesquisa(termo: string): string[] {
  const consulta = termo.trim();
  if (!consulta || typeof window === "undefined") return buscarHistoricoPesquisa();

  const atualizado = [
    consulta,
    ...buscarHistoricoPesquisa().filter((item) => normalizar(item) !== normalizar(consulta)),
  ].slice(0, LIMITE_HISTORICO);
  salvarHistorico(atualizado);
  return atualizado;
}

export function removerPesquisaDoHistorico(termo: string): string[] {
  if (typeof window === "undefined") return [];
  const atualizado = buscarHistoricoPesquisa().filter((item) => normalizar(item) !== normalizar(termo));
  salvarHistorico(atualizado);
  return atualizado;
}

export function limparHistoricoPesquisa(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CHAVE_HISTORICO_PESQUISA);
  } catch (erro) {
    console.warn("Não foi possível limpar o histórico de pesquisa.", erro);
  }
}
