
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MagnifyingGlassIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useBusca } from "../hooks/useBusca";

function SearchBar({ variant }: { variant: "mobile" | "desktop" }) {
  const mobileHeader = variant === "mobile";
  const navigate = useNavigate();

  const [termo, setTermo] = useState("");
  const [aberta, setAberta] = useState(false);

  const {
    musicasEncontradas,
    artistasEncontrados,
    postsEncontrados,
    usuariosEncontrados,
    carregando,
    erro,
  } = useBusca(termo);

  const busca = termo.trim();

  const temResultados =
    musicasEncontradas.length > 0 ||
    artistasEncontrados.length > 0 ||
    postsEncontrados.length > 0 ||
    usuariosEncontrados.length > 0;

  function pesquisar() {
    if (!busca) return;

    setAberta(false);
    navigate(`/buscar?q=${encodeURIComponent(busca)}`);
  }

  return (
    <div className="relative w-full min-w-0">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          pesquisar();
        }}
        className={`relative z-30 flex w-full items-center gap-3 border border-[var(--cor-borda)] shadow-sm backdrop-blur-xl ${mobileHeader
          ? "h-8 rounded-lg bg-[var(--cor-fundo)]/55 px-2"
          : "h-10 rounded-lg bg-[var(--cor-superficie)]/90 px-3 sm:px-4"
          }`}
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
          className="min-w-0 flex-1 border-none bg-transparent text-xs text-[var(--cor-texto-principal)] outline-none placeholder:text-[#718096]"
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

          <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto rounded-xl border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie)] p-3 shadow-xl">
            {carregando ? (
              <p className="py-4 text-center text-sm text-[#718096]">
                Buscando...
              </p>
            ) : erro ? (
              <p className="py-4 text-center text-sm text-red-400">
                Não foi possível carregar os resultados.
              </p>
            ) : !temResultados ? (
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
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left hover:bg-[var(--cor-superficie-menu)]"
                      >
                        <img
                          src={m.capa || "/logo.png"}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />

                        <span className="min-w-0">
                          <span className="block truncate text-sm text-[var(--cor-texto-principal)]">
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
                        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left hover:bg-[var(--cor-superficie-menu)]"
                      >
                        <img
                          src={a.fotoURL || "/logo.png"}
                          alt=""
                          className="h-10 w-10 rounded-full object-cover"
                        />

                        <span className="text-sm text-[var(--cor-texto-principal)]">
                          {a.nome}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {usuariosEncontrados.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs text-[#718096]">PESSOAS</p>
                    {usuariosEncontrados.map((usuario) => (
                      <button
                        type="button"
                        key={usuario.id}
                        onClick={() => {
                          setAberta(false);
                          navigate(`/u/${encodeURIComponent(usuario.username)}`);
                        }}
                        className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-[var(--cor-superficie-menu)]"
                      >
                        {usuario.foto ? (
                          <img src={usuario.foto} alt="" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--cor-superficie-menu)] text-[#8992A5]">
                            <UserCircleIcon size={24} weight="regular" aria-hidden="true" />
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-[var(--cor-texto-principal)]">{usuario.nome}</span>
                          <span className="block truncate text-xs text-[#9CA3AF]">@{usuario.username}</span>
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
                        className="block w-full cursor-pointer rounded-lg p-2 text-left hover:bg-[var(--cor-superficie-menu)]"
                      >
                        <span className="block text-xs text-[#9CA3AF]">
                          {p.usuario?.nome || "Usuário"}
                        </span>

                        <span className="line-clamp-2 text-sm text-[var(--cor-texto-principal)]">
                          {p.texto}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={pesquisar}
                  className="mt-3 w-full cursor-pointer border-t border-[var(--cor-borda-suave)] pt-3 text-sm text-[var(--cor-destaque)] hover:text-[var(--cor-texto-principal)]"
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

export function MobileSearchBar() {
  return <SearchBar variant="mobile" />;
}

export function DesktopSearchBar() {
  return <SearchBar variant="desktop" />;
}
