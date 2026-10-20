
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  MagnifyingGlassIcon,
  MusicNotesIcon,
  UsersThreeIcon,
  XIcon,
} from "@phosphor-icons/react";

import { API_URL } from "../api";
import logo from "../assets/logo.png";

type Artista = {
  id: number | string;
  nome: string;
  fotoURL?: string | null;
};

function extrairLista<T>(data: unknown, chave: string): T[] {
  if (Array.isArray(data)) return data as T[];

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as Record<string, unknown>)[chave])
  ) {
    return (data as Record<string, unknown>)[chave] as T[];
  }

  return [];
}

async function lerResposta(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || "Não foi possível carregar os dados."
    );
  }

  return data;
}

export default function EscolherMusica() {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [generos, setGeneros] = useState<string[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);

  const [generosSelecionados, setGenerosSelecionados] = useState<string[]>([]);
  const [artistasSelecionados, setArtistasSelecionados] = useState<
    Array<number | string>
  >([]);

  const [pesquisaGenero, setPesquisaGenero] = useState("");
  const [pesquisaArtista, setPesquisaArtista] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarCatalogo() {
      const token = localStorage.getItem("token");



      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setCarregando(true);
        setErro("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Verifica se o usuário já concluiu as preferências
        const respostaUsuario = await fetch(`${API_URL}/usuarios/me`, {
          headers,
        });

        if (respostaUsuario.status === 401 || respostaUsuario.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login", { replace: true });
          return;
        }

        const dadosUsuario = await lerResposta(respostaUsuario);

        const usuario = dadosUsuario.usuario ?? dadosUsuario;

        if (usuario.preferenciasConcluidas === true) {
          navigate("/home", { replace: true });
          return;
        }


        // Carrega apenas os gêneros existentes e os artistas
        const [respostaGeneros, respostaArtistas] = await Promise.all([
          fetch(`${API_URL}/musicas/generos`, { headers }),
          fetch(`${API_URL}/artistas`, { headers }),
        ]);

        const [dadosGeneros, dadosArtistas] = await Promise.all([
          lerResposta(respostaGeneros),
          lerResposta(respostaArtistas),
        ]);

        const listaGeneros = extrairLista<string>(
          dadosGeneros,
          "generos"
        )
          .map((genero) => genero.trim())
          .filter(Boolean);

        const listaArtistas = extrairLista<Artista>(
          dadosArtistas,
          "artistas"
        );

        if (!ativo) return;

        setGeneros(
          [...new Set(listaGeneros)].sort((a, b) =>
            a.localeCompare(b, "pt-BR")
          )
        );

        setArtistas(
          [...listaArtistas].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR")
          )
        );

      } catch (error) {
        if (!ativo) return;

        if (error instanceof Error && /401|403|sessão|token/i.test(error.message)) {
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/login", { replace: true });
          return;
        }

        console.error("Erro ao carregar catálogo:", error);
        setErro(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar o catálogo musical."
        );
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarCatalogo();

    return () => {
      ativo = false;
    };
  }, [navigate]);

  const generosFiltrados = useMemo(
    () =>
      generos.filter((genero) =>
        genero.toLocaleLowerCase("pt-BR").includes(
          pesquisaGenero.toLocaleLowerCase("pt-BR")
        )
      ),
    [generos, pesquisaGenero]
  );

  const artistasFiltrados = useMemo(
    () =>
      artistas.filter((artista) =>
        artista.nome.toLocaleLowerCase("pt-BR").includes(
          pesquisaArtista.toLocaleLowerCase("pt-BR")
        )
      ),
    [artistas, pesquisaArtista]
  );

  function alternarGenero(genero: string) {
    setGenerosSelecionados((atuais) =>
      atuais.includes(genero)
        ? atuais.filter((item) => item !== genero)
        : [...atuais, genero]
    );
  }

  function alternarArtista(id: number | string) {
    setArtistasSelecionados((atuais) =>
      atuais.some((item) => String(item) === String(id))
        ? atuais.filter((item) => String(item) !== String(id))
        : [...atuais, id]
    );
  }

  async function concluirSelecao() {
    if (salvando) return;

    if (generosSelecionados.length === 0) {
      setErro("Selecione pelo menos um gênero musical.");
      setEtapa(1);
      return;
    }

    if (artistasSelecionados.length === 0) {
      setErro("Selecione pelo menos um artista.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      setSalvando(true);
      setErro("");

      const respostaArtistas = await fetch(
        `${API_URL}/usuarios/me/artistas`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            artistaIds: artistasSelecionados,
          }),
        }
      );

      await lerResposta(respostaArtistas);

      const respostaGeneros = await fetch(
        `${API_URL}/usuarios/me/generos`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            generos: generosSelecionados,
          }),
        }
      );

      await lerResposta(respostaGeneros);

      navigate("/home", { replace: true });
    } catch (error) {
      console.error("Erro ao salvar preferências:", error);

      if (
        error instanceof Error &&
        /401|403|sessão|token/i.test(error.message)
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        navigate("/login", { replace: true });
        return;
      }

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar suas preferências."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080A10] text-[#F5F7FB]">
      {/* Degradê do fundo */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#172B41] via-[#101D2C]/70 to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-8">
        {/* Cabeçalho */}
        <header className="flex flex-col items-center">
          <div className="m-4 flex h-12 items-center justify-center">
            <img src={logo} alt="Maré" className="h-20 w-auto" />
          </div>

          <h1 className="mt-4 text-center font-serif text-2xl font-normal tracking-tight sm:text-3xl">
            {etapa === 1
              ? "Qual é a sua vibe?"
              : "Quem você gosta de ouvir?"}
          </h1>

          <p className="max-w-lg text-center text-xs leading-relaxed text-[#9BA8B8] sm:text-sm">
            {etapa === 1
              ? "Escolha seus estilos favoritos para personalizar seu feed de descobertas."
              : "Escolha seus artistas favoritos para deixar suas descobertas ainda mais pessoais."}
          </p>
        </header>

        {/* Conteúdo */}
        <section className="mt-6 flex-1 sm:mt-8">
          {/* Pesquisa */}
          <label className="mx-auto mb-6 flex w-full max-w-md items-center gap-3 rounded-lg border border-[#29384B] bg-[#0D1520]/80 px-4 transition focus-within:border-[#58AAF0]">
            <MagnifyingGlassIcon
              size={18}
              className="shrink-0 text-[#8495A9]"
            />

            <input
              value={etapa === 1 ? pesquisaGenero : pesquisaArtista}
              onChange={(event) =>
                etapa === 1
                  ? setPesquisaGenero(event.target.value)
                  : setPesquisaArtista(event.target.value)
              }
              placeholder={
                etapa === 1
                  ? "Buscar gênero musical..."
                  : "Buscar artista..."
              }
              className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder:text-[#738196]"
            />

            {(etapa === 1 ? pesquisaGenero : pesquisaArtista) && (
              <button
                type="button"
                aria-label="Limpar pesquisa"
                onClick={() =>
                  etapa === 1
                    ? setPesquisaGenero("")
                    : setPesquisaArtista("")
                }
                className="text-[#8495A9] transition hover:text-white"
              >
                <XIcon size={17} />
              </button>
            )}
          </label>

          {/* Etapa 1: gêneros */}
          {etapa === 1 && (
            <>
              {carregando ? (
                <p className="py-12 text-center text-sm text-[#9BA8B8]">
                  Carregando gêneros do catálogo...
                </p>
              ) : generosFiltrados.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#354052] px-4 py-10 text-center text-sm leading-relaxed text-[#9BA8B8]">
                  {generos.length === 0
                    ? "Ainda não há gêneros disponíveis no catálogo."
                    : "Nenhum gênero corresponde à sua pesquisa."}
                </div>
              ) : (
                <div className="scrollbar-mare grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto overscroll-contain rounded-lg pr-2 pb-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {generosFiltrados.map((genero, index) => {
                    const selecionado = generosSelecionados.includes(genero);

                    const icones = [
                      MusicNotesIcon,
                      UsersThreeIcon,
                      MusicNotesIcon,
                      MusicNotesIcon,
                    ];

                    const Icone = icones[index % icones.length];

                    return (
                      <button
                        key={genero}
                        type="button"
                        aria-pressed={selecionado}
                        onClick={() => alternarGenero(genero)}
                        className={`group cursor-pointer flex min-h-[76px] flex-col justify-between rounded-md border p-3 text-left transition duration-200 sm:min-h-[86px] ${selecionado
                          ? "border-[#58AAF0] bg-[#1A2C40]/90 shadow-[0_0_0_1px_rgba(88,170,240,0.08)]"
                          : "border-[#293342] bg-[#101722]/80 hover:border-[#52718F] hover:bg-[#152131]"
                          }`}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-md ${selecionado
                            ? "bg-[#244C70] text-[#8CCBFF]"
                            : "bg-[#1B2532] text-[#A6B4C5]"
                            }`}
                        >
                          <Icone size={14} weight="duotone" />
                        </span>

                        <span className="mt-3 flex items-center justify-between gap-2">
                          <span className="break-words text-xs text-[#E0E7F0] sm:text-sm">
                            {genero}
                          </span>

                          <span
                            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition ${selecionado
                              ? "border-[#58AAF0] bg-[#58AAF0] text-[#07111E]"
                              : "border-[#536174] text-transparent group-hover:border-[#58AAF0]"
                              }`}
                          >
                            <CheckIcon size={10} weight="bold" />
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Etapa 2: artistas */}
          {etapa === 2 && (
            <>
              {carregando ? (
                <p className="py-12 text-center text-sm text-[#9BA8B8]">
                  Carregando artistas do catálogo...
                </p>
              ) : artistasFiltrados.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#354052] px-4 py-10 text-center text-sm leading-relaxed text-[#9BA8B8]">
                  {artistas.length === 0
                    ? "Ainda não há artistas cadastrados no catálogo."
                    : "Nenhum artista corresponde à sua pesquisa."}
                </div>
              ) : (
                <div className="scrollbar-mare grid max-h-[55vh] grid-cols-2 gap-3 overflow-y-auto overscroll-contain rounded-lg pr-2 pb-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {artistasFiltrados.map((artista) => {
                    const selecionado = artistasSelecionados.some(
                      (id) => String(id) === String(artista.id)
                    );

                    return (
                      <button
                        key={artista.id}
                        type="button"
                        aria-pressed={selecionado}
                        onClick={() => alternarArtista(artista.id)}
                        className={`group cursor-pointer rounded-lg border p-3 text-center transition duration-200 ${selecionado
                          ? "border-[#58AAF0] bg-[#1A2C40]/90"
                          : "border-[#293342] bg-[#101722]/80 hover:border-[#52718F] hover:bg-[#152131]"
                          }`}
                      >
                        <span className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-md bg-[#1B2A3B]">
                          {artista.fotoURL ? (
                            <img
                              src={artista.fotoURL}
                              alt={`Foto de ${artista.nome}`}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <UsersThreeIcon
                              size={36}
                              className="text-[#58AAF0]"
                            />
                          )}

                          {selecionado && (
                            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#58AAF0] text-[#07111E]">
                              <CheckIcon size={14} weight="bold" />
                            </span>
                          )}
                        </span>

                        <span className="block break-words text-sm text-[#E0E7F0]">
                          {artista.nome}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Erro */}
          {erro && (
            <div
              role="alert"
              className="mt-5 rounded-lg border border-red-400/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
            >
              {erro}
            </div>
          )}
        </section>

        {/* Rodapé */}
        <footer className="mt-8 flex flex-col gap-5 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-[#9BA8B8]">
              Passo {etapa} de 2
            </p>

            <div className="mt-2 h-1 w-32 overflow-hidden rounded-full bg-[#293342]">
              <div
                className={`h-full rounded-full bg-[#58AAF0] transition-all duration-300 ${etapa === 2 ? "w-full" : "w-1/2"
                  }`}
              />
            </div>

            <p className="mt-2 text-xs text-[#8495A9]">
              {etapa === 1
                ? `${generosSelecionados.length} gênero(s) selecionado(s)`
                : `${artistasSelecionados.length} artista(s) selecionado(s)`}
            </p>
          </div>

          <div className="flex cursor-p items-center justify-between gap-3 sm:justify-end">
            {etapa === 2 && (
              <button
                type="button"
                disabled={salvando}
                onClick={() => {
                  setErro("");
                  setEtapa(1);
                }}
                className="flex cursor-pointer h-11 items-center gap-2 rounded-full border border-[#354052] px-4 text-sm text-[#DCE3ED] transition hover:border-[#58AAF0] hover:bg-[#152131] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeftIcon size={17} />
                Voltar
              </button>
            )}

            {etapa === 1 ? (
              <button
                type="button"
                disabled={carregando || salvando}
                onClick={() => {
                  if (generosSelecionados.length === 0) {
                    setErro("Selecione pelo menos um gênero musical.");
                    return;
                  }

                  setErro("");
                  setEtapa(2);
                }}
                className="flex cursor-pointer h-11 items-center gap-3 rounded-full bg-[#58AAF0] px-5 text-sm font-medium text-[#07111E] transition hover:bg-[#79BCF5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Escolher artistas
                <ArrowRightIcon size={17} />
              </button>
            ) : (
              <button
                type="button"
                disabled={carregando || salvando}
                onClick={concluirSelecao}
                className="flex cursor-pointer h-11 items-center gap-3 rounded-full bg-[#58AAF0] px-5 text-sm font-medium text-[#07111E] transition hover:bg-[#79BCF5] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Concluir"}
                {!salvando && <CheckIcon size={17} weight="bold" />}
              </button>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
