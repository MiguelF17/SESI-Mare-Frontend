
import { useEffect, useState } from "react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
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

export default function Salvos() {
  const [musicas, setMusicas] = useState<MusicaSalva[]>([]);
  const [carregando, setCarregando] = useState(true);
  

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

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col">
            <div className="sticky top-[calc(40px+env(safe-area-inset-top))] z-20 md:top-0 bg-[var(--cor-fundo)]">
              <div className="w-full pb-6">
                <SearchBar />
              </div>
            </div>

            <div className="mb-6">
              <h1 className="font-serif text-[26px] text-[var(--cor-texto-cinza-100)]">
                Músicas salvas
              </h1>

              <p className="mt-1 font-serif text-[13px] text-[var(--cor-texto-discreto)]">
                Músicas que você não quer deixar passar.
              </p>
            </div>

            <section className="flex flex-col gap-4">
              {carregando ? (
                <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                  Carregando músicas...
                </p>
              ) : musicas.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                  Você ainda não salvou nenhuma música.
                </p>
              ) : (
                musicas.map((salvamento) => {
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
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
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
