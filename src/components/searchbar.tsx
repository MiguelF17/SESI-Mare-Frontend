import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { API_URL } from "../api";

export default function SearchBar() {
  const navigate = useNavigate();
  const [termo, setTermo] = useState("");
  const [musicas, setMusicas] = useState<any[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [aberta, setAberta] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      try {
        const [resMusicas, resArtistas, resPosts] =
          await Promise.all([
            fetch(`${API_URL}/musicas`),
            fetch(`${API_URL}/artistas`),
            fetch(`${API_URL}/posts`),
          ]);

        if (!resMusicas.ok || !resArtistas.ok || !resPosts.ok) {
          throw new Error("Erro ao carregar dados da pesquisa");
        }

        const [dadosMusicas, dadosArtistas, dadosPosts] =
          await Promise.all([
            resMusicas.json(),
            resArtistas.json(),
            resPosts.json(),
          ]);

        setMusicas(dadosMusicas);
        setArtistas(dadosArtistas);
        setPosts(dadosPosts);
      } catch (erro) {
        console.error("Erro na pesquisa:", erro);
      }
    }

    carregarDados();
  }, []);

  function normalizar(valor: unknown) {
    return String(valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  const busca = normalizar(termo.trim());

  const musicasEncontradas = busca
    ? musicas.filter(
      (m) =>
        normalizar(m.titulo).includes(busca) ||
        normalizar(m.artista?.nome).includes(busca)
    ).slice(0, 3)
    : [];

  const artistasEncontrados = busca
    ? artistas.filter(
      (a) => normalizar(a.nome).includes(busca)
    ).slice(0, 3)
    : [];

  const postsEncontrados = busca
    ? posts.filter(
      (p) =>
        normalizar(p.texto).includes(busca) ||
        normalizar(p.usuario?.nome).includes(busca) ||
        normalizar(p.usuario?.username).includes(busca) ||
        normalizar(p.musica?.titulo).includes(busca) ||
        normalizar(p.musica?.artista?.nome).includes(busca)
    ).slice(0, 3)
    : [];

  function pesquisar() {
    if (!termo.trim()) return;

    setAberta(false);
    navigate(`/buscar?q=${encodeURIComponent(termo.trim())}`);
  }

  const temResultados =
    musicasEncontradas.length > 0 ||
    artistasEncontrados.length > 0 ||
    postsEncontrados.length > 0;

  return (
    <div className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pesquisar();
        }}
        className="flex h-10 w-full items-center gap-3 rounded-lg border border-[#354052] bg-[#111420] px-4"
      >
        <MagnifyingGlassIcon
          size={16}
          className="shrink-0 text-[#718096]"
        />

        <input
          type="text"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberta(true);
          }}
          onFocus={() => setAberta(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setAberta(false);
          }}
          placeholder="Buscar músicas, artistas e posts..."
          className="w-full border-none bg-transparent text-xs text-white outline-none placeholder:text-[#718096]"
        />
      </form>

      {aberta && busca && (
        <>
          <button
            type="button"
            aria-label="Fechar sugestões"
            className="fixed inset-0 z-20 cursor-default"
            onClick={() => setAberta(false)}
          />

          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[#273349] bg-[#111420] p-3 shadow-xl">
            {!temResultados ? (
              <p className="py-4 text-center text-sm text-[#718096]">
                Nenhum resultado encontrado.
              </p>
            ) : (
              <>
                {musicasEncontradas.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs text-[#718096]">
                      MÚSICAS
                    </p>
                    {musicasEncontradas.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => {
                          setAberta(false);
                          navigate(`/musica/${m.id}`);
                        }}
                        className="flex cursor-pointer w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[#202536]"
                      >
                        <img
                          src={m.capa || ""}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-white">
                            {m.titulo}
                          </span>
                          <span className="block truncate text-xs text-[#9CA3AF]">
                            {m.artista?.nome || "Artista desconhecido"}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {artistasEncontrados.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs text-[#718096]">
                      ARTISTAS
                    </p>
                    {artistasEncontrados.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => {
                          setAberta(false);
                          navigate(`/artista/${a.id}`);
                        }}
                        className="flex cursor-pointer w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[#202536]"
                      >
                        <img
                          src={a.fotoURL || ""}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <span className="text-sm text-white">
                          {a.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {postsEncontrados.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs text-[#718096]">
                      POSTS
                    </p>
                    {postsEncontrados.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          setAberta(false);
                          navigate(`/post/${p.id}`);
                        }}
                        className="block cursor-pointer w-full rounded-lg p-2 text-left hover:bg-[#202536]"
                      >
                        <span className="block text-xs text-[#9CA3AF]">
                          {p.usuario?.nome || "Usuário"}
                        </span>
                        <span className="line-clamp-2 text-sm text-white">
                          {p.texto}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={pesquisar}
                  className="mt-3 w-full cursor-pointer border-t border-[#273349] pt-3 text-sm text-[#58AAF0] hover:text-white"
                >
                  Ver todos os resultados
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
