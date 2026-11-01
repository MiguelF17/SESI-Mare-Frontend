
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import OuvirCard from "../components/ouvirCard";
import PostCard from "../components/postCard";
import MusicCard from "../components/musicCard";

import {
  buscarMusicaPorId,
  buscarMusicas,
  type Musica as TipoMusica,
} from "../services/musicaService";

import {
  buscarPostsDaMusica,
  type Post,
} from "../services/postService";

import {
  verificarMusicaSalva,
  alternarMusicaSalva,
} from "../services/salvarMusicaService";

import {
  StarIcon,
  PlusIcon,
  BookmarkSimpleIcon,
} from "@phosphor-icons/react";

import logo from "../assets/logo.png";
import BotaoVoltar from "../components/botaoVoltar";

export default function Musica() {
  const { id } = useParams();
  const navigate = useNavigate();

  const idMusica = Number(id);
  const idValido = Number.isInteger(idMusica) && idMusica > 0;

  const [musica, setMusica] = useState<TipoMusica | null>(null);
  const [carregando, setCarregando] = useState(true);

  const [salva, setSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [musicasRelacionadas, setMusicasRelacionadas] =
    useState<TipoMusica[]>([]);
  const [carregandoRelacionadas, setCarregandoRelacionadas] =
    useState(false);

  const [posts, setPosts] = useState<Post[]>([]);

  // Buscar a música da página
  useEffect(() => {
    let ativo = true;

    async function carregarMusica() {
      if (!idValido) {
        setMusica(null);
        setCarregando(false);
        return;
      }

      setCarregando(true);
      setMusica(null);

      try {
        const dados = await buscarMusicaPorId(idMusica);

        if (ativo) {
          setMusica(dados);
        }
      } catch (error) {
        console.error("Erro ao buscar música:", error);

        if (ativo) {
          setMusica(null);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarMusica();

    return () => {
      ativo = false;
    };
  }, [idMusica, idValido]);

  // Buscar músicas do mesmo gênero
  const generoAtual = musica?.genero?.trim().toLocaleLowerCase() ?? "";

  useEffect(() => {
    let ativo = true;

    async function carregarRelacionadas() {
      setMusicasRelacionadas([]);

      if (!idValido || !musica || !generoAtual) {
        setCarregandoRelacionadas(false);
        return;
      }

      setCarregandoRelacionadas(true);

      try {
        const todasMusicas = await buscarMusicas();

        const relacionadas = todasMusicas
          .filter((item) => {
            const generoItem = item.genero
              ?.trim()
              .toLocaleLowerCase();

            return (
              item.id !== idMusica &&
              generoItem === generoAtual
            );
          })
          .slice(0, 6);

        if (ativo) {
          setMusicasRelacionadas(relacionadas);
        }
      } catch (error) {
        console.error(
          "Erro ao buscar músicas relacionadas:",
          error
        );

        if (ativo) {
          setMusicasRelacionadas([]);
        }
      } finally {
        if (ativo) {
          setCarregandoRelacionadas(false);
        }
      }
    }

    carregarRelacionadas();

    return () => {
      ativo = false;
    };
  }, [idMusica, idValido, musica, generoAtual]);

  // Buscar posts relacionados à música
  useEffect(() => {
    let ativo = true;

    async function carregarPosts() {
      if (!idValido) {
        setPosts([]);
        return;
      }

      try {
        const dados = await buscarPostsDaMusica(idMusica);

        if (ativo) {
          setPosts(dados);
        }
      } catch (error) {
        console.error("Erro ao buscar posts relacionados:", error);

        if (ativo) {
          setPosts([]);
        }
      }
    }

    carregarPosts();

    return () => {
      ativo = false;
    };
  }, [idMusica, idValido]);

  // Verificar se a música está salva
  useEffect(() => {
    let ativo = true;

    async function verificarSalvamento() {
      setSalva(false);

      if (!idValido || !localStorage.getItem("token")) {
        return;
      }

      try {
        const estaSalva = await verificarMusicaSalva(idMusica);

        if (ativo) {
          setSalva(estaSalva);
        }
      } catch (error) {
        console.error("Erro ao verificar música salva:", error);
      }
    }

    verificarSalvamento();

    return () => {
      ativo = false;
    };
  }, [idMusica, idValido]);

  // Salvar ou remover dos salvos
  async function alternarSalvamento() {
    if (!idValido || salvando) return;

    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }

    try {
      setSalvando(true);

      await alternarMusicaSalva(idMusica, salva);

      setSalva((estadoAtual) => !estadoAtual);
    } catch (error) {
      console.error("Erro ao alterar música salva:", error);
      alert("Não foi possível atualizar sua lista de músicas salvas.");
    } finally {
      setSalvando(false);
    }
  }

  // Estado de carregamento
  if (carregando) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] items-center justify-center text-[var(--cor-texto-discreto)]">
            Carregando música...
          </div>
        </PageContent>
      </PageLayout>
    );
  }

  // Música inexistente ou ID inválido
  if (!musica) {
    return (
      <PageLayout>
        <PageContent>
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-[var(--cor-texto-discreto)]">
            <p>Música não encontrada.</p>

            <BotaoVoltar fallback="/explorar" />
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
            {/* BUSCA E NAVEGAÇÃO */}
            <div className="sticky search-header -mt-2.5 top-[calc(50px+env(safe-area-inset-top))] z-20 md:top-0 md:mt-0 border-b border-[#242b3a] bg-[var(--cor-fundo)]/95 backdrop-blur-md">
              <div className="py-0 md:py-3">
              </div>

              <div className="flex items-center gap-4 py-3">
                <BotaoVoltar fallback="/explorar" />

                <h1 className="truncate text-base font-bold text-[var(--cor-texto-principal)]">
                  {musica.titulo}
                </h1>
              </div>
            </div>

            {/* CAPA DA MÚSICA */}
            <div className="relative mt-6 mb-4 h-[280px] w-full overflow-hidden rounded-xl border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie-cartao)]">
              <img
                src={musica.capa || logo}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
              />

              <img
                src={musica.capa || logo}
                alt={musica.titulo}
                className="absolute inset-0 h-full w-full object-contain"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cor-gradiente-inicio)] via-black/40 to-black/10" />

              <div className="relative z-10 flex h-full flex-col justify-between p-5">
                {/* AÇÕES E NOTA */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={alternarSalvamento}
                    disabled={salvando}
                    aria-label={salva ? "Remover dos salvos" : "Salvar música"}
                    className="flex cursor-pointer items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm transition hover:bg-black/70 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <BookmarkSimpleIcon
                      size={20}
                      weight={salva ? "fill" : "regular"}
                      className={salva ? "text-[var(--cor-destaque)]" : "text-[var(--cor-texto-principal)]"}
                    />

                    <span
                      className={`text-[13px] ${salva ? "text-[var(--cor-destaque)]" : "text-[var(--cor-texto-principal)]"
                        }`}
                    >
                      {salvando
                        ? "Salvando..."
                        : salva
                          ? "Salva"
                          : "Salvar"}
                    </span>
                  </button>

                  <div className="flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 backdrop-blur-sm">
                    <StarIcon
                      size={20}
                      weight="fill"
                      className="text-[var(--cor-destaque)]"
                    />

                    <span className="text-[18px] text-[var(--cor-texto-principal)]">
                      {Number(musica.nota || 0).toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* INFORMAÇÕES */}
                <div className="max-w-[70%]">
                  <h2 className="truncate font-serif text-[30px] leading-tight text-[var(--cor-texto-principal)]">
                    {musica.titulo}
                  </h2>

                  {musica.artista && (
                    <Link
                      to={`/artista/${musica.artista.id}`}
                      className="mt-1 block truncate text-[14px] text-[#d0d0d0] transition hover:text-[var(--cor-destaque)]"
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

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {musica.genero && (
                      <span className="text-[12px] text-[#aeb6c5]">
                        {musica.genero}
                      </span>
                    )}

                    {musica.genero && (
                      <span className="text-[#687386]">•</span>
                    )}

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

            {/* PLATAFORMAS PARA OUVIR */}
            <OuvirCard
              spotifyURL={musica.spotifyUrl}
              appleMusicURL={musica.appleMusicUrl}
              amazonMusicURL={musica.amazonMusicUrl}
              youtubeMusicURL={musica.youtubeMusicUrl}
            />

            {/* MÚSICAS RELACIONADAS */}
            <section className="mt-8">
              <h2 className="mb-3 font-serif text-[24px] text-[var(--cor-texto-principal)]">
                Músicas relacionadas
              </h2>

              {carregandoRelacionadas ? (
                <p className="text-[14px] text-[var(--cor-texto-discreto)]">
                  Carregando músicas relacionadas...
                </p>
              ) : musicasRelacionadas.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6">
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
                <p className="text-[14px] text-[var(--cor-texto-discreto)]">
                  Nenhuma música relacionada encontrada.
                </p>
              )}
            </section>

            {/* CRIAR POST */}
            <button
              type="button"
              onClick={() => navigate(`/criarpost?musica=${musica.id}`)}
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[var(--cor-destaque-suave)] text-[14px] font-serif text-[var(--cor-texto-principal)] transition hover:bg-[#6bb0ef] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlusIcon weight="bold" size={14} />
              Adicionar um post
            </button>
          </main>

          {/* POSTS RELACIONADOS */}
          <aside className="hidden xl:block">
            <div className="sticky top-40">
              <h2 className="mb-5 font-serif text-[16px] text-[var(--cor-texto-principal)]">
                Posts relacionados
              </h2>

              <div className="flex flex-col gap-3">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      postId={post.id}
                      name={post.usuario?.nome ?? "Usuário"}
                      username={post.usuario?.username ?? ""}
                      foto={post.usuario?.foto}
                      time={post.dataCriacao}
                      content={post.texto ?? ""}
                      musicId={post.musica?.id ?? musica.id}
                      musicTitle={post.musica?.titulo ?? musica.titulo}
                      artist={post.musica?.artista?.nome ?? musica.artista?.nome ?? ""}
                      artistId={post.musica?.artista?.id ?? musica.artista?.id}
                      musicCover={post.musica?.capa ?? musica.capa}
                      nota={post.nota}
                      editado={post.editado}
                      avaliacoes={post.musica?.avaliacoes}
                      likes={post._count?.curtidas ?? 0}
                      comments={post._count?.comentarios ?? 0}
                      duracaoSegundos={post.musica?.duracaoSegundos ?? musica.duracaoSegundos}
                      curtidoPorMim={post.curtidoPorMim ?? false}
                    />
                  ))
                ) : (
                  <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
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
