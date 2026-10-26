import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  StarIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import OuvirCard from "../components/ouvirCard";
import MusicCard from "../components/musicCard";

import { buscarMusicas } from "../services/musicaService";
import { criarPost } from "../services/postService";
import type { Musica } from "../services/musicaService";
import { buscarMeuPerfil } from "../services/usuarioService";
import type { MeuPerfil } from "../services/usuarioService";
import { apiRequest } from "../api";
import { buscarGenerosFavoritos } from "../services/usuarioService";
import { useMusicasRecomendadas } from "../hooks/useMusicasRecomendadas";


function CarrosselRecomendadas({
  children,
}: {
  children: React.ReactNode;
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    function atualizarSetas() {
      const maxScroll = trilho!.scrollWidth - trilho!.clientWidth;

      setPodeVoltar(trilho!.scrollLeft > 2);
      setPodeAvancar(maxScroll - trilho!.scrollLeft > 2);
    }

    atualizarSetas();

    trilho.addEventListener("scroll", atualizarSetas, {
      passive: true,
    });

    const observador = new ResizeObserver(atualizarSetas);
    observador.observe(trilho);

    window.addEventListener("resize", atualizarSetas);

    return () => {
      trilho.removeEventListener("scroll", atualizarSetas);
      observador.disconnect();
      window.removeEventListener("resize", atualizarSetas);
    };
  }, []);

  function mover(direcao: number) {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    trilho.scrollBy({
      left: direcao * trilho.clientWidth * 0.75,
      behavior: "smooth",
    });
  }

  return (
    <div className="group/carrossel relative min-w-0">
      {podeVoltar && (
        <button
          type="button"
          aria-label="Voltar músicas"
          onClick={() => mover(-1)}
          className="absolute left-1 top-[calc(50%-8px)] cursor-pointer z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#354052] bg-[#111420]/95 text-white shadow-lg hover:bg-[#273349] group-hover/carrossel:flex"
        >
          <CaretLeftIcon size={20} weight="bold" />
        </button>
      )}

      <div
        ref={trilhoRef}
        className="flex min-w-0 gap-8 overflow-x-auto scroll-smooth px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {podeAvancar && (
        <button
          type="button"
          aria-label="Avançar músicas"
          onClick={() => mover(1)}
          className="absolute right-1 top-[calc(50%-8px)] cursor-pointer z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#354052] bg-[#111420]/95 text-white shadow-lg hover:bg-[#273349] group-hover/carrossel:flex"
        >
          <CaretRightIcon size={20} weight="bold" />
        </button>
      )}
    </div>
  );
}


