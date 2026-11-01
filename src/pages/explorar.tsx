
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type PointerEvent,
} from "react";

import { UserCircleIcon } from "@phosphor-icons/react";
import {
  TrendUpIcon,
  StarIcon,
  SparkleIcon,
  MusicNotesIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import MusicCard from "../components/musicCard";

import { apiRequest } from "../api";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { buscarPosts } from "../services/postService";
import { buscarArtistas, type Artista } from "../services/artistaService";
import { buscarGenerosFavoritos } from "../services/usuarioService";
import { useMusicasRecomendadas } from "../hooks/useMusicasRecomendadas";
import { useNavigate } from "react-router-dom";

type MusicaExplorar = Musica & {
  artistaId?: number;
  quantidadePosts?: number;
};

interface ArtistaFavorito {
  artistaId: number;
}


function Carrossel({ children }: { children: ReactNode }) {
  const trilhoRef = useRef<HTMLDivElement>(null);

  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  const inicioX = useRef(0);
  const scrollInicial = useRef(0);
  const arrastou = useRef(false);

  useEffect(() => {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    const atualizarSetas = () => {
      const maxScroll = trilho.scrollWidth - trilho.clientWidth;

      setPodeVoltar(trilho.scrollLeft > 2);
      setPodeAvancar(maxScroll - trilho.scrollLeft > 2);
    };

    atualizarSetas();

    trilho.addEventListener("scroll", atualizarSetas, {
      passive: true,
    });

    const observador = new ResizeObserver(atualizarSetas);
    observador.observe(trilho);

    window.addEventListener("resize", atualizarSetas);

    return () => {
      trilho.removeEventListener("scroll", atualizarSetas);
      window.removeEventListener("resize", atualizarSetas);
      observador.disconnect();
    };
  }, [children]);

  function iniciarArraste(e: PointerEvent<HTMLDivElement>) {
    // No toque, preserva a rolagem horizontal nativa do Safari/iOS.
    if (e.pointerType === "touch") return;
    // Arrasta apenas com o botão principal do mouse ou com toque.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    const trilho = trilhoRef.current;
    if (!trilho) return;

    inicioX.current = e.clientX;
    scrollInicial.current = trilho.scrollLeft;
    arrastou.current = false;

    setArrastando(true);

  }

  function moverArraste(e: PointerEvent<HTMLDivElement>) {
    const trilho = trilhoRef.current;
    if (!trilho || !arrastando) return;

    const distancia = e.clientX - inicioX.current;

    if (Math.abs(distancia) > 5 && !arrastou.current) {
      arrastou.current = true;
      if (!trilho.hasPointerCapture(e.pointerId)) {
        trilho.setPointerCapture(e.pointerId);
      }
    }

    if (arrastou.current) {
      trilho.scrollLeft = scrollInicial.current - distancia;
    }
  }

  function finalizarArraste(e: React.PointerEvent<HTMLDivElement>) {
    const trilho = trilhoRef.current;
    if (!trilho) return;

    if (trilho.hasPointerCapture(e.pointerId)) {
      trilho.releasePointerCapture(e.pointerId);
    }

    setArrastando(false);

    // Evita que o clique em um card aconteça depois de arrastá-lo.
    if (arrastou.current) {
      requestAnimationFrame(() => {
        arrastou.current = false;
      });
    }
  }

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
          aria-label="Voltar itens"
          onClick={() => mover(-1)}
          className="absolute -left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie)]/95 text-[var(--cor-texto-principal)] shadow-lg hover:bg-[var(--cor-superficie-borda)] group-hover/carrossel:flex"
        >
          <CaretLeftIcon size={20} weight="bold" />
        </button>
      )}

      <div
        ref={trilhoRef}
        onPointerDown={iniciarArraste}
        onPointerMove={moverArraste}
        onPointerUp={finalizarArraste}
        onPointerCancel={finalizarArraste}
        onClickCapture={(e) => {
          if (arrastou.current) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`flex min-w-0 gap-2 overflow-x-auto px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${arrastando
          ? "cursor-grabbing select-none"
          : "cursor-grab scroll-smooth"
          }`}
        style={{
          touchAction: "pan-x pan-y",
          scrollBehavior: arrastando ? "auto" : "smooth",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
        }}
      >
        {children}
      </div>

      {podeAvancar && (
        <button
          type="button"
          aria-label="Avançar itens"
          onClick={() => mover(1)}
          className="absolute -right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie)]/95 text-[var(--cor-texto-principal)] shadow-lg hover:bg-[var(--cor-superficie-borda)] group-hover/carrossel:flex"
        >
          <CaretRightIcon size={20} weight="bold" />
        </button>
      )}
    </div>
  );
}




