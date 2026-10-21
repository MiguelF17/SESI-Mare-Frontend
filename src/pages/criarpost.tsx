import { useEffect, useState } from "react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import OuvirCard from "../components/ouvirCard";
import { API_URL } from "../api";

import { MagnifyingGlassIcon, PlusIcon, StarIcon } from "@phosphor-icons/react";

import MusicCard from "../components/musicCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

interface Musica {
  id: number;
  titulo: string;
  capa?: string | null;
  duracaoSegundos: number;
  spotifyUrl?: string | null;
  artista: {
    id: number;
    nome: string;
  };
  nota: number;
  avaliacoes: number;
}

export default function CriarPost() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const musicaId = searchParams.get("musica");

  const [musicaSelecionada, setMusicaSelecionada] = useState<Musica | null>(
    null,
  );

  const [nota, setNota] = useState(0);
  const [texto, setTexto] = useState("");

  const [publicando, setPublicando] = useState(false);

  // BUSCAR MÚSICAS
  useEffect(() => {
    async function buscarMusicas() {
      try {
        const resposta = await fetch(`${API_URL}/musicas`);

        if (!resposta.ok) {
          throw new Error("Erro ao buscar músicas");
        }

        const dados = await resposta.json();

        setMusicas(dados);

        // Seleciona automaticamente a música enviada pela URL
        if (musicaId) {
          const musica = dados.find(
            (item: Musica) => item.id === Number(musicaId)
          );

          if (musica) {
            setMusicaSelecionada(musica);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar músicas:", error);
      }
    }

    buscarMusicas();
  }, [musicaId]);

  // FILTRAR MÚSICAS
  const musicasFiltradas = musicas.filter((musica) => {
    const termo = busca.toLowerCase();

    return (
      musica.titulo.toLowerCase().includes(termo) ||
      musica.artista.nome.toLowerCase().includes(termo)
    );
  });

  // CRIAR POST
  async function criarPost() {
    if (!musicaSelecionada) {
      toast.error("Escolha uma música.");
      return;
    }

    if (nota === 0) {
      toast.error("Escolha uma nota.");
      return;
    }

    if (!texto.trim()) {
      toast.error("Escreva algo sobre a música.");
      return;
    }

    try {
      setPublicando(true);

      const token = localStorage.getItem("token");

      const resposta = await fetch(`${API_URL}/posts`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          musicaId: musicaSelecionada.id,
          nota,
          texto,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.error || "Erro ao criar post");
      }

      toast.success("Avaliação publicada com sucesso!");

      navigate("/home");
    } catch (error) {
      console.error("Erro ao criar post:", error);
      toast.error("Erro ao criar post");
    } finally {
      setPublicando(false);
    }
  }

  function EstrelaNota({
    estrela,
    nota,
    onClick,
  }: {
    estrela: number;
    nota: number;
    onClick: (valor: number) => void;
  }) {
    const preenchimento =
      nota >= estrela ? 100 : nota >= estrela - 0.5 ? 50 : 0;

    return (
      <div className="relative h-[30px] w-[30px]">
        {/* Estrela vazia */}
        <StarIcon
          size={30}
          weight="regular"
          className="absolute inset-0 text-[#52627c]"
        />

        {/* Preenchimento */}
        {preenchimento > 0 && (
          <div
            className="absolute left-0 top-0 h-[30px] overflow-hidden"
            style={{ width: `${preenchimento}%` }}
          >
            <StarIcon
              size={30}
              weight="fill"
              className="absolute left-0 top-0 text-[#5ba4e8]"
            />
          </div>
        )}

        {/* Clique na metade esquerda */}
        <button
          type="button"
          onClick={() => onClick(estrela - 0.5)}
          className="absolute left-0 top-0 h-full w-1/2 cursor-pointer"
          aria-label={`Dar nota ${estrela - 0.5}`}
        />

        {/* Clique na metade direita */}
        <button
          type="button"
          onClick={() => onClick(estrela)}
          className="absolute right-0 top-0 h-full w-1/2 cursor-pointer"
          aria-label={`Dar nota ${estrela}`}
        />
      </div>
    );
  }

  return (
    <PageLayout>
      <PageContent>
        <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* PRINCIPAL */}
          <main className="min-w-0">
            <SearchBar />

            {/* Título */}
            <h1 className="mt-5 font-serif text-[26px] text-white">
              Criar avaliação
            </h1>

            {/* MÚSICAS RECOMENDADAS */}
            <section className="mt-5">
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Músicas recomendadas
              </h2>


              <div className="flex gap-3 overflow-x-auto pb-3">
                {musicas.slice(0, 4).map((musica) => (
                  <div
                    key={musica.id}
                    onClick={() => {
                      setMusicaSelecionada(musica);
                      setNota(0);
                    }}
                    className="w-[160px] shrink-0 cursor-pointer"
                  >
                    <MusicCard
                      tipo="quadrado"
                      titulo={musica.titulo}
                      artista={musica.artista.nome}
                      capa={musica.capa}
                    />
                  </div>
                ))}
              </div>

            </section>

            {/* ESCOLHER MÚSICA */}
            <section className="mt-5">
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Escolha uma música
              </h2>

              {/* Busca */}
              <div
                className="
                  flex
                  h-[40px]
                  w-full
                  items-center
                  gap-2
                  rounded-lg
                  border
                  border-[#273349]
                  bg-[#111722]
                  px-3
                  transition
                  focus-within:border-[#5ba4e8]
                "
              >
                <MagnifyingGlassIcon size={18} className="text-[#66748b]" />

                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar música ou artista..."
                  className="
                    w-full
                    bg-transparent
                    text-[12px]
                    text-white
                    outline-none
                    placeholder:text-[#697386]
                  "
                />
              </div>

              {/* RESULTADOS */}
              {busca && (
                <div className="mt-3 flex flex-col gap-2">
                  {musicasFiltradas.map((musica) => (
                    <button
                      key={musica.id}
                      onClick={() => {
                        setMusicaSelecionada(musica);
                        setNota(0);
                        setBusca("");
                      }}
                      className="
                      cursor-pointer
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        border
                        border-[#273349]
                        bg-[#111722]
                        p-2
                        text-left
                        transition
                        hover:border-[#5ba4e8]
                      "
                    >
                      <img
                        src={musica.capa || "/logo.png"}
                        alt={musica.titulo}
                        className="h-10 w-10 rounded object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-[12px] text-white">
                          {musica.titulo}
                        </p>

                        <p className="truncate text-[10px] text-[#697386]">
                          {musica.artista.nome}
                        </p>
                      </div>
                    </button>
                  ))}

                  {musicasFiltradas.length === 0 && (
                    <p className="py-3 text-center text-[12px] text-[#697386]">
                      Nenhuma música encontrada.
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* MÚSICA SELECIONADA */}
            {musicaSelecionada && (
              <section className="mt-5">
                <h2 className="mb-2 font-serif text-[18px] text-white">
                  Música selecionada
                </h2>

                <div className="flex items-center gap-3 rounded-lg border border-[#273349] bg-[#111722] p-3">
                  <img
                    src={musicaSelecionada.capa || "/logo.png"}
                    alt={musicaSelecionada.titulo}
                    className="h-16 w-16 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-white">
                      {musicaSelecionada.titulo}
                    </p>

                    <p className="mt-1 truncate text-[11px] text-[#697386]">
                      {musicaSelecionada.artista.nome}
                    </p>

                    <div className="mt-2 flex items-center gap-1">
                      <StarIcon
                        size={14}
                        className="fill-[#5ba4e8] text-[#5ba4e8]"
                      />

                      <span className="text-[11px] text-[#b5bbc5]">
                        {musicaSelecionada.nota > 0
                          ? musicaSelecionada.nota.toFixed(1)
                          : "Sem avaliações"}
                      </span>

                      <span className="text-[10px] text-[#697386]">
                        ({musicaSelecionada.avaliacoes})
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <OuvirCard spotifyURL={musicaSelecionada?.spotifyUrl} />
          </main>

          {/* DIREITA */}
          <aside className="xl:block">
            <div className="fixed top-2/5 -translate-y-2/5 w-[340px]">
              {/* NOTA */}
              <h2 className="mb-2 font-serif text-[18px] text-white">
                Sua nota
              </h2>

              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <EstrelaNota
                      key={star}
                      estrela={star}
                      nota={nota}
                      onClick={setNota}
                    />
                  ))}
                </div>

                <span className="text-[24px] text-[#52627c]">
                  {nota > 0 ? nota.toFixed(1) : "0.0"}
                </span>
              </div>

              {/* TEXTO */}
              <h2 className="mb-2 mt-4 font-serif text-[18px] text-white">
                Escreva sobre essa música
              </h2>

              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Escreva algo sobre a música..."
                className="
                  h-[115px]
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-[#273349]
                  bg-[#0c1017]
                  p-3
                  text-[11px]
                  text-white
                  outline-none
                  transition
                  placeholder:text-[#697386]
                  focus:border-[#5ba4e8]
                "
              />

              <h2 className="mb-2 mt-4 font-serif text-[18px] text-white">
                Prévia da avaliação
              </h2>

              <div className="rounded-lg border border-[#273349] bg-[#0c1017] p-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#d9d9d9]" />

                  <div>
                    <p className="text-[12px] text-white">Você</p>

                    <p className="text-[10px] text-[#697386]">Avaliação</p>
                  </div>
                </div>

                <p className="mt-4 text-[12px] leading-4 text-[#b5bbc5]">
                  {texto || "Escreva algo sobre essa música..."}
                </p>

                {musicaSelecionada && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-[#273349] bg-[#111722] p-2">
                    <img
                      src={musicaSelecionada.capa || "/logo.png"}
                      alt={musicaSelecionada.titulo}
                      className="h-12 w-12 rounded-lg object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12px] text-white">
                        {musicaSelecionada.titulo}
                      </p>

                      <p className="mt-1 truncate text-[10px] text-[#697386]">
                        {musicaSelecionada.artista.nome}
                      </p>

                      <div className="mt-2 flex items-center gap-1">
                        <StarIcon
                          size={13}
                          className="fill-[#5ba4e8] text-[#5ba4e8]"
                        />

                        <span className="text-[11px] text-white">
                          {nota > 0 ? nota.toFixed(1) : "Sem nota"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÃO */}
              <button
                onClick={criarPost}
                disabled={publicando}
                className="
                  mt-4
                  flex
                  h-12
                  w-full
                  cursor-pointer
                  items-center
                  justify-center
                  gap-1.5
                  rounded-lg
                  bg-[#5ba4e8]
                  text-[14px]
                  font-serif
                  text-white
                  transition
                  hover:bg-[#6bb0ef]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <PlusIcon size={14} weight="bold" />

                {publicando ? "Publicando..." : "Publicar avaliação"}
              </button>
            </div>
          </aside>
        </div>
      </PageContent>
    </PageLayout>
  );
}
