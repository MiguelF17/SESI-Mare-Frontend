import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import MusicCard from "../components/musicCard";
import PostCard from "../components/postCard";
import { API_URL } from "../api";
import logo from "../assets/logo.png";
import { ArrowLeftIcon } from "@phosphor-icons/react";

export default function Artista() {
  const { id } = useParams();

  const [artista, setArtista] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro(false);
      setArtista(null);
      setPosts([]);

      try {
        const respostaArtista = await fetch(
          `${API_URL}/artistas/${id}`
        );

        if (!respostaArtista.ok) {
          throw new Error("Artista não encontrado");
        }

        const dadosArtista = await respostaArtista.json();

        const respostaPosts = await fetch(`${API_URL}/posts`);

        if (!respostaPosts.ok) {
          throw new Error("Erro ao buscar posts");
        }

        const dadosPosts = await respostaPosts.json();

        if (ativo) {
          setArtista(dadosArtista);

          const postsDoArtista = dadosPosts.filter(
            (post: any) =>
              post.musica?.artista?.id === Number(id)
          );

          setPosts(postsDoArtista);
        }
      } catch (error) {
        if (ativo) setErro(true);
        console.error("Erro ao carregar artista:", error);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    if (id) {
      carregarDados();
    } else {
      setErro(true);
      setCarregando(false);
    }

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] items-center justify-center text-[#697386]">
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
          <div className="flex min-h-[400px] items-center justify-center text-[#697386]">
            Artista não encontrado.
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          <main className="min-w-0">
            {/* BUSCA */}
            <div className="sticky top-0 z-20 border-b border-[#242b3a] bg-[#080A10]/95 backdrop-blur-md">
              <div className="py-3">
                <SearchBar />
              </div>

              <div className="flex items-center gap-5 py-3">
                <Link
                  to="/home"
                  aria-label="Voltar para a Home"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#d1d5db] transition hover:bg-[#202536] hover:text-white"
                >
                  <ArrowLeftIcon size={24} weight="bold" />
                </Link>

                <h1 className="text-base font-bold text-white">
                  {artista.nome}
                </h1>
              </div>
            </div>

            {/* CABEÇALHO DO ARTISTA */}
            <div className="relative mt-6 mb-4 h-[280px] w-full overflow-hidden rounded-xl border border-[#273349] bg-[#111824]">
              {/* FUNDO DESFOCADO */}
              <img
                src={artista.fotoURL || logo}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
              />

              {/* IMAGEM PRINCIPAL */}
              <img
                src={artista.fotoURL || logo}
                alt={artista.nome}
                className="absolute inset-0 h-full w-full object-contain"
              />

              {/* CAMADA ESCURA */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A10] via-black/40 to-black/10" />

              {/* INFORMAÇÕES */}
              <div className="relative z-10 flex h-full flex-col justify-end p-5">
                <span className="mb-2 text-xs uppercase tracking-widest text-[#58AAF0]">
                  Artista
                </span>

                <h1 className="break-words font-serif text-[30px] leading-tight text-white">
                  {artista.nome}
                </h1>

                <p className="mt-3 text-[12px] text-[#aeb6c5]">
                  {artista.musicas?.length ?? 0}{" "}
                  {(artista.musicas?.length ?? 0) === 1
                    ? "música"
                    : "músicas"}
                </p>
              </div>
            </div>

            {/* MÚSICAS DO ARTISTA */}
            <section className="mt-8">
              <h2 className="mb-3 font-serif text-[24px] text-white">
                Músicas de {artista.nome}
              </h2>

              {artista.musicas?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {artista.musicas.map((musica: any) => (
                    <MusicCard
                      key={musica.id}
                      id={musica.id}
                      tipo="quadrado"
                      titulo={musica.titulo}
                      artista={artista.nome}
                      capa={musica.capa}
                      nota={musica.nota}
                      avaliacoes={musica.avaliacoes}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-[14px] text-[#697386]">
                  Nenhuma música deste artista.
                </p>
              )}
            </section>

          </main>

          {/* POSTS RELACIONADOS */}
          <aside className="hidden xl:block">
            <div className="sticky top-40">
              <h2 className="mb-5 font-serif text-[16px] text-white">
                Posts sobre {artista.nome}
              </h2>

              <div className="flex flex-col gap-3">
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
                      musicCover={post.musica?.capa}
                      nota={post.nota}
                      avaliacoes={post.musica?.avaliacoes}
                      likes={post._count?.curtidas}
                      comments={post._count?.comentarios}
                      duracaoSegundos={post.musica?.duracaoSegundos}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-[14px] text-[#697386]">
                    Nenhum post sobre este artista.
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
