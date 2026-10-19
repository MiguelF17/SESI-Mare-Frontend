import {
  BookmarkSimpleIcon,
  CameraIcon,
  ChatCircleIcon,
  MusicNoteIcon,
  PencilSimpleIcon,
  ShareNetworkIcon,
  UserIcon,
} from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import RecommendedMusic from "../components/recommendedMusic";
import { useEffect, useState, useRef } from "react";
import { API_URL } from "../api";
import calcularTempo from "../calcularTempo";
import MusicCard from "../components/musicCard";
import ImageCropModal from "../components/imageCropModal";
import toast from "react-hot-toast";

interface Usuario {
  id: number;
  nome: string;
  username: string;
  email: string;
  foto: string | null;
  capa: string | null;
  bio: string | null;

  _count: {
    seguidores: number;
    seguindo: number;
    posts: number;
    comentarios: number;
    salvamentos: number;
  };
}

export default function Perfil() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [aba, setAba] = useState("avaliacoes");
  const [carregando, setCarregando] = useState(true);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [salvos, setSalvos] = useState<any[]>([]);

  /* editar */
  const [editando, setEditando] = useState(false);
  const [nomeEditado, setNomeEditado] = useState("");
  const [usernameEditado, setUsernameEditado] = useState("");
  const [bioEditada, setBioEditada] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [musicas, setMusicas] = useState<any[]>([]);
  const fotoInputRef = useRef<HTMLInputElement>(null);
  const capaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    buscarPerfil();
    buscarAvaliacoes();
    buscarComentarios();
    buscarSalvos();
  }, []);

  const [imagemParaRecortar, setImagemParaRecortar] = useState<{
    url: string;
    tipo: "foto" | "capa";
  } | null>(null);

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

  /* informacoes perfil */
  async function buscarPerfil() {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const resposta = await fetch(`${API_URL}/usuarios/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resposta.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");

        window.location.href = "/login";
        return;
      }

      if (!resposta.ok) {
        throw new Error("Erro ao buscar perfil");
      }

      const dados = await resposta.json();

      setUsuario(dados);
    } catch (error) {
      console.error(error);
    } finally {
      setCarregando(false);
    }
  }

  /* buscar avaliacoes */
  async function buscarAvaliacoes() {
    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch(`${API_URL}/usuarios/me/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (resposta.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        window.location.href = "/login";
        return;
      }

      if (!resposta.ok) {
        throw new Error("Erro ao buscar avaliações");
      }

      const dados = await resposta.json();

      setAvaliacoes(dados);
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarComentarios() {
    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch(`${API_URL}/usuarios/me/comentarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao buscar comentários");
      }

      const dados = await resposta.json();

      setComentarios(dados);
    } catch (error) {
      console.error(error);
    }
  }

  async function buscarSalvos() {
    try {
      const token = localStorage.getItem("token");

      const resposta = await fetch(`${API_URL}/usuarios/me/salvos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        throw new Error("Erro ao buscar músicas salvas");
      }

      const dados = await resposta.json();

      setSalvos(dados);
    } catch (error) {
      console.error(error);
    }
  }

  async function compartilharPerfil() {
    if (!usuario) {
      return;
    }

    if (!navigator.share) {
      alert("O compartilhamento não está disponível neste navegador.");
      return;
    }

    try {
      await navigator.share({
        title: `Perfil de ${usuario.nome}`,
        text: `Confira o perfil de @${usuario.username} no Maré`,
        url: window.location.href,
      });
    } catch (error) {
      console.error(error);
    }
  }

  function abrirEdicao() {
    if (!usuario) {
      return;
    }

    setNomeEditado(usuario.nome);
    setUsernameEditado(usuario.username);
    setBioEditada(usuario.bio || "");

    setEditando(true);
  }

  async function salvarPerfil() {
    try {
      setSalvando(true);

      const token = localStorage.getItem("token");

      const resposta = await fetch(`${API_URL}/usuarios/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeEditado,
          username: usernameEditado,
          bio: bioEditada,
        }),
      });

      if (!resposta.ok) {
        const erro = await resposta.json();

        alert(erro.error || "Erro ao editar perfil");
        return;
      }

      const dados = await resposta.json();

      setUsuario((usuarioAtual) => {
        if (!usuarioAtual) {
          return usuarioAtual;
        }

        return {
          ...usuarioAtual,
          ...dados,
        };
      });

      setEditando(false);
    } catch (error) {
      console.error(error);
      alert("Erro ao editar perfil");
    } finally {
      setSalvando(false);
    }
  }

  async function enviarImagem(
    arquivo: File,
    tipo: "foto" | "capa"
  ) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        window.location.href = "/login";
        return;
      }

      const formData = new FormData();

      formData.append("imagem", arquivo);
      formData.append("tipo", tipo);

      const resposta = await fetch(`${API_URL}/usuarios/me/imagem`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro || "Erro ao atualizar imagem");
        return;
      }

      setUsuario((usuarioAtual) => {
        if (!usuarioAtual) {
          return usuarioAtual;
        }

        return {
          ...usuarioAtual,
          foto: dados.foto,
          capa: dados.capa,
        };
      });
      window.dispatchEvent(new Event("usuarioAtualizado"));
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao atualizar imagem");
    }
  }

  if (carregando) {
    return <div className="text-white">Carregando perfil...</div>;
  }

  if (!usuario) {
    return <div className="text-white">Perfil não encontrado.</div>;
  }

  return (
    <>
      {editando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-[500px] rounded-xl border border-[#252d38] bg-[#0d121c] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-[20px] text-white">
                Editar perfil
              </h2>

              <button
                type="button"
                onClick={() => setEditando(false)}
                className="text-gray-500 transition cursor-pointer hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="mb-2 block font-serif text-[13px] text-gray-400">
                  Nome
                </label>

                <input
                  type="text"
                  value={nomeEditado}
                  onChange={(e) => setNomeEditado(e.target.value)}
                  className="w-full rounded-lg border border-[#252d38] bg-[#0b0e16] px-3 py-2 text-[14px] text-white outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-serif text-[13px] text-gray-400">
                  Username
                </label>

                <input
                  type="text"
                  value={usernameEditado}
                  onChange={(e) => setUsernameEditado(e.target.value)}
                  className="w-full rounded-lg border border-[#252d38] bg-[#0b0e16] px-3 py-2 text-[14px] text-white outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block font-serif text-[13px] text-gray-400">
                  Bio
                </label>

                <textarea
                  value={bioEditada}
                  onChange={(e) => setBioEditada(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#252d38] bg-[#0b0e16] px-3 py-2 text-[14px] text-white outline-none focus:border-blue-400"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="rounded-lg border cursor-pointer border-[#252d38] px-4 py-2 font-serif text-[12px] text-gray-300 transition hover:border-gray-500"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={salvarPerfil}
                disabled={salvando}
                className="rounded-lg cursor-pointer bg-[#5ea3ee] px-4 py-2 font-serif text-[12px] text-white transition hover:bg-[#7ab4f2] disabled:opacity-50"
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
            await enviarImagem(arquivoRecortado, imagemParaRecortar.tipo);
            fecharRecorte();
          }}
        />
      )}

      <PageLayout>
        <PageContent>
          {/* COLUNAS */}
          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
            {/* COLUNA PRINCIPAL */}
            <section className="min-w-0">
              {/* ÁREA FIXA */}
              <div className="sticky top-0 z-20 bg-[#080A10]">
                <div className="w-full max-w-[800px] pt-6 pb-6">
                  <SearchBar />
                </div>
              </div>

              {/* TÍTULO */}
              <div className="mb-6">
                <h1 className="font-serif text-[26px] text-gray-100">Perfil</h1>

                <p className="mt-1 font-serif text-[13px] text-[#697386]">
                  Suas músicas e publicações
                </p>
              </div>

              {/* PERFIL */}
              <section className="w-full overflow-hidden rounded-xl border border-[#252d38] bg-[#0d121c]">
                {/* CAPA */}
                <div
                  className="relative h-[140px] bg-[#141a28]"
                  style={
                    usuario.capa
                      ? {
                        backgroundImage: `url(${usuario.capa})`,
                      }
                      : undefined
                  }
                >

                  <input
                    ref={capaInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    style={
                      usuario.capa
                        ? {
                          backgroundImage: `url(${usuario.capa})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }
                        : undefined
                    }
                    onChange={(e) => {
                      const arquivo = e.target.files?.[0];

                      if (arquivo) {
                        abrirRecorte(arquivo, "capa");
                      }

                      e.target.value = "";
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => capaInputRef.current?.click()}
                    className="absolute right-4 top-4 flex cursor-pointer items-center gap-2 rounded-lg bg-[#111726]/20 px-3 py-2 font-serif text-[12px] text-white transition hover:text-blue-400"
                  >
                    <CameraIcon size={18} />
                    Alterar capa
                  </button>

                </div>

                {/* INFORMAÇÕES */}
                <div className="px-6 pb-6">
                  <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    {/* Avatar */}
                    <div className="flex items-end gap-4">

                      <div className="relative -mt-4 z-10 h-[82px] w-[82px] shrink-0">
                        <input
                          ref={fotoInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const arquivo = e.target.files?.[0];

                            if (arquivo) {
                              abrirRecorte(arquivo, "foto");
                            }

                            e.target.value = "";
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => fotoInputRef.current?.click()}
                          aria-label="Alterar foto de perfil"
                          className="group relative h-full w-full cursor-pointer overflow-hidden rounded-full border-4 border-[#0d121c] bg-[#1a2130]"
                        >
                          {usuario.foto ? (
                            <img
                              src={usuario.foto}
                              alt={usuario.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserIcon size={34} className="text-gray-400" />
                            </div>
                          )}

                          <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition group-hover:opacity-100">
                            <CameraIcon size={22} />
                          </span>
                        </button>
                      </div>


                      <div className="pb-1">
                        <div className="flex items-baseline">
                          <h2 className="font-serif text-[18px] text-gray-100">
                            {usuario.nome}
                          </h2>

                          <p className="ml-2 font-serif text-[16px] text-gray-500">
                            @{usuario.username}
                          </p>
                        </div>

                        <p className="mt-1 font-serif text-[12px] text-gray-500">
                          {usuario.bio || "Ainda não adicionou uma bio."}
                        </p>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={compartilharPerfil}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#252d38] px-4 py-2 font-serif text-[12px] text-gray-300 transition hover:border-blue-400 hover:text-blue-400"
                      >
                        <ShareNetworkIcon size={18} />
                        Compartilhar
                      </button>

                      <button
                        type="button"
                        onClick={abrirEdicao}
                        className="flex items-center gap-2 rounded-lg bg-[#5ea3ee] px-4 py-2 font-serif text-[12px] cursor-pointer text-white transition hover:bg-[#7ab4f2]"
                      >
                        <PencilSimpleIcon size={18} />
                        Editar perfil
                      </button>
                    </div>
                  </div>

                  {/* SEGUIDORES */}
                  <div className="mt-5 flex gap-6 font-serif text-[14px] text-gray-400">
                    <span>
                      <strong
                        className="text-gray-200"
                        style={{ fontFamily: "inter, sans-serif" }}
                      >
                        {usuario._count.seguidores}
                      </strong>{" "}
                      Seguidores
                    </span>

                    <span>
                      <strong
                        className="text-gray-200"
                        style={{ fontFamily: "inter, sans-serif" }}
                      >
                        {usuario._count.seguindo}
                      </strong>{" "}
                      Seguindo
                    </span>
                  </div>
                </div>
              </section>

              {/* Abas */}
              <div className="mt-8 border-b border-[#252d38]">
                <div className="flex gap-8">
                  <button
                    type="button"
                    onClick={() => setAba("avaliacoes")}
                    className={`border-b-2 px-1 pb-3 font-serif text-[14px] transition cursor-pointer ${aba === "avaliacoes"
                      ? "border-blue-400 text-white"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Últimas avaliações
                  </button>

                  <button
                    type="button"
                    onClick={() => setAba("comentarios")}
                    className={`border-b-2 px-1 pb-3 font-serif text-[14px] transition cursor-pointer ${aba === "comentarios"
                      ? "border-blue-400 text-white"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Comentários
                  </button>

                  <button
                    type="button"
                    onClick={() => setAba("salvos")}
                    className={`border-b-2 px-1 pb-3 font-serif text-[14px] transition cursor-pointer ${aba === "salvos"
                      ? "border-blue-400 text-white"
                      : "border-transparent text-gray-500 hover:text-blue-400"
                      }`}
                  >
                    Músicas salvas
                  </button>
                </div>
              </div>

              {/* Avaliações */}
              <div className="flex flex-col gap-6 pt-6">
                {aba === "avaliacoes" && (
                  <>
                    <div className="flex items-center gap-2">
                      <MusicNoteIcon size={18} className="text-blue-400" />

                      <h2 className="font-serif text-[18px] text-gray-100">
                        Últimas avaliações
                      </h2>
                    </div>

                    {avaliacoes.length > 0 ? (

                      avaliacoes.map((post) => (
                        <PostCard
                          key={post.id}
                          postId={post.id}
                          name={post.usuario?.nome ?? "Usuário"}
                          username={post.usuario?.username ?? ""}
                          foto={post.usuario?.foto}
                          time={post.dataCriacao}
                          content={post.texto ?? ""}
                          nota={post.nota}
                          musicId={post.musica?.id}
                          musicTitle={post.musica?.titulo ?? "Música indisponível"}
                          artist={post.musica?.artista?.nome ?? "Artista desconhecido"}
                          artistId={post.musica?.artista?.id}
                          musicCover={post.musica?.capa}
                          duracaoSegundos={post.musica?.duracaoSegundos}
                          likes={post._count?.curtidas ?? 0}
                          comments={post._count?.comentarios ?? 0}
                          avaliacoes={post.musica?._count?.posts ?? 0}
                        />
                      ))

                    ) : (
                      <p className="py-8 text-center text-[14px] text-[#697386]">
                        Nenhuma avaliação feita.
                      </p>
                    )}
                  </>
                )}

                {aba === "comentarios" && (
                  <>
                    <div className="flex items-center gap-2">
                      <ChatCircleIcon size={18} className="text-blue-400" />

                      <h2 className="font-serif text-[18px] text-gray-100">
                        Comentários
                      </h2>
                    </div>

                    {comentarios.length > 0 ? (
                      comentarios.map((comentario) => (
                        <div
                          key={comentario.id}
                          className="rounded-lg border border-[#354052] bg-[#111420] p-4"
                        >
                          <p className="text-[14px] leading-5 text-[#d1d5db]">
                            {comentario.texto}
                          </p>

                          <div className="mt-3">
                            <p className="text-[12px] text-[#697386]">
                              Em{" "}
                              <span className="text-[#d4d9e2]">
                                {comentario.post.musica.titulo}
                              </span>
                              {" — "}
                              {comentario.post.musica.artista.nome}
                            </p>

                            <p className="mt-1 text-[12px] text-[#697386]">
                              há {calcularTempo(comentario.dataCriacao)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-8 text-center text-[14px] text-[#697386]">
                        Nenhum comentário feito.
                      </p>
                    )}
                  </>
                )}

                {aba === "salvos" && (
                  <>
                    <div className="flex items-center gap-2">
                      <BookmarkSimpleIcon size={18} className="text-blue-400" />

                      <h2 className="font-serif text-[18px] text-gray-100">
                        Músicas salvas
                      </h2>
                    </div>

                    {salvos.length > 0 ? (

                      salvos.map((salvo) => {
                        const musica = salvo.musica;

                        return (
                          <MusicCard
                            key={musica.id}
                            id={musica.id}
                            tipo="post"
                            titulo={musica.titulo}
                            artista={musica.artista?.nome}
                            artistaId={musica.artista?.id}
                            capa={musica.capa}
                            nota={musica.nota}
                            avaliacoes={musica._count?.posts ?? 0}
                            duracaoSegundos={musica.duracaoSegundos}
                            onRemover={() => {
                              setSalvos((atuais) =>
                                atuais.filter(
                                  (salvamento) => salvamento.musica?.id !== musica.id
                                )
                              );
                            }}
                          />
                        );
                      })

                    ) : (
                      <p className="py-8 text-center text-[14px] text-[#697386]">
                        Nenhuma música salva.
                      </p>
                    )}
                  </>
                )}
              </div>
            </section>

            {/* RECOMENDAÇÕES */}
            <aside className="hidden xl:block">
              <div className="fixed top-2/5 -translate-y-2/5 w-[340px]">
                <h2 className="mb-5 font-serif text-[16px] text-white">
                  Músicas recomendadas
                </h2>

                <div className="flex flex-col gap-3">
                  {musicas.length > 0 ? (
                    musicas
                      .slice(0, 5)
                      .map((musica) => (
                        <RecommendedMusic
                          id={musica.id}
                          key={musica.id}
                          titulo={musica.titulo}
                          artist={musica.artista.nome}
                          capa={musica.capa}
                        />
                      ))
                  ) : (
                    <p className="py-8 text-center text-[14px] text-[#697386]">
                      Nenhuma música recomendada.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </PageContent>
      </PageLayout>
    </>
  );
}
