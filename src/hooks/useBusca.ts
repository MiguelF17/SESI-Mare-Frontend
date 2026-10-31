
import { useEffect, useMemo, useState } from "react";
import {
  buscarDadosBusca,
  type DadosBusca,
} from "../services/buscaService";

function normalizar(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function useBusca(termo: string) {
  const [dados, setDados] = useState<DadosBusca>({
    musicas: [],
    artistas: [],
    posts: [],
    usuarios: [],
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const resultado = await buscarDadosBusca();

        if (ativo) {
          setDados(resultado);
          setErro(false);
        }
      } catch (erro) {
        console.error("Erro ao carregar pesquisa:", erro);

        if (ativo) {
          setErro(true);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const resultados = useMemo(() => {
    const busca = normalizar(termo.trim());

    if (!busca) {
      return {
        musicasEncontradas: [],
        artistasEncontrados: [],
        postsEncontrados: [],
        usuariosEncontrados: [],
      };
    }

    return {
      musicasEncontradas: dados.musicas
        .filter(
          (musica) =>
            normalizar(musica.titulo).includes(busca) ||
            normalizar(musica.artista?.nome).includes(busca)
        )
        .slice(0, 3),

      artistasEncontrados: dados.artistas
        .filter((artista) =>
          normalizar(artista.nome).includes(busca)
        )
        .slice(0, 3),

      postsEncontrados: dados.posts
        .filter(
          (post) =>
            normalizar(post.texto).includes(busca) ||
            normalizar(post.usuario?.nome).includes(busca) ||
            normalizar(post.usuario?.username).includes(busca) ||
            normalizar(post.musica?.titulo).includes(busca) ||
            normalizar(post.musica?.artista?.nome).includes(busca)
        )
        .slice(0, 3),
      usuariosEncontrados: dados.usuarios
        .filter((usuario) =>
          normalizar(usuario.nome).includes(busca) ||
          normalizar(usuario.username).includes(busca)
        )
        .slice(0, 3),
    };
  }, [termo, dados]);

  return {
    ...resultados,
    carregando,
    erro,
  };
}
