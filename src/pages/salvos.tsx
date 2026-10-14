import { useEffect, useState } from "react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import MusicCard from "../components/musicCard";
import RecommendedMusic from "../components/recommendedMusic";
import { API_URL } from "../api";

export default function Salvos() {
  const [musicas, setMusicas] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [recomendadas, setRecomendadas] = useState<any[]>([]);

  useEffect(() => {
    async function buscarDados() {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          return;
        }

        const [respostaSalvos, respostaMusicas] = await Promise.all([
          fetch(`${API_URL}/usuarios/me/salvos`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`${API_URL}/musicas`),
        ]);

        if (!respostaSalvos.ok || !respostaMusicas.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const dadosSalvos = await respostaSalvos.json();
        const dadosMusicas = await respostaMusicas.json();

        setMusicas(dadosSalvos);
        setRecomendadas(dadosMusicas);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setCarregando(false);
      }
    }

    buscarDados();
  }, []);

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col">

            <div className="sticky top-0 z-20 bg-[#080A10]">
              <div className="w-full pb-6">
                <SearchBar />
              </div>
            </div>

            <div className="mb-6">
              <h1 className="font-serif text-[26px] text-gray-100">
                Músicas salvas
              </h1>

              <p className="mt-1 font-serif text-[13px] text-[#697386]">
                Músicas que você não quer deixar passar.
              </p>
            </div>

            <section className="flex flex-col gap-4">

              {carregando ? (
                <p className="py-8 text-center text-[14px] text-[#697386]">
                  Carregando músicas...
                </p>
              ) : musicas.length === 0 ? (
                <p className="py-8 text-center text-[14px] text-[#697386]">
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
                      artistaId={musica?.artista?.id}
                      capa={musica.capa}
                      nota={musica.nota}
                      avaliacoes={musica._count?.posts ?? 0}
                      duracaoSegundos={musica.duracaoSegundos}
                      onRemover={() => {
                        setMusicas((atuais) =>
                          atuais.filter((salvamento) => salvamento.musica?.id !== musica.id)
                        );
                      }}
                    />
                  );
                })
              )}

            </section>
          </div>

          <aside className="hidden xl:block">
            <div className="fixed top-2/5 -translate-y-2/5 w-[340px]">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                {recomendadas.length > 0 ? (
                  recomendadas.slice(0, 5).map((musica) => (
                    <RecommendedMusic
                      id={musica.id}
                      key={musica.id}
                      titulo={musica.titulo}
                      artist={musica.artista?.nome}
                      capa={musica.capa}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-[14px] text-[#697386]">
                    Nenhuma música recomendada.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}