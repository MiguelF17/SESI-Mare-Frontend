import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import MusicCard from "../components/musicCard";
import { API_URL } from "../api";

import {
  TrendUpIcon,
  StarIcon,
  SparkleIcon,
  MusicNotesIcon,
  CaretLeftIcon,
  CaretRightIcon,
} from "@phosphor-icons/react";

type Musica = {
  id: number;
  titulo: string;
  artista?: {
    id?: number;
    nome: string;
  };
  artistaId?: number;
  capa?: string | null;
  nota?: number;
  avaliacoes?: number;
  duracaoSegundos?: number;
  quantidadePosts?: number;
};

function Carrossel({
  children,
}: {
  children: ReactNode;
}) {
  const trilhoRef = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);

  function atualizarSetas() {
    const trilho = trilhoRef.current;

    if (!trilho) return;

    const maxScroll = trilho.scrollWidth - trilho.clientWidth;

    setPodeVoltar(trilho.scrollLeft > 2);
    setPodeAvancar(maxScroll - trilho.scrollLeft > 2);
  }

  useEffect(() => {
    const trilho = trilhoRef.current;

    if (!trilho) return;

    atualizarSetas();

    trilho.addEventListener("scroll", atualizarSetas, {
      passive: true,
    });

    const observador = new ResizeObserver(atualizarSetas);
    observador.observe(trilho);

    return () => {
      trilho.removeEventListener("scroll", atualizarSetas);
      observador.disconnect();
    };
  }, [children]);

  function mover(direcao: number) {
    const trilho = trilhoRef.current;

    if (!trilho) return;

    trilho.scrollBy({
      left: direcao * trilho.clientWidth * 0.75,
      behavior: "smooth",
    });
  }

  return (
    <div className="group/carrossel relative">
      {podeVoltar && (
        <button
          type="button"
          aria-label="Voltar músicas"
          onClick={() => mover(-1)}
          className="absolute cursor-pointer -left-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#354052] bg-[#111420]/95 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#273349] group-hover/carrossel:flex"
        >
          <CaretLeftIcon size={20} weight="bold" />
        </button>
      )}

      <div
        ref={trilhoRef}
        className="flex snap-x snap-proximity gap-4 overflow-x-auto scroll-smooth pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {podeAvancar && (
        <button
          type="button"
          aria-label="Avançar músicas"
          onClick={() => mover(1)}
          className="absolute cursor-pointer -right-4 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#354052] bg-[#111420]/95 text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-[#273349] group-hover/carrossel:flex"
        >
          <CaretRightIcon size={20} weight="bold" />
        </button>
      )}
    </div>
  );
}


