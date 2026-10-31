
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  CircleHalfIcon,
  BellIcon,
  SlidersHorizontalIcon,
  ShieldCheckIcon,
  FileTextIcon,
  SignOutIcon,
  CaretRightIcon,
  MusicNotesIcon,
} from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import RecommendedMusicList from "../components/recommendedMusicList";
import { API_URL } from "../api";

type Tema = "sistema" | "escuro" | "claro";

type PreferenciasNotificacao = {
  curtidas: boolean;
  comentarios: boolean;
  seguidores: boolean;
};

type Musica = {
  genero?: string | null;
};

const notificacoesPadrao: PreferenciasNotificacao = {
  curtidas: true,
  comentarios: true,
  seguidores: true,
};

function lerNotificacoes(): PreferenciasNotificacao {
  try {
    const dados = localStorage.getItem("mare-notificacoes");

    return dados
      ? { ...notificacoesPadrao, ...JSON.parse(dados) }
      : notificacoesPadrao;
  } catch {
    return notificacoesPadrao;
  }
}

function lerTema(): Tema {
  const salvo = localStorage.getItem("mare-tema");

  return salvo === "claro" || salvo === "escuro" || salvo === "sistema"
    ? salvo
    : "escuro";
}

function CaixaOpcao({
  icone,
  titulo,
  children,
}: {
  icone: ReactNode;
  titulo: string;
  children?: ReactNode;
}) {
  return (
    <div className="w-full rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)]">
      <div className="flex min-h-[42px] items-center gap-3 px-4 py-2">
        {icone}
        <span className="flex-1 text-[12px] text-[var(--cor-texto-secundario)]">{titulo}</span>
        {children}
      </div>
    </div>
  );
}

async function lerResposta<T>(resposta: Response): Promise<T> {
  const dados = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    throw new Error(
      dados.error || dados.message || "Não foi possível concluir a operação."
    );
  }

  return dados as T;
}

function extrairLista<T>(dados: unknown, chave: string): T[] {
  if (Array.isArray(dados)) return dados as T[];

  if (
    dados &&
    typeof dados === "object" &&
    Array.isArray((dados as Record<string, unknown>)[chave])
  ) {
    return (dados as Record<string, unknown>)[chave] as T[];
  }

  return [];
}

