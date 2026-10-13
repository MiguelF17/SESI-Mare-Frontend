import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import MusicCard from "../components/musicCard";
import PostCard from "../components/postCard";
import RecommendedMusic from "../components/recommendedMusic";
import { API_URL } from "../api";

function normalizar(valor: unknown) {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function Resultados() {
  const [params] = useSearchParams();
  const termo = params.get("q") || "";
  const q = normalizar(termo.trim());

  const [musicas, setMusicas] = useState<any[]>([]);
  const [artistas, setArtistas] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);

      try {
        const respostas = await Promise.all([
          fetch(`${API_URL}/musicas`),
          fetch(`${API_URL}/artistas`),
          fetch(`${API_URL}/posts`),
        ]);

        if (respostas.some((r) => !r.ok)) {
          throw new Error("Erro ao buscar resultados");
        }

        const [m, a, p] = await Promise.all(
          respostas.map((r) => r.json())
        );

        if (ativo) {
          setMusicas(m);
          setArtistas(a);
          setPosts(p);
        }
      } catch (erro) {
        console.error("Erro ao buscar resultados:", erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const musicasFiltradas = musicas.filter(
    (m) =>
      normalizar(m.titulo).includes(q) ||
      normalizar(m.artista?.nome).includes(q)
  );

  const artistasFiltrados = artistas.filter((a) =>
    normalizar(a.nome).includes(q)
  );

  const postsFiltrados = posts.filter(
    (p) =>
      normalizar(p.texto).includes(q) ||
      normalizar(p.usuario?.nome).includes(q) ||
      normalizar(p.usuario?.username).includes(q) ||
      normalizar(p.musica?.titulo).includes(q) ||
      normalizar(p.musica?.artista?.nome).includes(q)
  );

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* COLUNA PRINCIPAL */}
          <section className="min-w-0">

            {/* BUSCA FIXA */}
            <div className="sticky top-0 z-20 bg-[#080A10]">
              <div className="pt-6">
                <SearchBar />
              </div>

              <div className="border-b border-[#202536] pb-4 pt-5">
                <h1 className="font-serif text-2xl text-white">
                  Resultados da pesquisa
                </h1>

                <p className="mt-2 text-sm text-[#697386]">
                  Resultados para "{termo}"
                </p>
              </div>
            </div>

            {carregando ? (
              <p className="py-10 text-center text-sm text-[#697386]">
                Buscando resultados...
              </p>
            ) : !q ? (
              <p className="py-10 text-center text-sm text-[#697386]">
                Digite algo na barra de pesquisa.
              </p>
            ) : (
              <div className="flex flex-col gap-10 pt-6 mb-5">

                {/* MÚSICAS */}
                <section>
                  <h2 className="mb-5 font-serif text-lg text-white">
                    Músicas
                    <span className="ml-2 text-sm text-[#697386]">
                      {musicasFiltradas.length}
                    </span>
                  </h2>

                  {musicasFiltradas.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      {musicasFiltradas.map((m) => (
                        <MusicCard
                          key={m.id}
                          id={m.id}
                          tipo="quadrado"
                          titulo={m.titulo}
                          artista={m.artista?.nome}
                          capa={m.capa}
                          nota={m.nota}
                          avaliacoes={m.avaliacoes}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#697386]">
                      Nenhuma música encontrada.
                    </p>
                  )}
                </section>

                {/* ARTISTAS */}
                <section>
                  <h2 className="mb-5 font-serif text-lg text-white">
                    Artistas
                    <span className="ml-2 text-sm text-[#697386]">
                      {artistasFiltrados.length}
                    </span>
                  </h2>

                  {artistasFiltrados.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {artistasFiltrados.map((a) => (
                        <Link
                          key={a.id}
                          to={`/artistas/${a.id}`}
                          className="flex items-center gap-3 rounded-xl border border-[#273349] bg-[#111420] p-3 transition hover:border-[#58AAF0]/50 hover:bg-[#171C2A]"
                        >
                          <img
                            src={a.fotoURL || "/logo.png"}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded-full bg-[#202536] object-cover"
                          />

                          <span className="text-sm font-medium text-white">
                            {a.nome}
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#697386]">
                      Nenhum artista encontrado.
                    </p>
                  )}
                </section>

                {/* POSTS */}
                <section>
                  <h2 className="mb-5 font-serif text-lg text-white">
                    Posts
                    <span className="ml-2 text-sm text-[#697386]">
                      {postsFiltrados.length}
                    </span>
                  </h2>

                  {postsFiltrados.length > 0 ? (
                    <div className="flex flex-col gap-6">
                      {postsFiltrados.map((p) => (
                        <PostCard
                          key={p.id}
                          postId={p.id}
                          name={p.usuario?.nome}
                          username={p.usuario?.username}
                          foto={p.usuario?.foto}
                          time={p.dataCriacao}
                          content={p.texto}
                          musicId={p.musica?.id}
                          musicTitle={p.musica?.titulo}
                          artist={p.musica?.artista?.nome}
                          musicCover={p.musica?.capa}
                          nota={p.musica?.nota}
                          avaliacoes={p.musica?.avaliacoes}
                          likes={p._count?.curtidas}
                          comments={p._count?.comentarios}
                          duracaoSegundos={p.musica?.duracaoSegundos}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#697386]">
                      Nenhum post encontrado.
                    </p>
                  )}
                </section>

              </div>
            )}
          </section>

          {/* COLUNA DIREITA: RECOMENDAÇÕES */}
          <aside className="hidden xl:block">
            <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
              <h2 className="mb-5 font-serif text-base text-white">
                Músicas recomendadas
              </h2>

              <div className="flex flex-col gap-3">
                {musicas.length > 0 ? (
                  musicas.slice(0, 5).map((musica) => (
                    <RecommendedMusic
                      id={musica.id}
                      key={musica.id}
                      titulo={musica.titulo}
                      artist={musica.artista?.nome}
                      capa={musica.capa}
                    />
                  ))
                ) : (
                  <p className="text-sm text-[#697386]">
                    Nenhuma música recomendada.
                  </p>
                )}
              </div>
            </div>
          </aside>

        </div>
      </PageContent>
    </PageLayout>
  );
}