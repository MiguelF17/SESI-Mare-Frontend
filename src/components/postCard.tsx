import { useState } from "react";
import {
  Heart,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StarIcon, UserIcon } from "@phosphor-icons/react"
import MusicCard from "./musicCard";
import calcularTempo from "../calcularTempo";
import { useCurtida } from "../hooks/useCurtida";
import {
  editarPost,
  excluirPost,
  denunciarPost,
} from "../services/postService";
import PostModals, { type ModalAcao } from "./postModals";


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
}

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
  musicCover,
  artist,
  artistId,
  duracaoSegundos,
  likes = 0,
  comments = 0,
  avaliacoes,
  curtidoPorMim = false,
  ehMeuPost = false,
}: PostCardProps) {
  const navigate = useNavigate();

  const [animando, setAnimando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

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

  const [editando, setEditando] = useState(false);
  const [textoEditado, setTextoEditado] = useState(content ?? "");
  const [notaEditada, setNotaEditada] = useState(nota ?? 0);
  const [postOculto, setPostOculto] = useState(false);
  const [salvandoAcao, setSalvandoAcao] = useState(false);
  const [textoAtual, setTextoAtual] = useState(content ?? "");
  const [notaAtual, setNotaAtual] = useState(nota ?? 0);

  const [modalAcao, setModalAcao] = useState<
    "excluir" | "denunciar" | "mensagem" | null
  >(null);

  const [motivoDenuncia, setMotivoDenuncia] = useState("");
  const [mensagemModal, setMensagemModal] = useState("");

  function handleCurtir() {
    if (carregandoCurtida || postId === undefined) return;

    setAnimando(false);

    requestAnimationFrame(() => {
      setAnimando(true);
    });

    window.setTimeout(() => {
      setAnimando(false);
    }, 350);

    alternarCurtida();
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

      await editarPost(postId, {
        texto: textoEditado.trim() || null,
        nota: notaEditada,
      });

      setTextoAtual(textoEditado.trim());
      setNotaAtual(notaEditada);
      setEditando(false);
      setMenuAberto(false);
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

  async function handleDenunciar() {
    if (postId === undefined || salvandoAcao) return;

    if (!motivoDenuncia.trim()) {
      setMensagemModal("Informe o motivo da denúncia.");
      setModalAcao("mensagem");
      return;
    }

    try {
      setSalvandoAcao(true);

      await denunciarPost(postId, motivoDenuncia.trim());

      setMensagemModal("Sua denúncia foi enviada.");
      setMotivoDenuncia("");
      setModalAcao("mensagem");
    } catch (error) {
      setMensagemModal(
        error instanceof Error
          ? error.message
          : "Não foi possível enviar a denúncia."
      );
      setModalAcao("mensagem");
    } finally {
      setSalvandoAcao(false);
      setMenuAberto(false);
    }
  }

  function EstrelaNota({
    estrela,
    nota,
    onClick,
  }: {
    estrela: number;
    nota: number;
    onClick?: (valor: number) => void;
  }) {
    const preenchimento =
      nota >= estrela ? 100 : nota >= estrela - 0.5 ? 50 : 0;

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

        if (alvo.closest("a, button")) return;

        if (postId !== undefined) {
          navigate(`/post/${postId}`);
        }
      }}
      className="cursor-pointer rounded-lg border border-[#354052] bg-[#111420] p-4"
    >
      <div className="mb-3 flex items-center gap-3">
        {foto ? (
          <img
            src={foto}
            alt={name || "Foto de perfil"}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#202737]">
            <UserIcon size={22} className="text-gray-400" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center">
            <p className="text-[14px] text-[#d4d9e2]">
              {name || "Usuário"}
            </p>

            {username && (
              <p className="ml-1 text-[14px] text-[#697386]">
                @{username}
              </p>
            )}
          </div>

          <p className="text-[12px] text-[#697386]">
            há {calcularTempo(time)}
          </p>
        </div>

        {/* Menu de opções */}
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Opções da publicação"
            aria-expanded={menuAberto}
            onClick={(event) => {
              event.stopPropagation();
              setMenuAberto((aberto) => !aberto);
            }}
            className="flex cursor-pointer h-8 w-8 items-center justify-center rounded-full text-[#697386] transition-colors hover:bg-[#202737] hover:text-white"
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
                {ehMeuPost ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setTextoEditado(textoAtual);
                        setNotaEditada(notaAtual);
                        setEditando(true);
                        setMenuAberto(false);
                      }}
                      className="flex cursor-pointer w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] text-[#d4d9e2] hover:bg-[#252d3c]"
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
                      className="flex cursor-pointer w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <Trash2 size={15} />
                      Excluir publicação
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    disabled={salvandoAcao}
                    onClick={() => {
                      setMenuAberto(false);
                      setMotivoDenuncia("");
                      setModalAcao("denunciar");
                    }}
                    className="flex cursor-pointer w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] text-[#d4d9e2] hover:bg-[#252d3c] disabled:opacity-50"
                  >
                    <Flag size={15} />
                    Denunciar publicação
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {editando && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleEditar();
          }}
          onClick={(event) => event.stopPropagation()}
          className="mb-4 space-y-3 rounded-lg border border-[#354052] bg-[#0C121D] p-3"
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

              <span className="text-lg text-[#52627c]">
                {notaEditada.toFixed(1)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="rounded-md cursor-pointer px-3 py-2 text-sm text-[#a0aabc] hover:bg-[#202737]"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={salvandoAcao}
              className="rounded-md cursor-pointer bg-[#58AAF0] px-3 py-2 text-sm text-[#080A10] disabled:opacity-50"
            >
              {salvandoAcao ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}

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

          <span className="text-xs text-[#b5bbc5]">
            {notaAtual.toFixed(1)}
          </span>
        </div>
      )}

      {textoAtual && (
        <p className="mb-4 whitespace-pre-wrap text-[14px] leading-5 text-[#d1d5db]">
          {textoAtual}
        </p>
      )}


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

      <div className="mt-4 flex items-center text-[#697386]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleCurtir}
            disabled={carregandoCurtida || postId === undefined}
            aria-label={curtido ? "Descurtir avaliação" : "Curtir avaliação"}
            aria-pressed={curtido}
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-pink-400 disabled:cursor-wait"
          >
            <Heart
              key={`${curtido}-${animando}`}
              size={16}
              fill={curtido ? "currentColor" : "none"}
              className={[
                "transition-colors duration-200",
                curtido ? "text-pink-500" : "",
                animando ? "animate-heart-pop" : "",
              ].join(" ")}
            />

            <span className="text-[12px]">
              {quantidadeCurtidas}
            </span>
          </button>

          <button
            type="button"
            onClick={abrirComentarios}
            disabled={postId === undefined}
            aria-label="Comentar nesta publicação"
            className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-[#58AAF0] disabled:cursor-not-allowed"
          >
            <MessageCircle size={16} />

            <span className="text-[12px]">{comments}</span>
          </button>
        </div>
      </div>

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