import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import MusicCard from "../components/musicCard";
import PostCard from "../components/postCard";
import { MusicNotesIcon, StarIcon } from "@phosphor-icons/react";

import BotaoVoltar from "../components/botaoVoltar";
import { buscarArtistaPorId, type Artista as ArtistaDados } from "../services/artistaService";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { buscarPosts, type Post } from "../services/postService";

import logo from "../assets/logo.png";

type MusicaArtista = Musica & {
  artistaId?: number;
};

export default function Artista() {
  const { id } = useParams();

  const [artista, setArtista] = useState<ArtistaDados | null>(null);
  const [musicas, setMusicas] = useState<MusicaArtista[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        setErro(true);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setErro(false);
      setArtista(null);
      setMusicas([]);
      setPosts([]);

      try {
        const [dadosArtista, todasMusicas, todosPosts] = await Promise.all([
          buscarArtistaPorId(Number(id)),
          buscarMusicas(),
          buscarPosts().catch((erroPosts) => {
            console.error("Erro ao buscar posts do artista:", erroPosts);
            return [] as Post[];
          }),
        ]);

        const musicasDoArtista = todasMusicas.filter(
          (musica) =>
            musica.artista?.id === Number(id) ||
            ("artistaId" in musica && musica.artistaId === Number(id))
        );

        const postsDoArtista = todosPosts.filter(
          (post) => post.musica?.artista?.id === Number(id)
        );

        if (ativo) {
          setArtista(dadosArtista);
          setMusicas(musicasDoArtista);
          setPosts(postsDoArtista);
        }
      } catch (erroCarregamento) {
        console.error("Erro ao carregar artista:", erroCarregamento);

        if (ativo) {
          setErro(true);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] items-center justify-center text-sm text-[var(--cor-texto-discreto)]">
            Carregando artista...
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (erro || !artista) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <p className="text-sm text-[var(--cor-texto-discreto)]">
              Não foi possível encontrar este artista.
            </p>

            <BotaoVoltar fallback="/explorar" />
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageContent>
        <div className="grid min-w-0 grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0">
            {/* BUSCA E NAVEGAÇÃO */}
            <div className="sticky top-[calc(40px+env(safe-area-inset-top))] z-20 md:top-0 border-b border-[#242b3a] bg-[var(--cor-fundo)]/95 backdrop-blur-md">
              <div className="py-3">
                <SearchBar />
              </div>

              <div className="flex items-center gap-4 py-3">
                <BotaoVoltar fallback="/explorar" />

                <h1 className="truncate text-base font-bold text-[var(--cor-texto-principal)]">
                  {artista.nome}
                </h1>
              </div>
            </div>

            {/* CAPA DO ARTISTA */}
            <section className="relative mt-6 mb-8 h-[240px] w-full overflow-hidden rounded-xl border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie-cartao)] sm:h-[300px]">
              <img
                src={artista.fotoURL || logo}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl"
              />

              <img
                src={artista.fotoURL || logo}
                alt={artista.nome}
                className="absolute inset-0 h-full w-full object-contain"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cor-gradiente-inicio)] via-black/35 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 z-10 p-5 sm:p-7">
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-[var(--cor-destaque)]">
                  Artista
                </span>

                <h2 className="break-words font-serif text-2xl leading-tight text-[var(--cor-texto-principal)] sm:text-3xl">
                  {artista.nome}
                </h2>

                <div className="mt-3 flex items-center gap-2 text-sm text-[#aeb6c5]">
                  <MusicNotesIcon size={17} />
                  <span>
                    {musicas.length}{" "}
                    {musicas.length === 1 ? "música" : "músicas"}
                  </span>
                </div>
              </div>
            </section>

            {/* MÚSICAS */}
            <section className="mb-12 min-w-0">
              <div className="mb-5 flex items-center gap-2">
                <MusicNotesIcon
                  size={20}
                  className="text-[var(--cor-destaque)]"
                />

                <h2 className="font-serif text-xl text-[var(--cor-texto-principal)] sm:text-2xl">
                  Músicas de {artista.nome}
                </h2>
              </div>

              {musicas.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {musicas.map((musica) => (
                    <MusicCard
                      key={musica.id}
                      id={musica.id}
                      tipo="quadrado"
                      titulo={musica.titulo}
                      artista={artista.nome}
                      artistaId={artista.id}
                      capa={musica.capa}
                      nota={musica.nota}
                      avaliacoes={musica.avaliacoes}
                      duracaoSegundos={musica.duracaoSegundos}
                    />
                  ))}
                </div>
              ) : (
                <p className="py-5 text-sm text-[var(--cor-texto-discreto)]">
                  Nenhuma música cadastrada para este artista.
                </p>
              )}
            </section>
          </main>

          {/* POSTS RELACIONADOS */}
          <aside className="min-w-0">
            <div className="xl:sticky xl:top-40">
              <div className="mb-5 flex items-center gap-2">
                <StarIcon size={19} className="text-[var(--cor-destaque)]" />

                <h2 className="font-serif text-lg text-[var(--cor-texto-principal)]">
                  Posts sobre {artista.nome}
                </h2>
              </div>

              {posts.filter((post) => post.musica?.id != null).length > 0 ? (
                <div className="flex flex-col gap-4">
                  {posts
                    .filter((post) => post.musica?.id != null)
                    .map((post) => (
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
                        artist={post.musica?.artista?.nome ?? artista.nome}
                        artistId={post.musica?.artista?.id ?? artista.id}
                        musicCover={post.musica?.capa ?? undefined}
                        nota={post.nota}
                        editado={post.editado}
                        avaliacoes={post.musica?.avaliacoes}
                        likes={post._count?.curtidas ?? 0}
                        comments={post._count?.comentarios ?? 0}
                        duracaoSegundos={post.musica?.duracaoSegundos}
                      />
                    ))}
                </div>
              ) : (
                <p className="rounded-xl border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie)] px-4 py-6 text-sm text-[var(--cor-texto-discreto)]">
                  Ainda não há posts sobre este artista.
                </p>
              )}
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}
