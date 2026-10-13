import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import OuvirCard from "../components/ouvirCard";
import PostCard from "../components/postCard";
import { API_URL } from "../api";

import { ArrowLeftIcon, StarIcon, PlusIcon, BookmarkSimpleIcon } from "@phosphor-icons/react";

import MusicCard from "../components/musicCard";
import logo from "../assets/logo.png";

export default function Musica() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [musica, setMusica] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  const [salva, setSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [musicasRelacionadas, setMusicasRelacionadas] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;

    setCarregando(true);

    fetch(`${API_URL}/musicas/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Música não encontrada");
        }

        return res.json();
      })
      .then((data) => {
        console.log("MÚSICA:", data);
        setMusica(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar música:", error);
      })
      .finally(() => {
        setCarregando(false);
      });
  }, [id]);

  /*
   * BUSCAR MÚSICAS RELACIONADAS
   */
  useEffect(() => {
    if (!musica?.genero || !id) return;

    fetch(`${API_URL}/musicas`)
      .then((res) => res.json())
      .then((data) => {
        const relacionadas = data
          .filter(
            (item: any) =>
              item.id !== Number(id) &&
              item.genero === musica.genero
          )
          .slice(0, 6);

        setMusicasRelacionadas(relacionadas);
      })
      .catch((error) => {
        console.error("Erro ao buscar músicas relacionadas:", error);
      });
  }, [musica, id]);

  /*
   * BUSCAR POSTS DA MÚSICA
   */
  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/posts?musicaId=${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erro ao buscar posts");
        }

        return res.json();
      })
      .then((data) => {
        setPosts(data);
      })
      .catch((error) => {
        console.error("Erro ao buscar posts relacionados:", error);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;

    async function verificarSalvamento() {
      try {
        const token = localStorage.getItem("token");

        if (!token) return;

        const resposta = await fetch(
          `${API_URL}/usuarios/me/salvos`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!resposta.ok) return;

        const salvos = await resposta.json();

        const estaSalva = salvos.some(
          (item: any) => item.musica?.id === Number(id)
        );

        setSalva(estaSalva);
      } catch (error) {
        console.error("Erro ao verificar música salva:", error);
      }
    }

    verificarSalvamento();
  }, [id]);

  async function alternarSalvamento() {
    if (!id || salvando) return;

    try {
      setSalvando(true);

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Usuário não autenticado");
        return;
      }

      const resposta = await fetch(
        `${API_URL}/musicas/${id}/salvar`,
        {
          method: salva ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resposta.ok) {
        throw new Error("Erro ao alterar salvamento");
      }

      setSalva(!salva);
    } catch (error) {
      console.error("Erro ao salvar/remover música:", error);
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] items-center justify-center text-[#697386]">
            Carregando música...
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  if (!musica) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] items-center justify-center text-[#697386]">
            Música não encontrada.
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
                    {musica.titulo}
                  </h1>
              </div>
            </div>

            {/* CAPA DA MÚSICA */}
            <div className="relative mt-6 mb-4 h-[280px] w-full overflow-hidden rounded-xl border border-[#273349] bg-[#111824]">

              {/* Fundo desfocado */}
              <img
                src={musica.capa || logo}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl opacity-50"
              />

              {/* Capa principal */}
              <img
                src={musica.capa || logo}
                alt={musica.titulo}
                className="absolute inset-0 h-full w-full object-contain"
              />

              {/* Camada escura */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080A10] via-black/40 to-black/10" />

              {/* Conteúdo */}
              <div className="relative z-10 flex h-full flex-col justify-between p-5">

                {/* Avaliação */}
                <div className="flex justify-end gap-2">
                  {/* SALVAR */}
                  <button
                    onClick={alternarSalvamento}
                    disabled={salvando}
                    className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm transition hover:bg-black/70 cursor-pointer"
                  >
                    <BookmarkSimpleIcon
                      size={20}
                      weight={salva ? "fill" : "regular"}
                      className={salva ? "text-[#58AAF0]" : "text-white"}
                    />

                    <span
                      className={`text-[13px] ${salva ? "text-[#58AAF0]" : "text-white"
                        }`}
                    >
                      {salva ? "Salva" : "Salvar"}
                    </span>
                  </button>

                  {/* NOTA */}
                  <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
                    <StarIcon
                      size={20}
                      weight="fill"
                      className="text-[#58AAF0]"
                    />

                    <span className="text-[18px] text-white">
                      {Number(musica.nota || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Informações */}
                <div className="max-w-[70%]">

                  <h1 className="truncate font-serif text-[30px] leading-tight text-white">
                    {musica.titulo}
                  </h1>

                  {musica.artista && (
                    <Link
                      to={`/artista/${musica.artista.id}`}
                      className="mt-1 block truncate text-[14px] text-[#d0d0d0] transition hover:text-[#58AAF0]"
                    >
                      {musica.artista.fotoURL && (
                        <img
                          src={musica.artista.fotoURL}
                          alt=""
                          className="mr-2 inline-block h-6 w-6 rounded-full object-cover"
                        />
                      )}
                      {musica.artista.nome}
                    </Link>
                  )}

                  <div className="mt-3 flex items-center gap-3">

                    <span className="text-[12px] text-[#aeb6c5]">
                      {musica.genero}
                    </span>

                    <span className="text-[#687386]">
                      •
                    </span>

                    <span className="text-[12px] text-[#aeb6c5]">
                      {musica.avaliacoes || 0}{" "}
                      {musica.avaliacoes === 1
                        ? "avaliação"
                        : "avaliações"}
                    </span>

                  </div>
                </div>
              </div>
            </div>

            {/* OUVIR */}
            <OuvirCard spotifyURL={musica.spotifyUrl} />

            {/* MÚSICAS RELACIONADAS */}
            <section className="mt-8">

              <h2 className="mb-3 font-serif text-[24px] text-white">
                Músicas relacionadas
              </h2>

              {musicasRelacionadas.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                  {musicasRelacionadas.map((item) => (
                    <MusicCard
                      key={item.id}
                      id={item.id}
                      tipo="quadrado"
                      titulo={item.titulo}
                      artista={item.artista?.nome}
                      capa={item.capa}
                      nota={item.nota}
                      avaliacoes={item.avaliacoes}
                    />
                  ))}

                </div>
              ) : (
                <p className="text-[14px] text-[#697386]">
                  Nenhuma música relacionada encontrada.
                </p>
              )}
            </section>

            {/* CRIAR POST */}
            <button
              onClick={() => navigate(`/criarpost?musica=${musica.id}`)}
              className="
                mt-12
                flex
                h-14
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-lg
                bg-[#5ba4e8]
                font-serif
                text-[18px]
                text-white
                transition
                hover:bg-[#6bb0ef]
              "
            >
              <PlusIcon weight="bold" size={18} />
              Adicionar um post
            </button>

          </main>

          {/* POSTS RELACIONADOS */}
          <aside className="hidden xl:block">

            <div className="sticky top-40">

              <h2 className="mb-5 font-serif text-[16px] text-white">
                Posts relacionados
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
                    Nenhum post feito.
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