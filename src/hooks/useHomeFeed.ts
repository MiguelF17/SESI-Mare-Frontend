import { useEffect, useState } from "react";
import { buscarPosts, type Post } from "../services/postService";
import {
  buscarMusicas,
  type Musica,
} from "../services/musicaService";
import { buscarGenerosFavoritos } from "../services/usuarioService";

export function useHomeFeed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [generosFavoritos, setGenerosFavoritos] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro(null);

      try {
        const token = localStorage.getItem("token");

        const [listaPosts, listaMusicas, generos] = await Promise.all([
          buscarPosts(),
          buscarMusicas(),
          token
            ? buscarGenerosFavoritos().catch((erro) => {
                console.error("Erro ao buscar gêneros favoritos:", erro);
                return [] as string[];
              })
            : Promise.resolve([] as string[]),
        ]);

        if (!ativo) return;

        setPosts(listaPosts);
        setMusicas(listaMusicas);
        setGenerosFavoritos(generos);
      } catch (erro) {
        console.error("Erro ao carregar a Home:", erro);

        if (ativo) {
          setErro("Não foi possível carregar o feed. Tente novamente.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  return {
    posts,
    musicas,
    generosFavoritos,
    carregando,
    erro,
  };
}