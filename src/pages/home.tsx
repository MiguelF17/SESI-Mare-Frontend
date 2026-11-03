
import { useEffect, useState } from "react";
import { ArrowClockwiseIcon } from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import PostCard from "../components/postCard";
import RecommendedMusicList from "../components/recommendedMusicList";
import FeedTabs from "../components/feedTabs";

import { apiRequest } from "../api";
import { useHomeFeed } from "../hooks/useHomeFeed";


export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<
    "paraVoce" | "seguindo"
  >("paraVoce");
  const temSessao = Boolean(localStorage.getItem("token"));
  const feedParaVoce = useHomeFeed("/posts", abaAtiva === "paraVoce");
  const feedSeguindo = useHomeFeed("/posts?seguindo=true", abaAtiva === "seguindo" && temSessao);
  const feedAtual = abaAtiva === "seguindo" ? feedSeguindo : feedParaVoce;

  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(
    null
  );

  function selecionarAba(aba: "paraVoce" | "seguindo") {
    setAbaAtiva(aba);
  }

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

  const erroFeed = abaAtiva === "seguindo" && !temSessao
    ? "Faça login para ver as publicações de quem você segue."
    : feedAtual.erro;

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
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => void feedAtual.recarregar()}
                  disabled={feedAtual.carregando || feedAtual.atualizando}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-xs text-[var(--cor-texto-secundario)] transition hover:bg-[var(--cor-superficie-alternativa)] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Recarregar feed"
                >
                  <ArrowClockwiseIcon size={15} className={feedAtual.atualizando ? "animate-spin" : ""} />
                  {feedAtual.atualizando ? "Atualizando..." : "Atualizar feed"}
                </button>
              </div>
              {feedAtual.carregando ? (
                <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
                  Carregando publicações...
                </p>
              ) : erroFeed ? (
                <p className="py-8 text-center text-sm text-red-400">
                  {erroFeed}
                </p>
              ) : feedAtual.posts.length > 0 ? (
                feedAtual.posts.map((post) => (
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
              {!feedAtual.carregando && !erroFeed && feedAtual.temMais && (
                <div className="flex justify-center py-2">
                  <button
                    type="button"
                    onClick={() => void feedAtual.carregarMais()}
                    disabled={feedAtual.carregandoMais}
                    className="cursor-pointer rounded-full border border-[var(--cor-borda)] px-5 py-2.5 text-sm font-medium text-[var(--cor-texto-principal)] transition hover:border-[var(--cor-borda-destaque)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {feedAtual.carregandoMais ? "Carregando..." : "Carregar mais posts"}
                  </button>
                </div>
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