export default function Configuracoes() {
  const navigate = useNavigate();

  const [tema, setTema] = useState<Tema>(lerTema);
  const [notificacoes, setNotificacoes] =
    useState<PreferenciasNotificacao>(lerNotificacoes);

  const [mostrarNotificacoes, setMostrarNotificacoes] = useState(false);
  const [mostrarGeneros, setMostrarGeneros] = useState(false);

  const [generosDisponiveis, setGenerosDisponiveis] = useState<string[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [carregandoGeneros, setCarregandoGeneros] = useState(false);
  const [salvandoGeneros, setSalvandoGeneros] = useState(false);
  const [erroGeneros, setErroGeneros] = useState("");
  const [sucessoGeneros, setSucessoGeneros] = useState("");
  const [mostrarConfirmacaoSaida, setMostrarConfirmacaoSaida] =
    useState(false);
  const [saindo, setSaindo] = useState(false);

  // Aplica e salva o tema escolhido.
  useEffect(() => {
    localStorage.setItem("mare-tema", tema);
    const preferenciaSistema = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    const aplicarTema = () => {
      document.documentElement.dataset.tema =
        tema === "sistema"
          ? preferenciaSistema.matches
            ? "escuro"
            : "claro"
          : tema;
    };

    aplicarTema();

    if (tema === "sistema") {
      preferenciaSistema.addEventListener("change", aplicarTema);
      return () => preferenciaSistema.removeEventListener("change", aplicarTema);
    }
  }, [tema]);

  // Salva as preferências de notificação neste navegador.
  useEffect(() => {
    localStorage.setItem("mare-notificacoes", JSON.stringify(notificacoes));
  }, [notificacoes]);

  // Carrega os gêneros existentes nas músicas e as preferências do usuário.
  useEffect(() => {
    if (!mostrarGeneros) return;

    let ativo = true;

    async function carregarGeneros() {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token");

      if (!token) {
        setErroGeneros("Faça login para carregar suas preferências.");
        setCarregandoGeneros(false);
        return;
      }

      setCarregandoGeneros(true);
      setErroGeneros("");
      setSucessoGeneros("");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      try {
        const [respostaMusicas, respostaGeneros] = await Promise.all([
          fetch(`${API_URL}/musicas`, { headers }),
          fetch(`${API_URL}/usuarios/me/generos`, { headers }),
        ]);

        const [dadosMusicas, dadosGeneros] = await Promise.all([
          lerResposta<unknown>(respostaMusicas),
          lerResposta<unknown>(respostaGeneros),
        ]);

        if (!ativo) return;

        const musicas = extrairLista<Musica>(dadosMusicas, "musicas");

        const catalogo = musicas
          .map((musica) => musica.genero?.trim() ?? "")
          .filter(Boolean);

        const salvos = extrairLista<unknown>(dadosGeneros, "generos")
          .filter((genero): genero is string => typeof genero === "string")
          .map((genero) => genero.trim())
          .filter(Boolean);

        // Mantém gêneros salvos mesmo se não houver música correspondente no catálogo.
        const todosGeneros = [...new Set([...catalogo, ...salvos])].sort(
          (a, b) => a.localeCompare(b, "pt-BR")
        );

        setGenerosDisponiveis(todosGeneros);
        setGeneros(salvos);

        localStorage.setItem(
          "mare-generos-favoritos",
          JSON.stringify(salvos)
        );
      } catch (error) {
        if (!ativo) return;

        console.error("Erro ao carregar gêneros:", error);
        setErroGeneros(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os gêneros musicais."
        );
      } finally {
        if (ativo) setCarregandoGeneros(false);
      }
    }

    carregarGeneros();

    return () => {
      ativo = false;
    };
  }, [mostrarGeneros]);

  function alternarNotificacao(chave: keyof PreferenciasNotificacao) {
    setNotificacoes((atuais) => ({
      ...atuais,
      [chave]: !atuais[chave],
    }));
  }

  function alternarGenero(genero: string) {
    setGeneros((atuais) =>
      atuais.includes(genero)
        ? atuais.filter((item) => item !== genero)
        : [...atuais, genero]
    );

    setErroGeneros("");
    setSucessoGeneros("");
  }

  async function salvarGeneros() {
    if (salvandoGeneros) return;

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token");

    if (!token) {
      setErroGeneros("Faça login para salvar suas preferências.");
      return;
    }

    setSalvandoGeneros(true);
    setErroGeneros("");
    setSucessoGeneros("");

    try {
      const resposta = await fetch(`${API_URL}/usuarios/me/generos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ generos }),
      });

      const dados = await lerResposta<{
        generos?: string[];
        message?: string;
      }>(resposta);

      const generosSalvos = Array.isArray(dados.generos)
        ? dados.generos
        : generos;

      setGeneros(generosSalvos);
      setGenerosDisponiveis((atuais) =>
        [...new Set([...atuais, ...generosSalvos])].sort((a, b) =>
          a.localeCompare(b, "pt-BR")
        )
      );

      localStorage.setItem(
        "mare-generos-favoritos",
        JSON.stringify(generosSalvos)
      );

      setSucessoGeneros("Preferências musicais salvas.");
    } catch (error) {
      console.error("Erro ao salvar gêneros:", error);
      setErroGeneros(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar suas preferências."
      );
    } finally {
      setSalvandoGeneros(false);
    }
  }

  function sairDaConta() {
    setMostrarConfirmacaoSaida(true);
  }

  function confirmarSaida() {
    if (saindo) return;

    setSaindo(true);

    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("usuario");

    navigate("/");
    window.location.reload();
  }

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0">
            <div className="sticky top-0 z-20 bg-[var(--cor-fundo)]">
              <div className="pt-14 sm:pt-6">
                <SearchBar />
              </div>
            </div>

            <div className="w-full pt-5">
              <div className="mb-6">
                <h1 className="font-serif text-[26px] text-[var(--cor-texto-principal)]">
                  Configurações
                </h1>
                <p className="mt-1 font-serif text-[13px] text-[var(--cor-texto-discreto)]">
                  Gerencie suas preferências
                </p>
              </div>

              {/* PREFERÊNCIAS */}
              <section className="mb-7">
                <h2 className="mb-3 font-serif text-[18px] text-[var(--cor-texto-principal)]">
                  Preferências
                </h2>

                <div className="flex flex-col gap-2">
                  {/* APARÊNCIA */}
                  <CaixaOpcao
                    icone={<CircleHalfIcon size={16} className="text-[#8992A5]" />}
                    titulo="Aparência"
                  >
                    <select
                      value={tema}
                      onChange={(e) => setTema(e.target.value as Tema)}
                      aria-label="Tema da aparência"
                      className="max-w-[125px] cursor-pointer rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-fundo)] px-2 py-1.5 text-[11px] text-[var(--cor-texto-secundario)] outline-none transition hover:border-[var(--cor-borda-destaque)] focus:border-[var(--cor-borda-destaque)]"
                    >
                      <option value="sistema">Sistema</option>
                      <option value="escuro">Escuro</option>
                      <option value="claro">Claro</option>
                    </select>
                  </CaixaOpcao>

                  {/* NOTIFICAÇÕES */}
                  <button
                    type="button"
                    onClick={() =>
                      setMostrarNotificacoes((mostrar) => !mostrar)
                    }
                    aria-expanded={mostrarNotificacoes}
                    className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)] px-4 text-left transition hover:border-[var(--cor-borda-destaque)]"
                  >
                    <BellIcon size={16} className="text-[#8992A5]" />
                    <span className="flex-1 text-[12px] text-[var(--cor-texto-secundario)]">
                      Notificações
                    </span>
                    <CaretRightIcon
                      size={14}
                      className={`text-[#737C8E] transition-transform ${mostrarNotificacoes ? "rotate-90" : ""
                        }`}
                    />
                  </button>

                  {mostrarNotificacoes && (
                    <div className="flex flex-col gap-3 rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)] p-4">
                      {(
                        [
                          ["curtidas", "Curtidas"],
                          ["comentarios", "Comentários"],
                          ["seguidores", "Novos seguidores"],
                        ] as const
                      ).map(([chave, titulo]) => (
                        <label
                          key={chave}
                          className="flex cursor-pointer items-center justify-between gap-3"
                        >
                          <span className="text-[12px] text-[var(--cor-texto-secundario)]">
                            {titulo}
                          </span>
                          <input
                            type="checkbox"
                            checked={notificacoes[chave]}
                            onChange={() => alternarNotificacao(chave)}
                            className="h-4 w-4 cursor-pointer accent-[#58A9E8]"
                          />
                        </label>
                      ))}

                      <p className="text-[11px] text-[var(--cor-texto-discreto)]">
                        Essas opções são salvas neste navegador.
                      </p>
                    </div>
                  )}

                  {/* PREFERÊNCIAS MUSICAIS */}
                  <button
                    type="button"
                    onClick={() => setMostrarGeneros((mostrar) => !mostrar)}
                    aria-expanded={mostrarGeneros}
                    className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)] px-4 text-left transition hover:border-[var(--cor-borda-destaque)]"
                  >
                    <SlidersHorizontalIcon
                      size={16}
                      className="text-[#8992A5]"
                    />
                    <span className="flex-1 text-[12px] text-[var(--cor-texto-secundario)]">
                      Preferências musicais
                    </span>
                    <CaretRightIcon
                      size={14}
                      className={`text-[#737C8E] transition-transform ${mostrarGeneros ? "rotate-90" : ""
                        }`}
                    />
                  </button>

                  {mostrarGeneros && (
                    <div className="rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MusicNotesIcon size={16} className="text-[var(--cor-destaque-alternativo)]" />
                        <p className="text-[12px] text-[var(--cor-texto-secundario)]">
                          Quais gêneros você gosta?
                        </p>
                      </div>

                      {carregandoGeneros ? (
                        <p className="py-4 text-xs text-[var(--cor-texto-discreto)]">
                          Carregando gêneros...
                        </p>
                      ) : generosDisponiveis.length === 0 ? (
                        <p className="py-4 text-xs text-[var(--cor-texto-discreto)]">
                          Nenhum gênero encontrado no catálogo.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {generosDisponiveis.map((genero) => {
                            const selecionado = generos.includes(genero);

                            return (
                              <button
                                key={genero}
                                type="button"
                                onClick={() => alternarGenero(genero)}
                                aria-pressed={selecionado}
                                className={`rounded-md cursor-pointer border px-3 py-1.5 text-[11px] transition ${selecionado
                                    ? "border-[var(--cor-borda-destaque)] bg-[var(--cor-superficie-genero-selecionado)] text-[var(--cor-texto-principal)]"
                                    : "border-[var(--cor-borda-discreta)] bg-[var(--cor-fundo)] text-[#8992A5] hover:border-[var(--cor-borda-destaque)] hover:text-[var(--cor-texto-principal)]"
                                  }`}
                              >
                                {genero}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <p className="mt-3 text-[11px] text-[var(--cor-texto-discreto)]">
                        {generos.length === 0
                          ? "Nenhum gênero selecionado."
                          : `${generos.length} ${generos.length === 1
                            ? "gênero selecionado"
                            : "gêneros selecionados"
                          }`}
                      </p>

                      {erroGeneros && (
                        <p role="alert" className="mt-3 text-xs text-red-400">
                          {erroGeneros}
                        </p>
                      )}

                      {sucessoGeneros && (
                        <p className="mt-3 text-xs text-green-400">
                          {sucessoGeneros}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => navigate("/explorar")}
                          className="text-[12px] cursor-pointer text-[#72A8DD] transition hover:text-[var(--cor-texto-principal)]"
                        >
                          Explorar músicas →
                        </button>

                        <button
                          type="button"
                          onClick={salvarGeneros}
                          disabled={carregandoGeneros || salvandoGeneros}
                          className="rounded-md cursor-pointer bg-[var(--cor-destaque-alternativo)] px-3 py-2 text-[11px] font-medium text-[var(--cor-tinta)] transition hover:bg-[#79BCF5] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {salvandoGeneros ? "Salvando..." : "Salvar preferências"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* SOBRE */}
              <section className="mb-7">
                <h2 className="mb-3 font-serif text-[18px] text-[var(--cor-texto-principal)]">
                  Sobre
                </h2>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/termos")}
                    className="flex min-h-[42px] w-full items-center gap-3 rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)] px-4 text-left transition hover:border-[var(--cor-borda-destaque)]"
                  >
                    <ShieldCheckIcon size={16} className="text-[#8992A5]" />
                    <span className="flex-1 cursor-pointer text-[12px] text-[var(--cor-texto-secundario)]">
                      Termos de uso
                    </span>
                    <CaretRightIcon size={14} className="text-[#737C8E]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/privacidade")}
                    className="flex min-h-[42px] cursor-pointer w-full items-center gap-3 rounded-md border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie-alternativa)] px-4 text-left transition hover:border-[var(--cor-borda-destaque)]"
                  >
                    <FileTextIcon size={16} className="text-[#8992A5]" />
                    <span className="flex-1 text-[12px] text-[var(--cor-texto-secundario)]">
                      Privacidade
                    </span>
                    <CaretRightIcon size={14} className="text-[#737C8E]" />
                  </button>
                </div>
              </section>

              {/* SAIR */}
              <section>
                <h2 className="mb-3 font-serif text-[18px] text-[var(--cor-texto-principal)]">
                  Sair
                </h2>

                <button
                  type="button"
                  onClick={sairDaConta}
                  className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--cor-borda-perigo)] bg-[var(--cor-fundo-perigo)] px-4 text-left transition hover:border-red-500 hover:bg-red-500/10"
                >
                  <SignOutIcon size={16} className="text-[var(--cor-texto-perigo)]" />
                  <span className="text-[12px] text-[var(--cor-texto-perigo)]">
                    Sair da conta
                  </span>
                </button>
              </section>
            </div>
          </section>

          {/* MÚSICAS RECOMENDADAS */}
          <aside className="hidden min-w-0 xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-[16px] text-[var(--cor-texto-principal)]">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                <RecommendedMusicList />
              </div>
            </div>
          </aside>
        </div>
      </PageContent>

            {/* Confirmação para sair da conta */}
      {mostrarConfirmacaoSaida && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-sair"
            className="w-full max-w-sm rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-5 shadow-2xl shadow-black/40"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <SignOutIcon size={22} />
            </div>

            <h2
              id="titulo-sair"
              className="text-base font-semibold text-[var(--cor-texto-principal)]"
            >
              Sair da conta?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--cor-texto-secundario)]">
              Você precisará entrar novamente para acessar sua conta. Deseja
              continuar?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setMostrarConfirmacaoSaida(false)}
                disabled={saindo}
                className="cursor-pointer rounded-lg border border-[var(--cor-borda)] px-4 py-2.5 text-sm text-[var(--cor-texto-principal)] transition hover:bg-[var(--cor-superficie-elevada)] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarSaida}
                disabled={saindo}
                className="cursor-pointer rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saindo ? "Saindo..." : "Sair da conta"}
              </button>
            </div>
          </div>
        </div>
      )}
      
    </PageLayout>
  );
}
