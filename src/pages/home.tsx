
import { useEffect, useState } from "react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
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

  function selecionarAba(aba: "paraVoce" | "seguindo") {
    if (aba === "seguindo" && !localStorage.getItem("token")) {
      setErroSeguindo(
        "Faça login para ver as publicações de quem você segue."
      );
      setPostsSeguindo([]);
    } else {
      setErroSeguindo("");
    }

    setAbaAtiva(aba);
  }



  // Busca as publicações de quem o usuário segue.
  useEffect(() => {
    if (abaAtiva !== "seguindo") return;

    if (!localStorage.getItem("token")) return;

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
            <div className="sticky top-[calc(52px+env(safe-area-inset-top))] z-20 -mt-2.5 bg-[var(--cor-fundo)]/90 backdrop-blur-xl md:top-16 md:mt-0">
              <div className="flex justify-center pb-1 pt-3 sm:pb-2 sm:pt-4 md:pb-0 md:pt-1">
                <FeedTabs
                  abaAtiva={abaAtiva}
                  setAbaAtiva={selecionarAba}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 pt-4 md:pt-2">
              {feedCarregando ? (
                <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
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
                    editado={post.editado}
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
                <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
                  {abaAtiva === "seguindo"
                    ? "Nenhuma publicação de quem você segue."
                    : "Nenhum post feito."}
                </p>
              )}
            </div>
          </section>

          <aside className="hidden xl:block">
            <div className="fixed top-20 w-[340px]">
              <h2 className="mb-5 font-serif text-[16px] text-[var(--cor-texto-principal)]">
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
