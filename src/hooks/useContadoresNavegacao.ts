import { useEffect, useState } from "react";
import { apiRequest } from "../api";

const intervaloAtualizacao = 30_000;

function useContadorNaoLidas(rota: string, evento: string) {
  const [quantidade, setQuantidade] = useState(0);

  useEffect(() => {
    let controlador: AbortController | undefined;

    async function atualizar() {
      controlador?.abort();
      controlador = new AbortController();
      const { signal } = controlador;

      try {
        const dados = await apiRequest<{ quantidade: number }>(rota, {
          cache: "no-store",
          signal,
        });
        if (!signal.aborted) setQuantidade(dados.quantidade);
      } catch (erro) {
        if (!signal.aborted) console.error(`Erro ao atualizar contador de ${rota}:`, erro);
      }
    }

    function atualizarQuandoVisivel() {
      if (document.visibilityState === "visible") void atualizar();
    }

    void atualizar();
    const intervalo = window.setInterval(atualizarQuandoVisivel, intervaloAtualizacao);
    document.addEventListener("visibilitychange", atualizarQuandoVisivel);
    window.addEventListener(evento, atualizar);

    return () => {
      controlador?.abort();
      window.clearInterval(intervalo);
      document.removeEventListener("visibilitychange", atualizarQuandoVisivel);
      window.removeEventListener(evento, atualizar);
    };
  }, [rota, evento]);

  return quantidade;
}

export function useContadoresNavegacao() {
  const notificacoes = useContadorNaoLidas(
    "/notificacoes/nao-lidas/quantidade",
    "mare:notificacoes-atualizadas",
  );
  const mensagens = useContadorNaoLidas(
    "/conversas/nao-lidas/quantidade",
    "mare:mensagens-atualizadas",
  );

  return { notificacoes, mensagens };
}
