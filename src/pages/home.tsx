
import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import RecommendedMusic from "../components/recommendedMusic";
import FeedTabs from "../components/feedTabs";

import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { useHomeFeed } from "../hooks/useHomeFeed";
import { useMusicasRecomendadas } from "../hooks/useMusicasRecomendadas";

export default function Home() {
  const {
    posts,
    musicas,
    generosFavoritos,
    carregando,
    erro,
  } = useHomeFeed();

  const { musicasRecomendadas } = useMusicasRecomendadas(
    musicas,
    generosFavoritos
  );

  const [abaAtiva, setAbaAtiva] = useState<
    "paraVoce" | "seguindo"
  >("paraVoce");

  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function buscarUsuarioLogado() {
      try {
        const usuario = await apiRequest<{ id: number }>("/usuarios/me");
        setUsuarioLogadoId(usuario.id);
      } catch (error) {
        console.error("Erro ao buscar usuário logado:", error);
      }
    }

    if (localStorage.getItem("token")) {
      buscarUsuarioLogado();
    }
  }, []);

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="min-w-0">
            <div className="sticky top-0 z-20 bg-[#080A10]">
              <div className="pt-6">
                <SearchBar />
              </div>

              <div className="flex justify-center pb-2 pt-4">
                <FeedTabs
                  abaAtiva={abaAtiva}
                  setAbaAtiva={setAbaAtiva}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              {carregando ? (
                <p className="py-8 text-center text-sm text-[#697386]">
                  Carregando publicações...
                </p>
              ) : erro ? (
                <p className="py-8 text-center text-sm text-red-400">
                  {erro}
                </p>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    postId={post.id}
                    name={post.usuario?.nome ?? "Usuário"}
                    username={post.usuario?.username ?? ""}
                    foto={post.usuario?.foto}
                    time={post.dataCriacao}
                    content={post.texto ?? ""}
                    musicId={post.musica?.id ?? 0}
                    musicTitle={
                      post.musica?.titulo ?? "Música indisponível"
                    }
                    artist={
                      post.musica?.artista?.nome ??
                      "Artista desconhecido"
                    }
                    artistId={post.musica?.artista?.id}
                    musicCover={post.musica?.capa}
                    nota={post.nota}
                    avaliacoes={post.musica?.avaliacoes}
                    likes={post._count?.curtidas ?? 0}
                    comments={post._count?.comentarios ?? 0}
                    curtidoPorMim={post.curtidoPorMim ?? false}
                    duracaoSegundos={
                      post.musica?.duracaoSegundos
                    }

                    ehMeuPost={
                      usuarioLogadoId !== null &&
                      post.usuario?.id === usuarioLogadoId
                    }

                  />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-[#697386]">
                  Nenhum post feito.
                </p>
              )}
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                {musicasRecomendadas.length > 0 ? (
                  musicasRecomendadas.slice(0, 5).map((musica) => (
                    <RecommendedMusic
                      key={musica.id}
                      id={musica.id}
                      titulo={musica.titulo}
                      artist={musica.artista?.nome}
                      capa={musica.capa}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-[#697386]">
                    Nenhuma música encontrada para seus gêneros favoritos.
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