function EstrelaNota({
  estrela,
  nota,
  onClick,
}: {
  estrela: number;
  nota: number;
  onClick: (valor: number) => void;
}) {
  const preenchimento =
    nota >= estrela ? 100 : nota >= estrela - 0.5 ? 50 : 0;

  return (
    <div className="relative h-[30px] w-[30px]">
      <StarIcon
        size={30}
        weight="regular"
        className="absolute inset-0 text-[#52627c]"
      />

      {preenchimento > 0 && (
        <div
          className="absolute left-0 top-0 h-[30px] overflow-hidden"
          style={{ width: `${preenchimento}%` }}
        >
          <StarIcon
            size={30}
            weight="fill"
            className="absolute left-0 top-0 text-[#5ba4e8]"
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => onClick(estrela - 0.5)}
        className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
        aria-label={`Dar nota ${estrela - 0.5}`}
      />

      <button
        type="button"
        onClick={() => onClick(estrela)}
        className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
        aria-label={`Dar nota ${estrela}`}
      />
    </div>
  );
}

export default function CriarPost() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [busca, setBusca] = useState("");
  const [musicaSelecionada, setMusicaSelecionada] =
    useState<Musica | null>(null);
  const [usuario, setUsuario] = useState<MeuPerfil | null>(null);
  const [generosFavoritos, setGenerosFavoritos] = useState<string[]>([]);
  const [artistasFavoritos, setArtistasFavoritos] = useState<
    { artistaId: number }[]
  >([]);

  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [carregandoMusicas, setCarregandoMusicas] = useState(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const musicaId = searchParams.get("musica");

  useEffect(() => {
    let ativo = true;

    async function carregarPreferencias() {
      try {
        if (!localStorage.getItem("token")) return;

        const [generos, artistas] = await Promise.all([
          buscarGenerosFavoritos(),
          apiRequest<{ artistaId: number }[]>("/usuarios/me/artistas"),
        ]);

        if (!ativo) return;

        setGenerosFavoritos(generos);
        setArtistasFavoritos(artistas);
      } catch (error) {
        console.error("Erro ao carregar preferências musicais:", error);
      }
    }

    carregarPreferencias();

    return () => {
      ativo = false;
    };
  }, []);
  // Carregar músicas e selecionar a indicada na URL.
  useEffect(() => {
    let ativo = true;

    async function carregarMusicas() {
      try {
        setCarregandoMusicas(true);

        const dados = await buscarMusicas();

        if (!ativo) return;

        setMusicas(dados);

        if (musicaId) {
          const musica = dados.find(
            (item) => item.id === Number(musicaId),
          );

          if (musica) {
            setMusicaSelecionada(musica);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar músicas:", error);

        if (ativo) {
          toast.error("Não foi possível carregar as músicas.");
        }
      } finally {
        if (ativo) {
          setCarregandoMusicas(false);
        }
      }
    }

    carregarMusicas();

    return () => {
      ativo = false;
    };
  }, [musicaId]);

  // Buscar os dados do usuário logado para mostrar a foto correta.
  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      try {
        const perfil = await buscarMeuPerfil();

        if (ativo) {
          setUsuario(perfil);
        }
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, []);

  // Filtrar músicas por título ou artista.
  const musicasFiltradas = musicas.filter((musica) => {
    const termo = busca.trim().toLowerCase();
    const artista = musica.artista?.nome ?? "";

    return (
      musica.titulo.toLowerCase().includes(termo) ||
      artista.toLowerCase().includes(termo)
    );
  });

  function selecionarMusica(musica: Musica) {
    setMusicaSelecionada(musica);
    setNota(0);
  }

  // Publicar avaliação usando o serviço centralizado.
  async function publicarAvaliacao() {
    if (publicando) return;

    if (!musicaSelecionada) {
      toast.error("Escolha uma música.");
      return;
    }

    if (nota === 0) {
      toast.error("Escolha uma nota.");
      return;
    }

    if (!texto.trim()) {
      toast.error("Escreva algo sobre a música.");
      return;
    }

    try {
      setPublicando(true);

      await criarPost({
        musicaId: musicaSelecionada.id,
        nota,
        texto: texto.trim(),
      });

      toast.success("Avaliação publicada com sucesso!");
      navigate("/home");
    } catch (error) {
      console.error("Erro ao criar avaliação:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar a avaliação.",
      );
    } finally {
      setPublicando(false);
    }
  }

  const { musicasRecomendadas } = useMusicasRecomendadas(
    musicas,
    generosFavoritos,
    artistasFavoritos
  );

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0">
            <SearchBar />

            <h1 className="mt-5 font-serif text-[26px] text-white">
              Criar avaliação
            </h1>

            {/* Músicas recomendadas com base nas preferências */}
            <section className="mt-5">
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Músicas recomendadas
              </h2>

              {carregandoMusicas ? (
                <p className="py-3 text-[12px] text-[#697386]">
                  Carregando músicas...
                </p>
              ) : musicasRecomendadas.length === 0 ? (
                <p className="py-3 text-[12px] text-[#697386]">
                  Nenhuma recomendação encontrada para suas preferências.
                </p>
              ) : (
                <div className="flex gap-3 overflow-x-hidden pb-3">

                  {musicasRecomendadas.length > 0 && (
                    <CarrosselRecomendadas>
                      {musicasRecomendadas.slice(0, 8).map((musica) => (
                        <button
                          type="button"
                          key={musica.id}
                          onClick={() => selecionarMusica(musica)}
                          aria-pressed={musicaSelecionada?.id === musica.id}
                          className={`w-[160px] shrink-0 snap-start rounded-lg text-left transition ${musicaSelecionada?.id === musica.id
                              ? "ring-2 ring-[#5ba4e8]"
                              : "hover:opacity-80"
                            }`}
                        >
                          <MusicCard
                            tipo="quadrado"
                            larguraFixa
                            titulo={musica.titulo}
                            artista={musica.artista?.nome ?? "Artista desconhecido"}
                            capa={musica.capa}
                          />
                        </button>
                      ))}
                    </CarrosselRecomendadas>
                  )}

                </div>
              )}
            </section>

            {/* Busca de músicas */}
            <section className="mt-5">
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Escolha uma música
              </h2>

              <div className="flex h-[40px] w-full items-center gap-2 rounded-lg border border-[#273349] bg-[#111722] px-3 transition focus-within:border-[#5ba4e8]">
                <MagnifyingGlassIcon
                  size={18}
                  className="text-[#66748b]"
                />

                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar música ou artista..."
                  className="w-full bg-transparent text-[12px] text-white outline-none placeholder:text-[#697386]"
                />
              </div>

              {busca.trim() && (
                <div className="mt-3 flex flex-col gap-2">
                  {musicasFiltradas.map((musica) => (
                    <button
                      type="button"
                      key={musica.id}
                      onClick={() => {
                        selecionarMusica(musica);
                        setBusca("");
                      }}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-[#273349] bg-[#111722] p-2 text-left transition hover:border-[#5ba4e8]"
                    >
                      <img
                        src={musica.capa || "/logo.png"}
                        alt={musica.titulo}
                        className="h-10 w-10 rounded object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-[12px] text-white">
                          {musica.titulo}
                        </p>

                        <p className="truncate text-[10px] text-[#697386]">
                          {musica.artista?.nome ?? "Artista desconhecido"}
                        </p>
                      </div>
                    </button>
                  ))}

                  {musicasFiltradas.length === 0 && (
                    <p className="py-3 text-center text-[12px] text-[#697386]">
                      Nenhuma música encontrada.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Música selecionada */}
            {musicaSelecionada && (
              <section className="mt-5">
                <h2 className="mb-2 font-serif text-[18px] text-white">
                  Música selecionada
                </h2>

                <div className="flex items-center gap-3 rounded-lg border border-[#273349] bg-[#111722] p-3">
                  <img
                    src={musicaSelecionada.capa || "/logo.png"}
                    alt={musicaSelecionada.titulo}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-white">
                      {musicaSelecionada.titulo}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-[#697386]">
                      {musicaSelecionada.artista?.nome ??
                        "Artista desconhecido"}
                    </p>

                    <div className="mt-2 flex items-center gap-1">
                      <StarIcon
                        size={14}
                        weight="fill"
                        className="text-[#5ba4e8]"
                      />

                      <span className="text-[11px] text-[#b5bbc5]">
                        {(musicaSelecionada.nota ?? 0) > 0
                          ? musicaSelecionada.nota!.toFixed(1)
                          : "Sem avaliações"}
                      </span>

                      <span className="text-[10px] text-[#697386]">
                        (
                        {musicaSelecionada.avaliacoes ??
                          musicaSelecionada._count?.posts ??
                          0}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <OuvirCard spotifyURL={musicaSelecionada?.spotifyUrl} />

            {/* Formulário para telas menores que xl */}
            <section className="mt-6 xl:hidden">
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Sua nota
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <EstrelaNota
                      key={estrela}
                      estrela={estrela}
                      nota={nota}
                      onClick={setNota}
                    />
                  ))}
                </div>

                <span className="text-[20px] text-[#b5bbc5]">
                  {nota.toFixed(1)}
                </span>
              </div>

              <h2 className="mb-2 mt-4 font-serif text-[18px] text-white">
                Escreva sobre essa música
              </h2>

              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva algo sobre a música..."
                maxLength={2000}
                className="h-[115px] w-full resize-none rounded-lg border border-[#273349] bg-[#0c1017] p-3 text-[12px] text-white outline-none transition placeholder:text-[#697386] focus:border-[#5ba4e8]"
              />

              <button
                type="button"
                onClick={publicarAvaliacao}
                disabled={publicando}
                className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#5ba4e8] text-[14px] font-serif text-white transition hover:bg-[#6bb0ef] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusIcon size={14} weight="bold" />
                {publicando ? "Publicando..." : "Publicar avaliação"}
              </button>
            </section>
          </main>

          {/* Nota, texto e prévia para telas grandes */}
          <aside className="hidden xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Sua nota
              </h2>

              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((estrela) => (
                    <EstrelaNota
                      key={estrela}
                      estrela={estrela}
                      nota={nota}
                      onClick={setNota}
                    />
                  ))}
                </div>

                <span className="text-[24px] text-[#52627c]">
                  {nota.toFixed(1)}
                </span>
              </div>

              <h2 className="mb-2 mt-4 font-serif text-[18px] text-white">
                Escreva sobre essa música
              </h2>

              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva algo sobre a música..."
                maxLength={2000}
                className="h-[115px] w-full resize-none rounded-lg border border-[#273349] bg-[#0c1017] p-3 text-[11px] text-white outline-none transition placeholder:text-[#697386] focus:border-[#5ba4e8]"
              />

              <h2 className="mb-2 mt-4 font-serif text-[18px] text-white">
                Prévia da avaliação
              </h2>

              <div className="rounded-lg border border-[#273349] bg-[#0c1017] p-3">
                <div className="flex items-center gap-2">
                  <img
                    src={usuario?.foto || "/logo.png"}
                    alt={usuario?.nome ?? "Foto do perfil"}
                    className="h-8 w-8 rounded-full object-cover"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-[12px] text-white">
                      {usuario?.nome ?? "Você"}
                    </p>

                    <p className="text-[10px] text-[#697386]">
                      Avaliação
                    </p>
                  </div>
                </div>

                <p className="mt-4 whitespace-pre-wrap break-words text-[12px] leading-4 text-[#b5bbc5]">
                  {texto || "Escreva algo sobre a música..."}
                </p>

                {musicaSelecionada && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#273349] bg-[#111722] p-2">
                    <img
                      src={musicaSelecionada.capa || "/logo.png"}
                      alt={musicaSelecionada.titulo}
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-white">
                        {musicaSelecionada.titulo}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-[#697386]">
                        {musicaSelecionada.artista?.nome ??
                          "Artista desconhecido"}
                      </p>

                      <div className="mt-2 flex items-center gap-1">
                        <StarIcon
                          size={13}
                          weight="fill"
                          className="text-[#5ba4e8]"
                        />

                        <span className="text-[11px] text-white">
                          {nota > 0 ? nota.toFixed(1) : "Sem nota"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={publicarAvaliacao}
                disabled={publicando}
                className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#5ba4e8] text-[14px] font-serif text-white transition hover:bg-[#6bb0ef] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <PlusIcon size={14} weight="bold" />
                {publicando ? "Publicando..." : "Publicar avaliação"}
              </button>
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}