
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { alternarCurtidaAPI } from "../services/curtidaService";

interface UseCurtidaProps {
  postId?: number;
  likes?: number;
  curtidoPorMim?: boolean;
}

export function useCurtida({
  postId,
  likes = 0,
  curtidoPorMim = false,
}: UseCurtidaProps) {
  const navigate = useNavigate();

  const [estadoLocal, setEstadoLocal] = useState<{
    postId: number | undefined;
    curtido: boolean;
    quantidade: number;
  } | null>(null);
  const [carregandoCurtida, setCarregandoCurtida] = useState(false);

  const estadoDoPost = estadoLocal?.postId === postId ? estadoLocal : null;
  const curtido = estadoDoPost?.curtido ?? curtidoPorMim;
  const quantidadeCurtidas = estadoDoPost?.quantidade ?? likes;

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
    const novoEstado = !estadoAnterior;

    // Atualização imediata da interface.
    setEstadoLocal({
      postId,
      curtido: novoEstado,
      quantidade: Math.max(
        0,
        quantidadeAnterior + (novoEstado ? 1 : -1)
      ),
    });
    setCarregandoCurtida(true);

    try {
      await alternarCurtidaAPI(postId, estadoAnterior);
    } catch (error) {
      const mensagem = error instanceof Error ? error.message.toLowerCase() : "";
      // Perfis podem chegar com curtidoPorMim desatualizado; sincroniza o
      // estado com o servidor quando ele informa que já existia uma curtida.
      if (novoEstado && (
        mensagem.includes("já foi curtido") ||
        mensagem.includes("ja foi curtido") ||
        mensagem.includes("já curtiu este post") ||
        mensagem.includes("ja curtiu este post") ||
        mensagem.includes("already liked")
      )) {
        try {
          await alternarCurtidaAPI(postId, true);
          setEstadoLocal({
            postId,
            curtido: false,
            quantidade: Math.max(0, quantidadeAnterior - 1),
          });
          return;
        } catch (erroAoSincronizar) {
          console.error("Erro ao sincronizar curtida:", erroAoSincronizar);
        }
      }
      // Restaura o estado caso a API falhe.
      setEstadoLocal(null);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar a curtida."
      );
    } finally {
      setCarregandoCurtida(false);
    }
  }

  return {
    curtido,
    quantidadeCurtidas,
    carregandoCurtida,
    alternarCurtida,
  };
}
