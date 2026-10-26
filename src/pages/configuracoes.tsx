
import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Contrast,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  ScrollText,
  LogOut,
  ChevronRight,
  Music2,
} from "lucide-react";

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
    : "sistema";
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
    <div className="w-full rounded-md border border-[#252D38] bg-[#10151F]">
      <div className="flex min-h-[42px] items-center gap-3 px-4 py-2">
        {icone}
        <span className="flex-1 text-[12px] text-[#B8BECC]">{titulo}</span>
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

  // Aplica e salva o tema escolhido.
  useEffect(() => {
    localStorage.setItem("mare-tema", tema);
    document.documentElement.dataset.theme = tema;
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
            <div className="sticky top-0 z-20 bg-[#080A10]">
              <div className="pt-6">
                <SearchBar />
              </div>
            </div>

            <div className="w-full pt-5">
              <div className="mb-6">
                <h1 className="font-serif text-[26px] text-white">
                  Configurações
                </h1>
                <p className="mt-1 font-serif text-[13px] text-[#697386]">
                  Gerencie suas preferências
                </p>
              </div>

              {/* PREFERÊNCIAS */}
              <section className="mb-7">
                <h2 className="mb-3 font-serif text-[18px] text-white">
                  Preferências
                </h2>

                <div className="flex flex-col gap-2">
                  {/* APARÊNCIA */}
                  <CaixaOpcao
                    icone={<Contrast size={16} className="text-[#8992A5]" />}
                    titulo="Aparência"
                  >
                    <select
                      value={tema}
                      onChange={(e) => setTema(e.target.value as Tema)}
                      aria-label="Tema da aparência"
                      className="max-w-[125px] cursor-pointer rounded-md border border-[#252D38] bg-[#080A10] px-2 py-1.5 text-[11px] text-[#B8BECC] outline-none transition hover:border-[#3A73C4] focus:border-[#3A73C4]"
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
                    className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 rounded-md border border-[#252D38] bg-[#10151F] px-4 text-left transition hover:border-[#3A73C4]"
                  >
                    <Bell size={16} className="text-[#8992A5]" />
                    <span className="flex-1 text-[12px] text-[#B8BECC]">
                      Notificações
                    </span>
                    <ChevronRight
                      size={14}
                      className={`text-[#737C8E] transition-transform ${
                        mostrarNotificacoes ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {mostrarNotificacoes && (
                    <div className="flex flex-col gap-3 rounded-md border border-[#252D38] bg-[#10151F] p-4">
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
                          <span className="text-[12px] text-[#B8BECC]">
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

                      <p className="text-[11px] text-[#697386]">
                        Essas opções são salvas neste navegador.
                      </p>
                    </div>
                  )}

                  {/* PREFERÊNCIAS MUSICAIS */}
                  <button
                    type="button"
                    onClick={() => setMostrarGeneros((mostrar) => !mostrar)}
                    aria-expanded={mostrarGeneros}
                    className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 rounded-md border border-[#252D38] bg-[#10151F] px-4 text-left transition hover:border-[#3A73C4]"
                  >
                    <SlidersHorizontal
                      size={16}
                      className="text-[#8992A5]"
                    />
                    <span className="flex-1 text-[12px] text-[#B8BECC]">
                      Preferências musicais
                    </span>
                    <ChevronRight
                      size={14}
                      className={`text-[#737C8E] transition-transform ${
                        mostrarGeneros ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {mostrarGeneros && (
                    <div className="rounded-md border border-[#252D38] bg-[#10151F] p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <Music2 size={16} className="text-[#58A9E8]" />
                        <p className="text-[12px] text-[#B8BECC]">
                          Quais gêneros você gosta?
                        </p>
                      </div>

                      {carregandoGeneros ? (
                        <p className="py-4 text-xs text-[#697386]">
                          Carregando gêneros...
                        </p>
                      ) : generosDisponiveis.length === 0 ? (
                        <p className="py-4 text-xs text-[#697386]">
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
                                className={`rounded-md cursor-pointer border px-3 py-1.5 text-[11px] transition ${
                                  selecionado
                                    ? "border-[#3A73C4] bg-[#203A56] text-white"
                                    : "border-[#252D38] bg-[#080A10] text-[#8992A5] hover:border-[#3A73C4] hover:text-white"
                                }`}
                              >
                                {genero}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <p className="mt-3 text-[11px] text-[#697386]">
                        {generos.length === 0
                          ? "Nenhum gênero selecionado."
                          : `${generos.length} ${
                              generos.length === 1
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
                          className="text-[12px] cursor-pointer text-[#72A8DD] transition hover:text-white"
                        >
                          Explorar músicas →
                        </button>

                        <button
                          type="button"
                          onClick={salvarGeneros}
                          disabled={carregandoGeneros || salvandoGeneros}
                          className="rounded-md cursor-pointer bg-[#58A9E8] px-3 py-2 text-[11px] font-medium text-[#080A10] transition hover:bg-[#79BCF5] disabled:cursor-not-allowed disabled:opacity-50"
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
                <h2 className="mb-3 font-serif text-[18px] text-white">
                  Sobre
                </h2>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate("/termos")}
                    className="flex min-h-[42px] w-full items-center gap-3 rounded-md border border-[#252D38] bg-[#10151F] px-4 text-left transition hover:border-[#3A73C4]"
                  >
                    <ShieldCheck size={16} className="text-[#8992A5]" />
                    <span className="flex-1 cursor-pointer text-[12px] text-[#B8BECC]">
                      Termos de uso
                    </span>
                    <ChevronRight size={14} className="text-[#737C8E]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/privacidade")}
                    className="flex min-h-[42px] cursor-pointer w-full items-center gap-3 rounded-md border border-[#252D38] bg-[#10151F] px-4 text-left transition hover:border-[#3A73C4]"
                  >
                    <ScrollText size={16} className="text-[#8992A5]" />
                    <span className="flex-1 text-[12px] text-[#B8BECC]">
                      Privacidade
                    </span>
                    <ChevronRight size={14} className="text-[#737C8E]" />
                  </button>
                </div>
              </section>

              {/* SAIR */}
              <section>
                <h2 className="mb-3 font-serif text-[18px] text-white">
                  Sair
                </h2>

                <button
                  type="button"
                  onClick={sairDaConta}
                  className="flex min-h-[42px] w-full cursor-pointer items-center gap-3 rounded-md border border-[#6B2632] bg-[#160D12] px-4 text-left transition hover:border-[#E5484D]"
                >
                  <LogOut size={16} className="text-[#C94B55]" />
                  <span className="text-[12px] text-[#C94B55]">
                    Sair da conta
                  </span>
                </button>
              </section>
            </div>
          </section>

          {/* MÚSICAS RECOMENDADAS */}
          <aside className="hidden min-w-0 xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                <RecommendedMusicList />
              </div>
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}
