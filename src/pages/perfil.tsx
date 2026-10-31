import {
  BookmarkSimpleIcon,
  CameraIcon,
  ChatCircleIcon,
  MusicNoteIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import MusicCard from "../components/musicCard";
import ImageCropModal from "../components/imageCropModal";

import { apiRequest } from "../api";
import { buscarPosts, type Post } from "../services/postService";
import {
  buscarMeuPerfil,
  type MeuPerfil,
} from "../services/usuarioService";
import {
  buscarMusicas,
  type Musica,
} from "../services/musicaService";
import ComentarioPerfilCard, {
  type ComentarioPerfil,
} from "../components/comentarioPerfilCard";
import RecommendedMusicList from "../components/recommendedMusicList";

type MusicaSalva = {
  musica: Musica;
};

export default function Perfil() {
  const [usuario, setUsuario] = useState<MeuPerfil | null>(null);

  const [aba, setAba] = useState<
    "avaliacoes" | "comentarios" | "salvos" | "curtidos"
  >("avaliacoes");

  const [curtidos, setCurtidos] = useState<Post[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState<Post[]>([]);
  const [comentarios, setComentarios] = useState<ComentarioPerfil[]>([]);
  const [salvos, setSalvos] = useState<MusicaSalva[]>([]);
  const [, setMusicas] = useState<Musica[]>([]);


  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState("");
  const [usernameEditado, setUsernameEditado] = useState("");
  const [bioEditada, setBioEditada] = useState("");
  const [salvando, setSalvando] = useState(false);

  const fotoInputRef = useRef<HTMLInputElement>(null);
  const capaInputRef = useRef<HTMLInputElement>(null);

  const [imagemParaRecortar, setImagemParaRecortar] = useState<{
    url: string;
    tipo: "foto" | "capa";
  } | null>(null);
  const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(
    null
  );

  useEffect(() => {
    async function buscarUsuarioLogado() {
      try {
        const usuario = await apiRequest<{ id: number }>("/usuarios/me");
        setUsuarioLogadoId(usuario.id);
      } catch (error) {
        console.error("Erro ao buscar usuário logado:", error);
      }
    }

    if (localStorage.getItem("token")) {
      buscarUsuarioLogado();
    }
  }, []);

  function removerDosCurtidos(postId: number) {
    setCurtidos((atuais) =>
      atuais.filter((post) => post.id !== postId)
    );
  }

  async function buscarCurtidos() {
    try {
      const dados = await buscarPosts({
        rota: "/usuarios/me/curtidas",
      });

      setCurtidos(dados);
    } catch (error) {
      console.error("Erro ao buscar posts curtidos:", error);
      toast.error("Não foi possível carregar os posts curtidos.");
    }
  }

  function abrirRecorte(arquivo: File, tipo: "foto" | "capa") {
    const url = URL.createObjectURL(arquivo);
    setImagemParaRecortar({ url, tipo });
  }

  function fecharRecorte() {
    if (imagemParaRecortar) {
      URL.revokeObjectURL(imagemParaRecortar.url);
    }

    setImagemParaRecortar(null);
  }

  async function buscarPerfil() {
    try {
      if (!localStorage.getItem("token")) {
        window.location.href = "/login";
        return;
      }

      const dados = await buscarMeuPerfil();
      setUsuario(dados);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      toast.error("Não foi possível carregar seu perfil.");
    } finally {
      setCarregando(false);
    }
  }

  async function buscarAvaliacoes() {
    try {
      const dados = await buscarPosts({
        rota: "/usuarios/me/posts",
      });

      setAvaliacoes(dados);
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error);
      toast.error("Não foi possível carregar suas avaliações.");
    }
  }

  async function buscarComentarios() {
    try {
      const dados = await apiRequest<ComentarioPerfil[]>(
        "/usuarios/me/comentarios"
      );

      setComentarios(dados);
    } catch (error) {
      console.error("Erro ao buscar comentários:", error);
      toast.error("Não foi possível carregar seus comentários.");
    }
  }

  async function buscarSalvos() {
    try {
      const dados = await apiRequest<MusicaSalva[]>(
        "/usuarios/me/salvos"
      );

      setSalvos(dados);
    } catch (error) {
      console.error("Erro ao buscar músicas salvas:", error);
      toast.error("Não foi possível carregar suas músicas salvas.");
    }
  }

  async function carregarMusicas() {
    try {
      const dados = await buscarMusicas();
      setMusicas(dados);
    } catch (error) {
      console.error("Erro ao buscar músicas recomendadas:", error);
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarDadosIniciais() {
      await Promise.resolve();
      if (!ativo) return;

      buscarPerfil();
      buscarAvaliacoes();
      buscarComentarios();
      buscarSalvos();
      buscarCurtidos();
      carregarMusicas();
    }

    void carregarDadosIniciais();

    return () => {
      ativo = false;
    };
  }, []);

  async function compartilharPerfil() {
    if (!usuario) return;

    const url = `${window.location.origin}/u/${encodeURIComponent(usuario.username)}`;

    if (!navigator.share) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link do perfil copiado!");
      } catch {
        toast.error("Não foi possível copiar o link do perfil.");
      }

      return;
    }

    try {
      await navigator.share({
        title: `Perfil de ${usuario.nome}`,
        text: `Confira o perfil de @${usuario.username} no Maré`,
        url,
      });
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        console.error("Erro ao compartilhar perfil:", error);
      }
    }
  }

  function abrirEdicao() {
    if (!usuario) return;

    setNomeEditado(usuario.nome);
    setUsernameEditado(usuario.username);
    setBioEditada(usuario.bio || "");
    setEditando(true);
  }

  async function salvarPerfil() {
    try {
      setSalvando(true);

      const dados = await apiRequest<Partial<MeuPerfil>>(
        "/usuarios/me",
        {
          method: "PUT",
          body: JSON.stringify({
            nome: nomeEditado.trim(),
            username: usernameEditado.trim(),
            bio: bioEditada.trim(),
          }),
        }
      );

      setUsuario((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          ...dados,
          nome: dados.nome ?? nomeEditado.trim(),
          username: dados.username ?? usernameEditado.trim(),
          bio: dados.bio ?? bioEditada.trim(),
        };
      });

      setEditando(false);
      window.dispatchEvent(new Event("usuarioAtualizado"));
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar perfil:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao editar perfil."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function enviarImagem(
    arquivo: File,
    tipo: "foto" | "capa"
  ) {
    if (!localStorage.getItem("token")) {
      window.location.href = "/login";
      return;
    }

    const formData = new FormData();
    formData.append("imagem", arquivo);
    formData.append("tipo", tipo);

    try {
      const dados = await apiRequest<{
        foto: string | null;
        capa: string | null;
      }>("/usuarios/me/imagem", {
        method: "PATCH",
        body: formData,
      });

      setUsuario((atual) => {
        if (!atual) return atual;

        return {
          ...atual,
          foto: dados.foto ?? atual.foto,
          capa: dados.capa ?? atual.capa,
        };
      });

      window.dispatchEvent(new Event("usuarioAtualizado"));
      toast.success("Imagem atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar imagem."
      );
    }
  }

  if (carregando) {
    return (
      <PageLayout>
        <PageContent>
          <p className="py-10 text-center text-sm text-[var(--cor-texto-discreto)]">
            Carregando perfil...
          </p>
        </PageContent>
      </PageLayout>
    );
  }

  if (!usuario) {
    return (
      <PageLayout>
        <PageContent>
          <p className="py-10 text-center text-sm text-[var(--cor-texto-discreto)]">
            Perfil não encontrado.
          </p>
        </PageContent>
      </PageLayout>
    );
  }

  return (
    <>
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[500px] rounded-xl border border-[var(--cor-borda-discreta)] bg-[#0d121c] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-[20px] text-[var(--cor-texto-principal)]">
                Editar perfil
              </h2>

              <button
                type="button"
                onClick={() => setEditando(false)}
                className="cursor-pointer text-gray-500 transition hover:text-[var(--cor-texto-principal)]"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block font-serif text-[13px] text-[var(--cor-texto-cinza-400)]">
                  Nome
                </label>

                <input
                  type="text"
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="w-full rounded-lg border border-[var(--cor-borda-discreta)] bg-[#0b0e16] px-3 py-2 text-[14px] text-[var(--cor-texto-principal)] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-serif text-[13px] text-[var(--cor-texto-cinza-400)]">
                  Username
                </label>

                <input
                  type="text"
                  value={usernameEditado}
                  onChange={(e) => setUsernameEditado(e.target.value)}
                  className="w-full rounded-lg border border-[var(--cor-borda-discreta)] bg-[#0b0e16] px-3 py-2 text-[14px] text-[var(--cor-texto-principal)] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-serif text-[13px] text-[var(--cor-texto-cinza-400)]">
                  Bio
                </label>

                <textarea
                  value={bioEditada}
                  onChange={(e) => setBioEditada(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[var(--cor-borda-discreta)] bg-[#0b0e16] px-3 py-2 text-[14px] text-[var(--cor-texto-principal)] outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="cursor-pointer rounded-lg border border-[var(--cor-borda-discreta)] px-4 py-2 font-serif text-[12px] text-[var(--cor-texto-cinza-300)] transition hover:border-gray-500"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarPerfil}
                disabled={salvando}
                className="cursor-pointer rounded-lg bg-[#5ea3ee] px-4 py-2 font-serif text-[12px] text-[var(--cor-texto-principal)] transition hover:bg-[#7ab4f2] disabled:opacity-50"
              >
                {salvando ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {imagemParaRecortar && (
        <ImageCropModal
          imagem={imagemParaRecortar.url}
          tipo={imagemParaRecortar.tipo}
          onCancelar={fecharRecorte}
          onConfirmar={async (arquivoRecortado) => {
            await enviarImagem(
              arquivoRecortado,
              imagemParaRecortar.tipo
            );

            fecharRecorte();
          }}
        />
      )}

      <PageLayout>
        <PageContent>
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="min-w-0">
              <div className="sticky top-0 z-20 bg-[var(--cor-fundo)]">
                <div className="w-full max-w-[800px] pb-6 pt-6">
                  <SearchBar />
                </div>
              </div>

              {/* Título da página */}
              <div className="mb-6 flex items-center gap-4">
                <div className="min-w-0">
                  <h1 className="font-serif text-[26px] text-[var(--cor-texto-cinza-100)]">
                    {usuario.nome}
                  </h1>

                  <p className="mt-1 truncate font-serif text-[13px] text-[var(--cor-texto-discreto)]">
                    Músicas e publicações de @{usuario.username}
                  </p>
                </div>
              </div>

              {/* Cabeçalho do perfil */}
              <section className="w-full overflow-hidden rounded-2xl border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie-profunda)]">
                {/* Capa */}
                <div
                  className="relative h-36 bg-gradient-to-br from-[#172a43] via-[#142033] to-[#0C121D] bg-cover bg-center sm:h-44"
                  style={
                    usuario.capa
                      ? { backgroundImage: `url("${usuario.capa}")` }
                      : undefined
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C121D]/80 to-transparent" />

                  <input
                    ref={capaInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];

                      if (arquivo) abrirRecorte(arquivo, "capa");

                      e.target.value = "";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => capaInputRef.current?.click()}
                    className="absolute right-4 top-4 z-10 flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-[var(--cor-fundo)]/70 px-3 py-2 text-sm text-[var(--cor-texto-cinza-200)] backdrop-blur-sm transition hover:border-[var(--cor-destaque)] hover:text-[var(--cor-destaque)]"
                  >
                    <CameraIcon size={18} />
                    Alterar capa
                  </button>
                </div>

                {/* Informações e ações */}
                <div className="px-5 pb-6 sm:px-6">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                    {/* Foto e identificação */}
                    <div className="flex min-w-0 items-end gap-4">
                      <div className="relative z-0 -mt-12 h-[88px] w-[88px] shrink-0 sm:h-24 sm:w-24">
                        <input
                          ref={fotoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const arquivo = e.target.files?.[0];

                            if (arquivo) abrirRecorte(arquivo, "foto");

                            e.target.value = "";
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => fotoInputRef.current?.click()}
                          aria-label="Alterar foto de perfil"
                          className="group relative h-full w-full cursor-pointer overflow-hidden rounded-full border-4 border-[#0C121D] bg-[#192538]"
                        >
                          {usuario.foto ? (
                            <img
                              src={usuario.foto}
                              alt={`Foto de ${usuario.nome}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserIcon size={38} className="text-[#8793a8]" />
                            </div>
                          )}

                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[var(--cor-texto-principal)] opacity-0 transition group-hover:opacity-100">
                            <CameraIcon size={22} />
                          </span>
                        </button>
                      </div>

                      <div className="min-w-0 pb-1">
                        <h2 className="break-words text-lg font-semibold text-[var(--cor-texto-principal)]">
                          {usuario.nome}
                        </h2>

                        <p className="text-sm text-[#8793a8]">
                          @{usuario.username}
                        </p>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={compartilharPerfil}
                        aria-label="Compartilhar perfil"
                        className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--cor-borda)] px-3 py-2 text-sm text-[var(--cor-texto-cinza-300)] transition hover:border-[var(--cor-destaque)] hover:text-[var(--cor-destaque)]"
                      >
                        <ShareNetworkIcon size={18} />
                        <span>Compartilhar</span>
                      </button>

                      <button
                        type="button"
                        onClick={abrirEdicao}
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--cor-destaque)] px-3 py-2 text-sm text-[var(--cor-tinta)] transition hover:bg-[#80c0fa]"
                      >
                        <PencilSimpleIcon size={18} />
                        Editar perfil
                      </button>
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--cor-texto-cinza-300)]">
                    {usuario.bio || (
                      <span className="italic text-[var(--cor-texto-discreto)]">
                        Este usuário ainda não adicionou uma bio.
                      </span>
                    )}
                  </p>

                  {/* Contadores */}
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--cor-borda-suave)] pt-5 text-sm text-[#8793a8]">
                    <Link
                      to={`/usuarios/${usuario.id}/seguidores?nome=${encodeURIComponent(usuario.nome)}&username=${encodeURIComponent(usuario.username)}`}
                      className="transition hover:text-[var(--cor-destaque)]"
                    >
                      <strong className="text-[var(--cor-texto-principal)]">
                        {usuario._count?.seguidores ?? 0}
                      </strong>{" "}
                      Seguidores
                    </Link>

                    <Link
                      to={`/usuarios/${usuario.id}/seguindo?nome=${encodeURIComponent(usuario.nome)}&username=${encodeURIComponent(usuario.username)}`}
                      className="transition hover:text-[var(--cor-destaque)]"
                    >
                      <strong className="text-[var(--cor-texto-principal)]">
                        {usuario._count?.seguindo ?? 0}
                      </strong>{" "}
                      Seguindo
                    </Link>

                    <div className="flex items-center gap-2">
                      <MusicNoteIcon size={17} />

                      <span>
                        <strong className="text-[var(--cor-texto-principal)]">
                          {usuario._count?.posts ?? avaliacoes.length}
                        </strong>{" "}
                        Avaliações
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ABAS */}
              <div className="mt-8 border-b border-[var(--cor-borda-discreta)]">
                <div className="flex gap-8 overflow-x-auto">
                  <button
                    type="button"
                    onClick={() => setAba("avaliacoes")}
                    className={`shrink-0 cursor-pointer border-b-2 px-1 pb-3 font-serif text-[14px] transition ${aba === "avaliacoes"
                      ? "border-blue-400 text-[var(--cor-texto-principal)]"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Últimas avaliações
                  </button>

                  <button
                    type="button"
                    onClick={() => setAba("comentarios")}
                    className={`shrink-0 cursor-pointer border-b-2 px-1 pb-3 font-serif text-[14px] transition ${aba === "comentarios"
                      ? "border-blue-400 text-[var(--cor-texto-principal)]"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Comentários
                  </button>

                  <button
                    type="button"
                    onClick={() => setAba("curtidos")}
                    className={`shrink-0 cursor-pointer border-b-2 px-1 pb-3 font-serif text-[14px] transition ${aba === "curtidos"
                      ? "border-blue-400 text-[var(--cor-texto-principal)]"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Curtidos
                  </button>

                  <button
                    type="button"
                    onClick={() => setAba("salvos")}
                    className={`shrink-0 cursor-pointer border-b-2 px-1 pb-3 font-serif text-[14px] transition ${aba === "salvos"
                      ? "border-blue-400 text-[var(--cor-texto-principal)]"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Músicas salvas
                  </button>

                </div>
              </div>

              <div className="flex flex-col gap-6 pt-6">
                {/* AVALIAÇÕES */}
                {aba === "avaliacoes" && (
                  <>
                    <div className="flex items-center gap-2">
                      <MusicNoteIcon
                        size={18}
                        className="text-blue-400"
                      />

                      <h2 className="font-serif text-[18px] text-[var(--cor-texto-cinza-100)]">
                        Últimas avaliações
                      </h2>
                    </div>

                    {avaliacoes.filter((post) => post.musica?.id != null)
                      .length > 0 ? (
                      avaliacoes
                        .filter((post) => post.musica?.id != null)
                        .map((post) => (
                          <PostCard
                            key={post.id}
                            postId={post.id}
                            name={post.usuario?.nome ?? usuario.nome}
                            username={post.usuario?.username ?? usuario.username}
                            foto={post.usuario?.foto ?? undefined}
                            time={post.dataCriacao}
                            content={post.texto ?? ""}
                            nota={post.nota}
                            editado={post.editado}
                            musicId={post.musica!.id}
                            musicTitle={post.musica?.titulo ?? "Música indisponível"}
                            artist={post.musica?.artista?.nome ?? "Artista desconhecido"}
                            artistId={post.musica?.artista?.id}
                            musicCover={post.musica?.capa ?? undefined}
                            duracaoSegundos={post.musica?.duracaoSegundos}
                            likes={post._count?.curtidas ?? 0}
                            comments={post._count?.comentarios ?? 0}
                            avaliacoes={post.musica?._count?.posts ?? 0}
                            curtidoPorMim={post.curtidoPorMim ?? false}


                            ehMeuPost={
                              usuarioLogadoId !== null &&
                              post.usuario?.id === usuarioLogadoId
                            }
                          />
                        ))
                    ) : (
                      <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                        Nenhuma avaliação feita.
                      </p>
                    )}
                  </>
                )}

                {/* COMENTÁRIOS */}
                {aba === "comentarios" && (
                  <>
                    <div className="flex items-center gap-2">
                      <ChatCircleIcon
                        size={18}
                        className="text-blue-400"
                      />

                      <h2 className="font-serif text-[18px] text-[var(--cor-texto-cinza-100)]">
                        Comentários
                      </h2>
                    </div>

                    {comentarios.length > 0 ? (
                      comentarios.map((comentario) => (
                        <ComentarioPerfilCard
                          key={comentario.id}
                          comentario={comentario}
                        />
                      ))
                    ) : (
                      <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
                        Nenhum comentário feito.
                      </p>
                    )}
                  </>
                )}

                {/* POSTS CURTIDOS */}
                {aba === "curtidos" && (
                  <>
                    <div className="flex items-center gap-2">
                      <ChatCircleIcon size={18} className="text-blue-400" />

                      <h2 className="font-serif text-[18px] text-[var(--cor-texto-cinza-100)]">
                        Posts curtidos
                      </h2>
                    </div>

                    {curtidos.filter((post) => post.musica?.id != null).length > 0 ? (
                      curtidos
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
                            nota={post.nota}
                            editado={post.editado}
                            musicId={post.musica!.id}
                            musicTitle={post.musica?.titulo ?? "Música indisponível"}
                            artist={post.musica?.artista?.nome ?? "Artista desconhecido"}
                            artistId={post.musica?.artista?.id}
                            musicCover={post.musica?.capa ?? undefined}
                            duracaoSegundos={post.musica?.duracaoSegundos}
                            likes={post._count?.curtidas ?? 0}
                            comments={post._count?.comentarios ?? 0}
                            avaliacoes={post.musica?.avaliacoes}
                            curtidoPorMim={post.curtidoPorMim ?? true}
                            ehMeuPost={
                              usuarioLogadoId !== null &&
                              post.usuario?.id === usuarioLogadoId
                            }
                            onUnlike={() => removerDosCurtidos(post.id)}
                          />
                        ))
                    ) : (
                      <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
                        Você ainda não curtiu nenhuma publicação.
                      </p>
                    )}
                  </>
                )}

                {/* MÚSICAS SALVAS */}
                {aba === "salvos" && (
                  <>
                    <div className="flex items-center gap-2">
                      <BookmarkSimpleIcon
                        size={18}
                        className="text-blue-400"
                      />

                      <h2 className="font-serif text-[18px] text-[var(--cor-texto-cinza-100)]">
                        Músicas salvas
                      </h2>
                    </div>

                    {salvos.length > 0 ? (
                      salvos.map((salvo) => {
                        const musica = salvo.musica;

                        if (!musica) return null;

                        return (
                          <MusicCard
                            key={musica.id}
                            id={musica.id}
                            tipo="post"
                            titulo={musica.titulo}
                            artista={musica.artista?.nome}
                            artistaId={musica.artista?.id}
                            capa={musica.capa ?? undefined}
                            nota={musica.nota}
                            avaliacoes={musica._count?.posts ?? musica.avaliacoes ?? 0}
                            duracaoSegundos={musica.duracaoSegundos}
                            onRemover={() => {
                              setSalvos((atuais) =>
                                atuais.filter(
                                  (item) => item.musica?.id !== musica.id
                                )
                              );
                            }}
                          />
                        );
                      })
                    ) : (
                      <p className="py-8 text-center text-[14px] text-[var(--cor-texto-discreto)]">
                        Nenhuma música salva.
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* RECOMENDAÇÕES */}
            <aside className="hidden xl:block">
              <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
                <h2 className="mb-5 font-serif text-[16px] text-[var(--cor-texto-principal)]">
                  Músicas recomendadas
                </h2>

                <div className="flex flex-col gap-3">

                  <RecommendedMusicList />

                </div>
              </div>
            </aside>
          </div>
        </PageContent>
      </PageLayout>
    </>
  );
}
