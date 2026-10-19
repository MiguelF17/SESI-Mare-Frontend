
import { useEffect, useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import MusicCard from "./musicCard";
import calcularTempo from "../calcularTempo";
import fotoPadrao from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

interface PostCardProps {
  postId?: number;
  name: string;
  username: string;
  foto?: string | null;
  time: string;
  content: string;
  nota?: number;
  musicId: number;
  musicTitle: string;
  artist: string;
  artistId?: number;
  musicCover?: string | null;
  duracaoSegundos?: number;
  likes?: number;
  comments?: number;
  avaliacoes?: number;
  curtidoPorMim?: boolean;
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
}: PostCardProps) {
  const navigate = useNavigate();

  const [curtido, setCurtido] = useState(curtidoPorMim);
  const [quantidadeCurtidas, setQuantidadeCurtidas] = useState(likes);
  const [carregandoCurtida, setCarregandoCurtida] = useState(false);

  useEffect(() => {
    setCurtido(curtidoPorMim);
  }, [curtidoPorMim]);

  useEffect(() => {
    setQuantidadeCurtidas(likes);
  }, [likes]);

  async function alternarCurtida() {
    if (postId === undefined || carregandoCurtida) return;

    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Faça login para curtir uma avaliação.");
      navigate("/login");
      return;
    }

    const estadoAnterior = curtido;
    const quantidadeAnterior = quantidadeCurtidas;

    setCurtido(!estadoAnterior);
    setQuantidadeCurtidas(
      Math.max(0, quantidadeAnterior + (estadoAnterior ? -1 : 1))
    );
    setCarregandoCurtida(true);

    try {
      const resposta = await fetch(
        `${API_URL}/posts/${postId}/curtir`,
        {
          method: estadoAnterior ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!resposta.ok) {
        const dados = await resposta.json().catch(() => null);
        throw new Error(dados?.error || "Não foi possível atualizar a curtida.");
      }
    } catch (error) {
      setCurtido(estadoAnterior);
      setQuantidadeCurtidas(quantidadeAnterior);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao curtir a avaliação."
      );
    } finally {
      setCarregandoCurtida(false);
    }
  }

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
        <img
          src={foto || fotoPadrao}
          alt={name}
          className="h-10 w-10 rounded-full object-cover"
        />

        <div>
          <div className="flex">
            <p className="text-[14px] text-[#d4d9e2]">{name}</p>
            <p className="ml-1 text-[14px] text-[#697386]">
              @{username}
            </p>
          </div>

          <p className="text-[12px] text-[#697386]">
            há {calcularTempo(time)}
          </p>
        </div>
      </div>

      <p className="mb-4 text-[14px] leading-5 text-[#d1d5db]">
        {content}
      </p>

      <MusicCard
        id={musicId}
        tipo="post"
        titulo={musicTitle}
        artista={artist}
        artistaId={artistId}
        capa={musicCover}
        nota={nota}
        avaliacoes={avaliacoes}
        duracaoSegundos={duracaoSegundos}
      />

      <div className="mt-4 flex items-center text-[#697386]">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={alternarCurtida}
            disabled={carregandoCurtida || postId === undefined}
            aria-label={curtido ? "Descurtir avaliação" : "Curtir avaliação"}
            aria-pressed={curtido}
            className="flex cursor-pointer items-center gap-1.5 disabled:cursor-wait"
          >
            <Heart
              size={16}
              fill={curtido ? "currentColor" : "none"}
              className={curtido ? "text-red-500" : ""}
            />

            <span className="text-[12px]">{quantidadeCurtidas}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (postId !== undefined) {
                navigate(`/post/${postId}`);
              }
            }}
            className="flex cursor-pointer items-center gap-1.5"
          >
            <MessageCircle size={16} />
            <span className="text-[12px]">{comments}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
