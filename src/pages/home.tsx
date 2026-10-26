
import { useEffect, useState } from "react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import RecommendedMusicList from "../components/recommendedMusicList";
import FeedTabs from "../components/feedTabs";

import { apiRequest } from "../api";
import { useHomeFeed } from "../hooks/useHomeFeed";


export default function Home() {
  const {
    posts,
    carregando,
    erro,
  } = useHomeFeed();

  const [abaAtiva, setAbaAtiva] = useState<
    "paraVoce" | "seguindo"
  >("paraVoce");

  const [postsSeguindo, setPostsSeguindo] = useState<typeof posts>([]);
  const [carregandoSeguindo, setCarregandoSeguindo] = useState(false);
  const [erroSeguindo, setErroSeguindo] = useState("");

  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(
    null
  );



  // Busca as publicações de quem o usuário segue.
  useEffect(() => {
    if (abaAtiva !== "seguindo") return;

    if (!localStorage.getItem("token")) {
      setErroSeguindo(
        "Faça login para ver as publicações de quem você segue."
      );
      setPostsSeguindo([]);
      return;
    }

    async function buscarPostsSeguindo() {
      setCarregandoSeguindo(true);
      setErroSeguindo("");

      try {
        const resultado = await apiRequest<typeof posts>(
          "/posts?seguindo=true"
        );

        setPostsSeguindo(resultado);
      } catch (error) {
        console.error("Erro ao buscar publicações de quem sigo:", error);
        setErroSeguindo("Não foi possível carregar as publicações.");
      } finally {
        setCarregandoSeguindo(false);
      }
    }

    buscarPostsSeguindo();
  }, [abaAtiva]);

  // Busca o ID do usuário logado.
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    async function buscarUsuarioLogado() {
      try {
        const usuario = await apiRequest<{ id: number }>("/usuarios/me");
        setUsuarioLogadoId(usuario.id);
      } catch (error) {
        console.error("Erro ao buscar usuário logado:", error);
      }
    }

    buscarUsuarioLogado();
  }, []);

  const postsExibidos =
    abaAtiva === "seguindo" ? postsSeguindo : posts;

  const feedCarregando =
    abaAtiva === "seguindo" ? carregandoSeguindo : carregando;

  const erroFeed =
    abaAtiva === "seguindo" ? erroSeguindo : erro;

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
              {feedCarregando ? (
                <p className="py-8 text-center text-sm text-[#697386]">
                  Carregando publicações...
                </p>
              ) : erroFeed ? (
                <p className="py-8 text-center text-sm text-red-400">
                  {erroFeed}
                </p>
              ) : postsExibidos.length > 0 ? (
                postsExibidos.map((post) => (
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
                      post.musica?.artista?.nome ?? "Artista desconhecido"
                    }
                    artistId={post.musica?.artista?.id}
                    musicCover={post.musica?.capa}
                    nota={post.nota}
                    avaliacoes={post.musica?.avaliacoes}
                    likes={post._count?.curtidas ?? 0}
                    comments={post._count?.comentarios ?? 0}
                    curtidoPorMim={post.curtidoPorMim ?? false}
                    duracaoSegundos={post.musica?.duracaoSegundos}
                    ehMeuPost={
                      usuarioLogadoId !== null &&
                      post.usuario?.id === usuarioLogadoId
                    }
                  />
                ))
              ) : (
                <p className="py-8 text-center text-sm text-[#697386]">
                  {abaAtiva === "seguindo"
                    ? "Nenhuma publicação de quem você segue."
                    : "Nenhum post feito."}
                </p>
              )}
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Músicas recomendadas
              </h2>

              <RecommendedMusicList />
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}