export default function Explorar() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);


  useEffect(() => {
    let ativo = true;

    async function buscarDados() {
      try {
        const [respostaMusicas, respostaPosts] = await Promise.all([
          fetch(`${API_URL}/musicas`),
          fetch(`${API_URL}/posts`),
        ]);

        if (!respostaMusicas.ok) {
          throw new Error("Erro ao buscar músicas");
        }

        const dadosMusicas = await respostaMusicas.json();

        // Os posts são complementares: se falharem, o catálogo ainda funciona.
        let dadosPosts: any[] = [];

        if (respostaPosts.ok) {
          const resultadoPosts = await respostaPosts.json();

          if (Array.isArray(resultadoPosts)) {
            dadosPosts = resultadoPosts;
          }
        }

        const quantidadePosts = new Map<number, number>();

        dadosPosts.forEach((post: any) => {
          const musicaId = post.musica?.id ?? post.musicaId;

          if (musicaId != null) {
            quantidadePosts.set(
              Number(musicaId),
              (quantidadePosts.get(Number(musicaId)) ?? 0) + 1
            );
          }
        });

        const catalogoComPosts = (
          Array.isArray(dadosMusicas) ? dadosMusicas : []
        ).map((musica: Musica) => ({
          ...musica,
          quantidadePosts: quantidadePosts.get(musica.id) ?? 0,
        }));

        if (ativo) {
          setMusicas(catalogoComPosts);
        }
      } catch (erro) {
        console.error("Erro ao buscar dados:", erro);

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


  // Evita duplicatas caso a API retorne alguma música repetida.
  const catalogo = useMemo(() => {
    const unicas = new Map<number, Musica>();

    musicas.forEach((musica) => {
      unicas.set(musica.id, musica);
    });

    return Array.from(unicas.values());
  }, [musicas]);



  // Em alta: músicas que aparecem em mais posts.
  const musicasEmAlta = [...catalogo]
    .sort(
      (a, b) =>
        (b.quantidadePosts ?? 0) - (a.quantidadePosts ?? 0)
    )
    .slice(0, 8);

  // Mais bem avaliadas: classificação independente.
  const musicasMaisBemAvaliadas = [...catalogo]
    .filter((musica) => (musica.avaliacoes ?? 0) > 0)
    .sort((a, b) => {
      const diferenca = (b.nota ?? 0) - (a.nota ?? 0);

      if (diferenca !== 0) return diferenca;

      return (b.avaliacoes ?? 0) - (a.avaliacoes ?? 0);
    })
    .slice(0, 8);

  // Descubra: prioriza músicas que ainda não apareceram em "Em alta".
  // Se não houver músicas suficientes, usa o catálogo completo.
  const idsEmAlta = new Set(
    musicasEmAlta.map((musica) => musica.id)
  );

  const musicasRestantes = catalogo.filter(
    (musica) => !idsEmAlta.has(musica.id)
  );

  const musicasRecomendadas = (
    musicasRestantes.length > 0 ? musicasRestantes : catalogo
  ).slice(0, 8);


  function renderizarCard(musica: Musica, tipo: "banner" | "quadrado") {
    return (
      <div
        key={musica.id}
        className="shrink-0 snap-start"
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
    lista: Musica[],
    tipo: "banner" | "quadrado"
  ) {
    return (
      <section className="mb-12 min-w-0">
        <div className="mb-5 flex items-center gap-2">
          {icone}

          <h2 className="font-serif text-[17px] text-white">
            {titulo}
          </h2>

          <span className="ml-1 text-xs text-[#697386]">
            {lista.length}
          </span>
        </div>

        {lista.length > 0 ? (
          <Carrossel>
            {lista.map((musica) => renderizarCard(musica, tipo))}
          </Carrossel>
        ) : (
          <p className="py-4 text-sm text-[#697386]">
            {carregando
              ? "Carregando músicas..."
              : "Ainda não há músicas nesta seção."}
          </p>
        )}
      </section>
    );
  }

  return (
    <PageLayout>
      <PageContent>
        {/* BUSCA */}
        <div className="sticky top-0 z-20 bg-[#080A10]">
          <div className="w-full pb-6 md:w-[65%]">
            <SearchBar />
          </div>
        </div>

        {/* TÍTULO */}
        <div className="mb-10">
          <h1 className="font-serif text-[26px] text-gray-100">
            Explorar
          </h1>

          <p className="mt-1 font-serif text-[13px] text-[#697386]">
            Descubra novas músicas, artistas e posts.
          </p>
        </div>

        {erro && (
          <p className="mb-8 text-sm text-red-400">
            Não foi possível carregar as músicas. Tente atualizar a página.
          </p>
        )}

        {renderizarSecao(
          "Em alta",
          <TrendUpIcon size={18} className="text-[#58A9E8]" />,
          musicasEmAlta,
          "banner"
        )}

        {renderizarSecao(
          "Mais bem avaliadas",
          <StarIcon size={18} className="text-[#58A9E8]" />,
          musicasMaisBemAvaliadas,
          "quadrado"
        )}

        {renderizarSecao(
          "Descubra novas músicas",
          <SparkleIcon size={18} className="text-[#58A9E8]" />,
          musicasRecomendadas,
          "quadrado"
        )}

        {/* CATÁLOGO COMPLETO */}
        <section className="mb-12">
          <div className="mb-5 flex items-center gap-2">
            <MusicNotesIcon size={18} className="text-[#58A9E8]" />

            <h2 className="font-serif text-[17px] text-white">
              Todas as músicas
            </h2>

            <span className="ml-1 text-xs text-[#697386]">
              {catalogo.length}
            </span>
          </div>

          {carregando ? (
            <p className="py-6 text-sm text-[#697386]">
              Carregando catálogo...
            </p>
          ) : catalogo.length === 0 ? (
            <p className="py-6 text-sm text-[#697386]">
              Nenhuma música encontrada.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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