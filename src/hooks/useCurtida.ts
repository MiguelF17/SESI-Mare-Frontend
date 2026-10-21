
import { useEffect, useState } from "react";
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

  const [curtido, setCurtido] = useState(curtidoPorMim);
  const [quantidadeCurtidas, setQuantidadeCurtidas] = useState(likes);
  const [carregandoCurtida, setCarregandoCurtida] = useState(false);

  useEffect(() => {
    setCurtido(curtidoPorMim);
  }, [postId, curtidoPorMim]);

  useEffect(() => {
    setQuantidadeCurtidas(likes);
  }, [postId, likes]);

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
    setCurtido(novoEstado);
    setQuantidadeCurtidas(
      Math.max(0, quantidadeAnterior + (novoEstado ? 1 : -1))
    );
    setCarregandoCurtida(true);

    try {
      await alternarCurtidaAPI(postId, estadoAnterior);
    } catch (error) {
      // Restaura o estado caso a API falhe.
      setCurtido(estadoAnterior);
      setQuantidadeCurtidas(quantidadeAnterior);

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