export default function Explorar() {
  const navigate = useNavigate();
  const [musicas, setMusicas] = useState<MusicaExplorar[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [generosFavoritos, setGenerosFavoritos] = useState<string[]>([]);
  const [artistasFavoritos, setArtistasFavoritos] = useState<
    ArtistaFavorito[]
  >([]);

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  // Carrega catálogo, artistas e preferências.
  useEffect(() => {
    let ativo = true;

    async function buscarDados() {
      try {
        const token = localStorage.getItem("token");
        const [
          dadosMusicas,
          dadosArtistas,
          dadosPosts,
          resultadosFavoritos,
        ] = await Promise.all([
          buscarMusicas(),
          buscarArtistas(),
          buscarPosts().catch((erroPosts) => {
            console.error("Erro ao buscar posts:", erroPosts);
            return [] as Awaited<ReturnType<typeof buscarPosts>>;
          }),
          token
            ? Promise.allSettled([
                buscarGenerosFavoritos(),
                apiRequest<ArtistaFavorito[]>("/usuarios/me/artistas"),
              ])
            : Promise.resolve(null),
        ]);

        const quantidadePosts = new Map<number, number>();

        dadosPosts.forEach((post) => {
          const musicaId = post.musica?.id;

          if (musicaId != null) {
            quantidadePosts.set(
              musicaId,
              (quantidadePosts.get(musicaId) ?? 0) + 1
            );
          }
        });

        const catalogoComPosts: MusicaExplorar[] = dadosMusicas.map(
          (musica) => ({
            ...musica,
            quantidadePosts: quantidadePosts.get(musica.id) ?? 0,
          })
        );

        let generos: string[] = [];
        let artistasFav: ArtistaFavorito[] = [];

        if (resultadosFavoritos) {
          if (resultadosFavoritos[0].status === "fulfilled") {
            generos = resultadosFavoritos[0].value;
          } else {
            console.error(
              "Erro ao buscar gêneros favoritos:",
              resultadosFavoritos[0].reason
            );
          }

          if (resultadosFavoritos[1].status === "fulfilled") {
            artistasFav = resultadosFavoritos[1].value;
          } else {
            console.error(
              "Erro ao buscar artistas favoritos:",
              resultadosFavoritos[1].reason
            );
          }
        }

        if (!ativo) return;

        setMusicas(catalogoComPosts);
        setArtistas(dadosArtistas);
        setGenerosFavoritos(generos);
        setArtistasFavoritos(artistasFav);
        setErro(false);
      } catch (error) {
        console.error("Erro ao carregar Explorar:", error);

        if (ativo) {
          setErro(true);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    buscarDados();

    return () => {
      ativo = false;
    };
  }, []);

  // Remove músicas duplicadas.
  const catalogo = useMemo(() => {
    const unicas = new Map<number, MusicaExplorar>();

    musicas.forEach((musica) => {
      unicas.set(musica.id, musica);
    });

    return Array.from(unicas.values());
  }, [musicas]);

  // Em alta: músicas com mais publicações.
  const musicasEmAlta = useMemo(
    () =>
      [...catalogo]
        .sort(
          (a, b) =>
            (b.quantidadePosts ?? 0) - (a.quantidadePosts ?? 0) ||
            (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)
        )
        .slice(0, 8),
    [catalogo]
  );

  // Mais bem avaliadas: considera nota e número de avaliações.
  const musicasMaisBemAvaliadas = useMemo(
    () =>
      [...catalogo]
        .filter((musica) => (musica.avaliacoes ?? 0) > 0)
        .sort(
          (a, b) =>
            (b.nota ?? 0) - (a.nota ?? 0) ||
            (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0)
        )
        .slice(0, 8),
    [catalogo]
  );

  // Calcula recomendações a partir das preferências do usuário.
  const { musicasRecomendadas: musicasPorPreferencia } =
    useMusicasRecomendadas(
      catalogo,
      generosFavoritos,
      artistasFavoritos
    );

  // Evita repetir as músicas de "Em alta" quando houver alternativas.
  const musicasRecomendadas = useMemo(() => {
    const idsEmAlta = new Set(
      musicasEmAlta.map((musica) => musica.id)
    );

    const restantes = catalogo.filter(
      (musica) => !idsEmAlta.has(musica.id)
    );

    const idsRestantes = new Set(
      restantes.map((musica) => musica.id)
    );

    const personalizadas = musicasPorPreferencia.filter((musica) =>
      idsRestantes.has(musica.id)
    );

    // Prioriza as preferências, preenchendo vagas com outras músicas.
    const outrasMusicas = restantes.filter(
      (musica) =>
        !personalizadas.some((recomendada) => recomendada.id === musica.id)
    );

    const resultado = [...personalizadas, ...outrasMusicas];

    // Se o catálogo for pequeno, permite repetir músicas de "Em alta".
    if (resultado.length < 8) {
      const idsIncluidos = new Set(
        resultado.map((musica) => musica.id)
      );

      resultado.push(
        ...catalogo.filter((musica) => !idsIncluidos.has(musica.id))
      );
    }

    return resultado.slice(0, 8);
  }, [catalogo, musicasEmAlta, musicasPorPreferencia]);

  function renderizarCard(
    musica: MusicaExplorar,
    tipo: "banner" | "quadrado"
  ) {
    return (
      <div
        key={musica.id}
        className="shrink-0 snap-start px-1 py-1 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
      >
        <MusicCard
          id={musica.id}
          tipo={tipo}
          larguraFixa={tipo === "quadrado"}
          titulo={musica.titulo}
          artista={musica.artista?.nome ?? "Artista desconhecido"}
          artistaId={musica.artista?.id ?? musica.artistaId}
          capa={musica.capa}
          nota={musica.nota}
          avaliacoes={musica.avaliacoes}
          duracaoSegundos={musica.duracaoSegundos}
        />
      </div>
    );
  }

  function renderizarSecao(
    titulo: string,
    icone: ReactNode,
    lista: MusicaExplorar[],
    tipo: "banner" | "quadrado"
  ) {
    return (
      <section className="mb-8 min-w-0">
        <div className="mb-4 flex items-center gap-2">
          {icone}
          <h2 className="font-serif text-[17px] text-[var(--cor-texto-principal)]">
            {titulo}
          </h2>
        </div>

        {lista.length > 0 ? (
          <Carrossel>
            {lista.map((musica) => renderizarCard(musica, tipo))}
          </Carrossel>
        ) : (
          <p className="py-4 text-sm text-[var(--cor-texto-discreto)]">
            {carregando
              ? "Carregando músicas..."
              : "Ainda não há músicas nesta seção."}
          </p>
        )}
      </section>
    );
  }

  function renderizarArtistas() {
    return (
      <section className="mb-8 min-w-0">
        <div className="mb-4 flex items-center gap-2">
          <UserCircleIcon size={20} className="text-[var(--cor-destaque-alternativo)]" />
          <h2 className="font-serif text-[17px] text-[var(--cor-texto-principal)]">
            Artistas
          </h2>
        </div>

        {artistas.length === 0 ? (
          <p className="py-4 text-sm text-[var(--cor-texto-discreto)]">
            {carregando
              ? "Carregando artistas..."
              : "Nenhum artista encontrado."}
          </p>
        ) : (
          <Carrossel>

            {artistas.map((artista) => (
              <button
                key={artista.id}
                type="button"
                onClick={() => navigate(`/artista/${artista.id}`)}
                aria-label={`Ver perfil de ${artista.nome}`}
                className="w-32 shrink-0 snap-start rounded-xl px-1 py-2 text-left transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58A9E8] sm:w-36"
              >
                <div className="flex cursor-pointer flex-col items-center">
                  <div className="mb-3 flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[var(--cor-superficie-elevada)] sm:h-36 sm:w-36">
                    {artista.fotoURL ? (
                      <img
                        src={artista.fotoURL}
                        alt={artista.nome}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
                        draggable={false}
                      />
                    ) : (
                      <UserCircleIcon
                        size={48}
                        className="text-[var(--cor-texto-discreto)]"
                      />
                    )}
                  </div>

                  <h3 className="w-full truncate text-center text-sm font-medium text-[var(--cor-texto-principal)]">
                    {artista.nome}
                  </h3>

                  <p className="mt-1 text-xs text-[var(--cor-texto-discreto)]">
                    Artista
                  </p>
                </div>
              </button>
            ))}

          </Carrossel>
        )}
      </section>
    );
  }

  return (
    <PageLayout>
      <PageContent>
        <div className="sticky search-header -mt-2.5 top-[calc(50px+env(safe-area-inset-top))] z-20 md:top-0 md:mt-0 bg-[var(--cor-fundo)]/80 backdrop-blur-md">
          <div className="w-full pb-0 md:w-[65%] md:pb-6">
          </div>
        </div>

        <div className="mb-8">
          <h1 className="font-serif text-[26px] text-[var(--cor-texto-cinza-100)]">
            Explorar
          </h1>

          <p className="mt-1 font-serif text-[13px] text-[var(--cor-texto-discreto)]">
            Descubra novas músicas, artistas e posts.
          </p>
        </div>

        {erro && (
          <p className="mb-8 text-sm text-red-400">
            Não foi possível carregar o catálogo. Tente atualizar a página.
          </p>
        )}

        {renderizarArtistas()}

        {renderizarSecao(
          "Em alta",
          <TrendUpIcon size={18} className="text-[var(--cor-destaque-alternativo)]" />,
          musicasEmAlta,
          "banner"
        )}

        {renderizarSecao(
          "Mais bem avaliadas",
          <StarIcon size={18} className="text-[var(--cor-destaque-alternativo)]" />,
          musicasMaisBemAvaliadas,
          "quadrado"
        )}

        {renderizarSecao(
          "Descubra novas músicas",
          <SparkleIcon size={18} className="text-[var(--cor-destaque-alternativo)]" />,
          musicasRecomendadas,
          "quadrado"
        )}

        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <MusicNotesIcon size={18} className="text-[var(--cor-destaque-alternativo)]" />

            <h2 className="font-serif text-[17px] text-[var(--cor-texto-principal)]">
              Todas as músicas
            </h2>

            <span className="ml-1 text-xs text-[var(--cor-texto-discreto)]">
              {catalogo.length}
            </span>
          </div>

          {carregando ? (
            <p className="py-6 text-sm text-[var(--cor-texto-discreto)]">
              Carregando catálogo...
            </p>
          ) : catalogo.length === 0 ? (
            <p className="py-6 text-sm text-[var(--cor-texto-discreto)]">
              Nenhuma música encontrada.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
              {catalogo.map((musica) => (
                <MusicCard
                  key={musica.id}
                  id={musica.id}
                  tipo="quadrado"
                  titulo={musica.titulo}
                  artista={musica.artista?.nome ?? "Artista desconhecido"}
                  artistaId={musica.artista?.id ?? musica.artistaId}
                  capa={musica.capa}
                  nota={musica.nota}
                  avaliacoes={musica.avaliacoes}
                  duracaoSegundos={musica.duracaoSegundos}
                />
              ))}
            </div>
          )}
        </section>
      </PageContent>
    </PageLayout>
  );
}
