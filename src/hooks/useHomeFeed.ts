import { useCallback, useEffect, useRef, useState } from "react";
import { buscarPosts, type Post } from "../services/postService";

const TAMANHO_PAGINA = 12;

type ModoCarregamento = "inicial" | "atualizar" | "mais";

export function useHomeFeed(rota = "/posts", ativo = true) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [carregando, setCarregando] = useState(ativo);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [temMais, setTemMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const deslocamento = useRef(0);
  const identificadorRequisicao = useRef(0);
  const podeCarregarMais = useRef(false);
  const carregandoMaisRef = useRef(false);

  const carregarPagina = useCallback(async (modo: ModoCarregamento) => {
    if (!ativo || (modo === "mais" && (!podeCarregarMais.current || carregandoMaisRef.current))) return;

    const identificador = ++identificadorRequisicao.current;
    const inicio = modo === "mais" ? deslocamento.current : 0;

    if (modo === "mais") {
      carregandoMaisRef.current = true;
      setCarregandoMais(true);
    } else if (modo === "atualizar") {
      setAtualizando(true);
    } else {
      setCarregando(true);
    }
    setErro(null);

    try {
      const separador = rota.includes("?") ? "&" : "?";
      const resultados = await buscarPosts({
        rota: `${rota}${separador}limit=${TAMANHO_PAGINA + 1}&offset=${inicio}`,
      });

      if (identificador !== identificadorRequisicao.current) return;

      const pagina = resultados.slice(0, TAMANHO_PAGINA);
      deslocamento.current = inicio + pagina.length;
      podeCarregarMais.current = resultados.length > TAMANHO_PAGINA;
      setTemMais(podeCarregarMais.current);
      setPosts((atuais) => {
        if (modo !== "mais") return pagina;
        const idsAtuais = new Set(atuais.map((post) => post.id));
        return [...atuais, ...pagina.filter((post) => !idsAtuais.has(post.id))];
      });
    } catch (erroCarregamento) {
      if (identificador !== identificadorRequisicao.current) return;
      console.error("Erro ao carregar o feed:", erroCarregamento);
      setErro("Não foi possível carregar o feed. Tente novamente.");
    } finally {
      if (identificador === identificadorRequisicao.current) {
        setCarregando(false);
        setAtualizando(false);
        carregandoMaisRef.current = false;
        setCarregandoMais(false);
      }
    }
  }, [ativo, rota]);

  useEffect(() => {
    if (ativo) void carregarPagina("inicial");
    else {
      identificadorRequisicao.current += 1;
      setCarregando(false);
    }
  }, [ativo, carregarPagina]);

  return {
    posts,
    carregando,
    carregandoMais,
    atualizando,
    temMais,
    erro,
    recarregar: () => carregarPagina("atualizar"),
    carregarMais: () => carregarPagina("mais"),
  };
}
