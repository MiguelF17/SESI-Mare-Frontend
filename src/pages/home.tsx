import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import RecommendedMusic from "../components/recommendedMusic";
import FeedTabs from "../components/feedTabs";
import { useEffect, useState } from "react";
import { API_URL } from "../api";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [musicas, setMusicas] = useState<any[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"paraVoce" | "seguindo">("paraVoce");

  useEffect(() => {
    async function buscarDados() {
      try {
        const [respostaPosts, respostaMusicas] = await Promise.all([
          fetch(`${API_URL}/posts`),
          fetch(`${API_URL}/musicas`),
        ]);

        if (!respostaPosts.ok || !respostaMusicas.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const dadosPosts = await respostaPosts.json();
        const dadosMusicas = await respostaMusicas.json();

        setPosts(dadosPosts);
        setMusicas(dadosMusicas);
      } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
      }
    }

    buscarDados();
  }, []);

  return (
    <PageLayout>
      <PageContent>
        {/* COLUNAS */}
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* COLUNA PRINCIPAL */}
          <section className="min-w-0">
            {/* ÁREA FIXA */}
            <div className="sticky top-0 z-20 bg-[#080A10]">
              {/* BUSCA */}
              <div className="pt-6">
                <SearchBar />
              </div>

              {/* FEED TABS */}
              <div className="flex justify-center pb-2 pt-4">
                <FeedTabs abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
              </div>
            </div>

            {/* POSTS */}
            <div className="flex flex-col gap-6 pt-4">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    postId={post.id}
                    key={post.id}
                    name={post.usuario?.nome}
                    username={post.usuario?.username}
                    foto={post.usuario?.foto}
                    time={post.dataCriacao}
                    content={post.texto}
                    musicId={post.musica?.id}
                    musicTitle={post.musica?.titulo}
                    artist={post.musica?.artista?.nome}
                    artistId={post.musica?.artista?.id}
                    musicCover={post.musica?.capa}
                    nota={post.musica?.nota}
                    avaliacoes={post.musica?.avaliacoes}
                    likes={post._count?.curtidas}
                    comments={post._count?.comentarios}
                    duracaoSegundos={post.musica?.duracaoSegundos}
                  />
                ))
              ) : (
                <p className="py-8 text-center text-[14px] text-[#697386]">
                  Nenhum post feito.
                </p>
              )}
            </div>
          </section>

          {/* RECOMENDAÇÕES */}
          <aside className="hidden xl:block">
            <div className="fixed top-2/5 -translate-y-2/5 w-[340px]">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                {musicas.length > 0 ? (
                  musicas
                    .slice(0, 5)
                    .map((musica) => (
                      <RecommendedMusic
                        id={musica.id}
                        key={musica.id}
                        titulo={musica.titulo}
                        artist={musica.artista.nome}
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
