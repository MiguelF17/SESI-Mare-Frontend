
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
  const [generosFavoritos, setGenerosFavoritos] = useState<string[]>([]);
  const [abaAtiva, setAbaAtiva] = useState<"paraVoce" | "seguindo">(
    "paraVoce"
  );

  useEffect(() => {
    async function buscarDados() {
      try {
        const token = localStorage.getItem("token");

        const [respostaPosts, respostaMusicas, respostaGeneros] =
          await Promise.all([
            fetch(`${API_URL}/posts`, {
              headers: token
                ? { Authorization: `Bearer ${token}` }
                : {},
            }),
            fetch(`${API_URL}/musicas`),
            token
              ? fetch(`${API_URL}/usuarios/me/generos`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                })
              : Promise.resolve(null),
          ]);

        if (!respostaPosts.ok || !respostaMusicas.ok) {
          throw new Error("Erro ao buscar dados");
        }

        const dadosPosts = await respostaPosts.json();
        const dadosMusicas = await respostaMusicas.json();

        setPosts(dadosPosts);
        setMusicas(dadosMusicas);

        if (respostaGeneros?.ok) {
          const dadosGeneros = await respostaGeneros.json();

          setGenerosFavoritos(
            Array.isArray(dadosGeneros) ? dadosGeneros : []
          );
        } else {
          setGenerosFavoritos([]);
        }
      } catch (erro) {
        console.error("Erro ao buscar dados:", erro);
      }
    }

    buscarDados();
  }, []);

  const normalizarGenero = (genero: string) =>
    genero.trim().toLocaleLowerCase("pt-BR");

  const musicasRecomendadas =
    generosFavoritos.length > 0
      ? musicas.filter((musica) =>
          generosFavoritos.some(
            (genero) =>
              typeof musica.genero === "string" &&
              normalizarGenero(musica.genero) ===
                normalizarGenero(genero)
          )
        )
      : musicas;

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
              {posts.length > 0 ? (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    postId={post.id}
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
                    nota={post.nota}
                    avaliacoes={post.musica?.avaliacoes}
                    likes={post._count?.curtidas}
                    comments={post._count?.comentarios}
                    curtidoPorMim={post.curtidoPorMim}
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

          <aside className="hidden xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                {musicasRecomendadas.length > 0 ? (
                  musicasRecomendadas.slice(0, 5).map((musica) => (
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
