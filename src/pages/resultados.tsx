import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import MusicCard from "../components/musicCard";
import PostCard from "../components/postCard";

import { buscarArtistas, type Artista } from "../services/artistaService";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { buscarPosts, type Post } from "../services/postService";
import { apiRequest } from "../api";
import RecommendedMusicList from "../components/recommendedMusicList";

function normalizar(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function Resultados() {
  const [params] = useSearchParams();
  const termo = params.get("q") || "";
  const q = normalizar(termo.trim());

  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [artistas, setArtistas] = useState<Artista[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(
    null
  );
  
  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro(false);

      try {
        const [musicasDados, artistasDados, postsDados] =
          await Promise.all([
            buscarMusicas(),
            buscarArtistas(),
            buscarPosts(),
          ]);

        if (ativo) {
          setMusicas(musicasDados);
          setArtistas(artistasDados);
          setPosts(postsDados);
        }
      } catch (erro) {
        console.error("Erro ao buscar resultados:", erro);

        if (ativo) {
          setErro(true);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
  let ativo = true;

  async function carregarUsuarioLogado() {
    try {
      const usuario = await apiRequest<{ id: number }>("/usuarios/me");

      if (ativo) {
        setUsuarioLogadoId(usuario.id);
      }
    } catch {
      if (ativo) {
        setUsuarioLogadoId(null);
      }
    }
  }

  carregarUsuarioLogado();

  return () => {
    ativo = false;
  };
}, []);

  const musicasFiltradas = musicas.filter(
    (musica) =>
      normalizar(musica.titulo).includes(q) ||
      normalizar(musica.artista?.nome).includes(q)
  );

  const artistasFiltrados = artistas.filter((artista) =>
    normalizar(artista.nome).includes(q)
  );

  const postsFiltrados = posts.filter(
    (post) =>
      post.musica?.id != null &&
      (normalizar(post.texto).includes(q) ||
        normalizar(post.usuario?.nome).includes(q) ||
        normalizar(post.usuario?.username).includes(q) ||
        normalizar(post.musica?.titulo).includes(q) ||
        normalizar(post.musica?.artista?.nome).includes(q))
  );

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* COLUNA PRINCIPAL */}
          <section className="min-w-0">
            {/* BUSCA FIXA */}
            <div className="sticky top-0 z-20 bg-[#080A10]">
              <div className="pt-6">
                <SearchBar />
              </div>

              <div className="border-b border-[#202536] pb-4 pt-5">
                <h1 className="font-serif text-2xl text-white">
                  Resultados da pesquisa
                </h1>

                <p className="mt-2 text-sm text-[#697386]">
                  Resultados para "{termo}"
                </p>
              </div>
            </div>

            {carregando ? (
              <p className="py-10 text-center text-sm text-[#697386]">
                Buscando resultados...
              </p>
            ) : erro ? (
              <p className="py-10 text-center text-sm text-red-400">
                Não foi possível carregar os resultados. Tente novamente.
              </p>
            ) : !q ? (
              <p className="py-10 text-center text-sm text-[#697386]">
                Digite algo na barra de pesquisa.
              </p>
            ) : (
              <div className="mb-5 flex flex-col gap-10 pt-6">
                {/* MÚSICAS */}
                <section>
                  <h2 className="mb-5 font-serif text-lg text-white">
                    Músicas
                    <span className="ml-2 text-sm text-[#697386]">
                      {musicasFiltradas.length}
                    </span>
                  </h2>

                  {musicasFiltradas.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {musicasFiltradas.map((musica) => (
                        <MusicCard
                          key={musica.id}
                          id={musica.id}
                          tipo="quadrado"
                          titulo={musica.titulo}
                          artista={musica.artista?.nome}
                          capa={musica.capa ?? undefined}
                          nota={musica.nota}
                          avaliacoes={musica.avaliacoes}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#697386]">
                      Nenhuma música encontrada.
                    </p>
                  )}
                </section>

                {/* ARTISTAS */}
                <section>
                  <h2 className="mb-5 font-serif text-lg text-white">
                    Artistas
                    <span className="ml-2 text-sm text-[#697386]">
                      {artistasFiltrados.length}
                    </span>
                  </h2>

                  {artistasFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {artistasFiltrados.map((artista) => (
                        <Link
                          key={artista.id}
                          to={`/artistas/${artista.id}`}
                          className="flex items-center gap-3 rounded-xl border border-[#273349] bg-[#111420] p-3 transition hover:border-[#58AAF0]/50 hover:bg-[#171C2A]"
                        >
                          <img
                            src={artista.fotoURL || "/logo.png"}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full bg-[#202536] object-cover"
                          />

                          <span className="text-sm font-medium text-white">
                            {artista.nome}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#697386]">
                      Nenhum artista encontrado.
                    </p>
                  )}
                </section>

                {/* POSTS */}
                <section>
                  <h2 className="mb-5 font-serif text-lg text-white">
                    Posts
                    <span className="ml-2 text-sm text-[#697386]">
                      {postsFiltrados.length}
                    </span>
                  </h2>

                  {postsFiltrados.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {postsFiltrados.map((post) => (
                        <PostCard
                          key={post.id}
                          postId={post.id}
                          name={post.usuario?.nome ?? "Usuário"}
                          username={post.usuario?.username ?? ""}
                          foto={post.usuario?.foto ?? undefined}
                          time={post.dataCriacao}
                          content={post.texto ?? ""}
                          musicId={post.musica!.id}
                          musicTitle={post.musica?.titulo ?? ""}
                          artist={post.musica?.artista?.nome ?? ""}
                          artistId={post.musica?.artista?.id}
                          musicCover={post.musica?.capa ?? undefined}
                          nota={post.nota}
                          avaliacoes={post.musica?.avaliacoes}
                          likes={post._count?.curtidas ?? 0}
                          comments={post._count?.comentarios ?? 0}
                          duracaoSegundos={post.musica?.duracaoSegundos}
                          curtidoPorMim={post.curtidoPorMim ?? false}
                          ehMeuPost={
                            usuarioLogadoId !== null &&
                            post.usuario?.id === usuarioLogadoId
                          }
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#697386]">
                      Nenhum post encontrado.
                    </p>
                  )}
                </section>
              </div>
            )}
          </section>

          {/* COLUNA DIREITA: RECOMENDAÇÕES */}
          <aside className="hidden xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-base text-white">
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