import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
} from "lucide-react";
import { StarIcon, UserIcon } from "@phosphor-icons/react";

import MusicCard from "./musicCard";
import PostModals from "./postModals";
import { useCurtida } from "../hooks/useCurtida";
import calcularTempo from "../calcularTempo";
import {
  editarPost,
  excluirPost,
  denunciarPost,
} from "../services/postService";
import { buscarMeuPerfil } from "../services/usuarioService";
import toast from "react-hot-toast";

interface PostCardProps {
  postId?: number;
  name?: string | null;
  username?: string | null;
  foto?: string | null;
  time: string;
  content?: string | null;
  nota?: number;
  musicId: number;
  musicTitle: string;
  artist?: string | null;
  artistId?: number;
  musicCover?: string | null;
  duracaoSegundos?: number;
  likes?: number;
  comments?: number;
  avaliacoes?: number;
  curtidoPorMim?: boolean;
  ehMeuPost?: boolean;
  onUnlike?: () => void;
  modoNotificacao?: boolean;
}

type ModalAcao = "excluir" | "denunciar" | "mensagem" | null;

export default function PostCard({
  postId,
  name,
  username,
  foto,
  time,
  content,
  nota,
  musicId,
  musicTitle,
  artist,
  artistId,
  musicCover,
  duracaoSegundos,
  likes = 0,
  comments = 0,
  avaliacoes,
  curtidoPorMim = false,
  ehMeuPost = false,
  onUnlike,
  modoNotificacao = false,
}: PostCardProps) {
  const navigate = useNavigate();

  const [animando, setAnimando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [postOculto, setPostOculto] = useState(false);
  const [salvandoAcao, setSalvandoAcao] = useState(false);

  const [textoAtual, setTextoAtual] = useState(content ?? "");
  const [notaAtual, setNotaAtual] = useState(nota ?? 0);
  const [textoEditado, setTextoEditado] = useState(content ?? "");
  const [notaEditada, setNotaEditada] = useState(nota ?? 0);

  const [modalAcao, setModalAcao] = useState<ModalAcao>(null);
  const [motivoDenuncia, setMotivoDenuncia] = useState("");
  const [mensagemModal, setMensagemModal] = useState("");
  const [meuUsername, setMeuUsername] = useState<string | null>(null);

  const {
    curtido,
    quantidadeCurtidas,
    carregandoCurtida,
    alternarCurtida,
  } = useCurtida({
    postId,
    likes,
    curtidoPorMim,
  });

  useEffect(() => {
    let ativo = true;

    buscarMeuPerfil()
      .then((perfil) => {
        if (ativo) setMeuUsername(perfil.username);
      })
      .catch(() => {
        if (ativo) setMeuUsername(null);
      });

    return () => {
      ativo = false;
    };
  }, []);

  function abrirPerfil() {
    const usernameDestino = username?.trim();

    if (!usernameDestino) return;

    const meuUsernameNormalizado = meuUsername?.trim().toLowerCase();
    const destinoNormalizado = usernameDestino.toLowerCase();

    if (
      meuUsernameNormalizado &&
      destinoNormalizado === meuUsernameNormalizado
    ) {
      navigate("/perfil");
      return;
    }

    navigate(`/u/${encodeURIComponent(usernameDestino)}`);
  }

  async function handleCurtir() {
    if (carregandoCurtida || postId === undefined) return;

    // Guarda o estado antes de alternar a curtida.
    const estavaCurtido = curtido;

    try {
      await alternarCurtida();

      // Se estava curtido, o usuário acabou de descurtir.
      if (estavaCurtido) {
        onUnlike?.();
      }

      setAnimando(false);

      requestAnimationFrame(() => setAnimando(true));

      window.setTimeout(() => setAnimando(false), 350);
    } catch (error) {
      console.error("Erro ao alternar curtida:", error);
    }
  }

  function abrirComentarios() {
    if (postId !== undefined) {
      navigate(`/post/${postId}#comentar`);
    }
  }

  async function handleEditar() {
    if (postId === undefined || salvandoAcao) return;

    try {
      setSalvandoAcao(true);

      const novoTexto = textoEditado.trim();

      await editarPost(postId, {
        texto: novoTexto || null,
        nota: notaEditada,
      });

      setTextoAtual(novoTexto);
      setNotaAtual(notaEditada);
      setEditando(false);
    } catch (error) {
      setMensagemModal(
        error instanceof Error
          ? error.message
          : "Não foi possível editar a publicação."
      );
      setModalAcao("mensagem");
    } finally {
      setSalvandoAcao(false);
    }
  }

  async function handleExcluir() {
    if (postId === undefined || salvandoAcao) return;

    try {
      setSalvandoAcao(true);

      await excluirPost(postId);

      setPostOculto(true);
      setModalAcao(null);
    } catch (error) {
      setMensagemModal(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a publicação."
      );
      setModalAcao("mensagem");
    } finally {
      setSalvandoAcao(false);
      setMenuAberto(false);
    }
  }

  function handleDenunciar() {
    if (!motivoDenuncia.trim()) {
      toast.error("Informe o motivo da denúncia.");
      return;
    }

    setMotivoDenuncia("");
    setModalAcao(null);
    setMenuAberto(false);

    toast.success("Sua denúncia foi enviada.");
  }

  function EstrelaNota({
    estrela,
    nota: valorNota,
    onClick,
  }: {
    estrela: number;
    nota: number;
    onClick?: (valor: number) => void;
  }) {
    const preenchimento =
      valorNota >= estrela ? 100 : valorNota >= estrela - 0.5 ? 50 : 0;

    return (
      <div className="relative h-[22px] w-[22px] shrink-0">
        <StarIcon
          size={22}
          weight="regular"
          className="absolute inset-0 text-[#52627c]"
        />

        {preenchimento > 0 && (
          <div
            className="absolute left-0 top-0 h-[22px] overflow-hidden"
            style={{ width: `${preenchimento}%` }}
          >
            <StarIcon
              size={22}
              weight="fill"
              className="absolute left-0 top-0 text-[#5ba4e8]"
            />
          </div>
        )}

        {onClick && (
          <>
            <button
              type="button"
              aria-label={`Dar nota ${estrela - 0.5}`}
              onClick={() => onClick(estrela - 0.5)}
              className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
            />
            <button
              type="button"
              aria-label={`Dar nota ${estrela}`}
              onClick={() => onClick(estrela)}
              className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
            />
          </>
        )}
      </div>
    );
  }

  if (postOculto) return null;

  return (
    <article
      onClick={(event) => {
        const alvo = event.target as HTMLElement;

        if (alvo.closest("a, button, textarea, input, form")) return;

        if (postId !== undefined) {
          navigate(`/post/${postId}`);
        }
      }}
      className="cursor-pointer rounded-xl border border-[#354052] bg-[#111420] p-4 transition-colors hover:border-[#46536a]"
    >
      {/* Cabeçalho da publicação */}
      <div className="mb-4 flex items-start gap-3">
        <button
          type="button"
          aria-label={`Abrir perfil de ${name || "usuário"}`}
          onClick={(event) => {
            event.stopPropagation();
            abrirPerfil();
          }}
          disabled={!username}
          className="shrink-0 cursor-pointer disabled:cursor-default"
        >
          {foto ? (
            <img
              src={foto}
              alt={name || "Foto de perfil"}
              className="h-11 w-11 rounded-full border border-[#354052] object-cover transition-opacity hover:opacity-80"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[#354052] bg-[#202737]">
              <UserIcon size={23} className="text-[#9aa6ba]" />
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex cursor-pointer flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                abrirPerfil();
              }}
              disabled={!username}
              className="max-w-full truncate text-left text-sm hover:underline font-semibold text-[#E4EFFF]"
            >
              {name || "Usuário"}
            </button>

            {username && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  abrirPerfil();
                }}
                className="truncate text-xs text-[#718096]"
              >
                @{username}
              </button>
            )}
          </div>

          <p className="mt-1 text-xs text-[#697386]">
            há {calcularTempo(time)}
          </p>
        </div>


        {/* Menu de opções */}
        {!modoNotificacao && (
          <div className="relative shrink-0">

            <button
              type="button"
              aria-label="Opções da publicação"
              aria-expanded={menuAberto}
              onClick={(event) => {
                event.stopPropagation();
                setMenuAberto((aberto) => !aberto);
              }}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#697386] transition-colors hover:bg-[#202737] hover:text-white"
            >
              <MoreHorizontal size={20} />
            </button>

            {menuAberto && (
              <>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuAberto(false);
                  }}
                  className="fixed inset-0 z-30 cursor-default"
                />

                <div
                  onClick={(event) => event.stopPropagation()}
                  className="absolute right-0 top-9 z-40 w-48 overflow-hidden rounded-lg border border-[#354052] bg-[#171c29] py-1 shadow-xl"
                >

                  {ehMeuPost && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setTextoEditado(textoAtual);
                          setNotaEditada(notaAtual);
                          setEditando(true);
                          setMenuAberto(false);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[13px] text-[#d4d9e2] hover:bg-[#252d3c]"
                      >
                        <Pencil size={15} />
                        Editar publicação
                      </button>

                      <button
                        type="button"
                        disabled={salvandoAcao}
                        onClick={() => {
                          setMenuAberto(false);
                          setModalAcao("excluir");
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[13px] text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Excluir publicação
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    disabled={salvandoAcao}
                    onClick={() => {
                      setMenuAberto(false);
                      setMotivoDenuncia("");
                      setModalAcao("denunciar");
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-[13px] text-[#d4d9e2] hover:bg-[#252d3c] disabled:opacity-50"
                  >
                    <Flag size={15} />
                    Denunciar publicação
                  </button>

                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Formulário de edição */}
      {editando && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleEditar();
          }}
          onClick={(event) => event.stopPropagation()}
          className="mb-4 space-y-4 rounded-lg border border-[#354052] bg-[#0C121D] p-3"
        >
          <label className="block text-sm text-[#d4d9e2]">
            Texto da publicação
            <textarea
              value={textoEditado}
              onChange={(event) => setTextoEditado(event.target.value)}
              rows={3}
              className="mt-2 w-full resize-y rounded-md border border-[#354052] bg-[#111420] p-2 text-sm text-white outline-none focus:border-[#58AAF0]"
            />
          </label>

          <div>
            <p className="mb-2 text-sm text-[#d4d9e2]">Sua nota</p>

            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <EstrelaNota
                    key={estrela}
                    estrela={estrela}
                    nota={notaEditada}
                    onClick={setNotaEditada}
                  />
                ))}
              </div>

              <span className="text-sm font-medium text-[#b5bbc5]">
                {notaEditada.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="cursor-pointer rounded-md px-3 py-2 text-sm text-[#a0aabc] hover:bg-[#202737]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvandoAcao}
              className="cursor-pointer rounded-md bg-[#58AAF0] px-3 py-2 text-sm font-medium text-[#080A10] disabled:opacity-50"
            >
              {salvandoAcao ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}

      {/* Nota da avaliação */}
      {notaAtual > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((estrela) => (
              <EstrelaNota
                key={estrela}
                estrela={estrela}
                nota={notaAtual}
              />
            ))}
          </div>

          <span className="text-xs font-medium text-[#b5bbc5]">
            {notaAtual.toFixed(1)}
          </span>
        </div>
      )}

      {/* Texto da publicação */}
      {textoAtual && (
        <p className="mb-4 whitespace-pre-wrap break-words text-sm leading-6 text-[#d1d5db]">
          {textoAtual}
        </p>
      )}

      {/* Música avaliada */}
      <div
        onClick={(event) => {
          event.stopPropagation();
          navigate(`/musica/${musicId}`);
        }}
        className="cursor-pointer"
      >
        <MusicCard
          id={musicId}
          tipo="post"
          titulo={musicTitle}
          artista={artist || ""}
          artistaId={artistId}
          capa={musicCover}
          nota={notaAtual}
          avaliacoes={avaliacoes}
          duracaoSegundos={duracaoSegundos}
        />
      </div>

      {/* Curtidas e comentários */}
      {!modoNotificacao && (
        <div className="mt-4 flex items-center border-t border-[#252d3c] pt-3 text-[#697386]">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleCurtir();
              }}
              disabled={carregandoCurtida || postId === undefined}
              aria-label={curtido ? "Descurtir avaliação" : "Curtir avaliação"}
              aria-pressed={curtido}
              className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-pink-400 disabled:cursor-wait"
            >
              <Heart
                key={`${curtido}-${animando}`}
                size={17}
                fill={curtido ? "currentColor" : "none"}
                className={[
                  "transition-colors duration-200",
                  curtido ? "text-pink-500" : "",
                  animando ? "animate-heart-pop" : "",
                ].join(" ")}
              />
              <span className="text-xs">{quantidadeCurtidas}</span>
            </button>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                abrirComentarios();
              }}
              disabled={postId === undefined}
              aria-label="Comentar nesta publicação"
              className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-[#58AAF0] disabled:cursor-not-allowed"
            >
              <MessageCircle size={17} />
              <span className="text-xs">{comments}</span>
            </button>
          </div>
        </div>
      )}

      {/* Modais de confirmação e denúncia */}
      <PostModals
        modalAcao={modalAcao}
        setModalAcao={setModalAcao}
        motivoDenuncia={motivoDenuncia}
        setMotivoDenuncia={setMotivoDenuncia}
        mensagemModal={mensagemModal}
        salvandoAcao={salvandoAcao}
        onExcluir={handleExcluir}
        onDenunciar={handleDenunciar}
      />
    </article>
  );
}
