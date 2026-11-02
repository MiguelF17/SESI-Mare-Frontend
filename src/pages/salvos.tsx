
import { useEffect, useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import MusicCard from "../components/musicCard";

import { apiRequest } from "../api";
import type { Musica } from "../services/musicaService";
import RecommendedMusicList from "../components/recommendedMusicList";

interface MusicaSalva {
  musica: Musica & {
    _count?: {
      posts?: number;
    };
  };
}

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export default function Salvos() {
  const [musicas, setMusicas] = useState<MusicaSalva[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [pesquisa, setPesquisa] = useState("");
  

  useEffect(() => {
    async function buscarDados() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setMusicas([]);
          return;
        }

        const dadosSalvos = await apiRequest<unknown>("/usuarios/me/salvos");

        if (!Array.isArray(dadosSalvos)) {
          throw new Error("A API retornou uma lista de músicas salvas inválida.");
        }

        setMusicas(dadosSalvos as MusicaSalva[]);
      } catch (error) {
        console.error("Erro ao buscar músicas salvas:", error);
      } finally {
        setCarregando(false);
      }
    }

    buscarDados();
  }, []);

  function removerMusicaSalva(musicaId: number) {
    setMusicas((atuais) =>
      atuais.filter((salvamento) => salvamento.musica.id !== musicaId)
    );
  }

  const consulta = normalizar(pesquisa.trim());
  const musicasFiltradas = musicas.filter(({ musica }) =>
    [musica.titulo, musica.artista?.nome, musica.genero]
      .some((campo) => normalizar(campo ?? "").includes(consulta))
  );

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col">
            <div className="sticky search-header -mt-2.5 top-[calc(50px+env(safe-area-inset-top))] z-20 md:top-0 md:mt-0 bg-[var(--cor-fundo)]/80 backdrop-blur-md">
              <div className="w-full pb-0 md:pb-6">
              </div>
            </div>

            <div className="mb-6 mt-4">
              <h1 className="font-serif text-[26px] text-[var(--cor-texto-cinza-100)]">
                Músicas salvas
              </h1>

              <p className="mt-1 font-serif text-[13px] text-[var(--cor-texto-discreto)]">
                Músicas que você não quer deixar passar.
              </p>
            </div>

            {musicas.length > 0 && (
              <label className="mb-4 flex items-center gap-3 rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-superficie-alternativa)] px-4">
                <MagnifyingGlassIcon size={18} className="shrink-0 text-[#8495A9]" aria-hidden="true" />
                <input
                  type="search"
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  placeholder="Buscar nas músicas salvas..."
                  aria-label="Buscar nas músicas salvas"
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[var(--cor-texto-principal)] outline-none placeholder:text-[#738196]"
                />
              </label>
            )}

            <section className="flex flex-col gap-4">
              {carregando ? (
                <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                  Carregando músicas...
                </p>
              ) : musicas.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                  Você ainda não salvou nenhuma música.
                </p>
              ) : musicasFiltradas.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                  Nenhuma música salva corresponde à sua busca.
                </p>
              ) : (
                musicasFiltradas.map((salvamento) => {
                  const musica = salvamento.musica;

                  return (
                    <MusicCard
                      key={musica.id}
                      id={musica.id}
                      tipo="post"
                      titulo={musica.titulo}
                      artista={musica.artista?.nome}
                      artistaId={musica.artista?.id}
                      capa={musica.capa}
                      nota={musica.nota}
                      avaliacoes={
                        musica.avaliacoes ?? musica._count?.posts ?? 0
                      }
                      duracaoSegundos={musica.duracaoSegundos}
                      onRemover={() => removerMusicaSalva(musica.id)}
                    />
                  );
                })
              )}
            </section>
          </div>

          <aside className="hidden xl:block">
            <div className="fixed top-20 w-[340px]">
              <h2 className="mb-5 font-serif text-[16px] text-[var(--cor-texto-principal)]">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                    <RecommendedMusicList
                    />
              </div>
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}
