import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
    UserRound,
    RefreshCw,
} from "lucide-react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import BotaoVoltar from "../components/botaoVoltar";

import { apiRequest } from "../api";
import {
    buscarMusicas,
    type Musica,
} from "../services/musicaService";
import RecommendedMusicList from "../components/recommendedMusicList";

interface UsuarioLista {
    id: number;
    nome: string;
    username: string;
    foto: string | null;
}

interface Seguidor {
    seguidorId: number;
    seguidoId: number;
    seguidor?: UsuarioLista;
    seguido?: UsuarioLista;
}



export default function ListaSeguidores() {
    const { id, tipo } = useParams<{
        id: string;
        tipo: string;
    }>();

    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState<UsuarioLista[]>([]);
    const [, setMusicas] = useState<Musica[]>([]);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [carregandoMeuPerfil, setCarregandoMeuPerfil] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [searchParams] = useSearchParams();

    const nomePerfil = searchParams.get("nome");
    const usernamePerfil = searchParams.get("username");

    const seguindo = tipo === "seguindo";
    const tipoValido =
        tipo === "seguidores" || tipo === "seguindo";

    const ehMeuPerfil =
        meuId !== null && Number(id) === meuId;

    const identificacaoPerfil =
        nomePerfil ||
        (usernamePerfil ? `@${usernamePerfil}` : "este perfil");

    const titulo =
        tipo === "seguidores"
            ? ehMeuPerfil
                ? "Seus seguidores"
                : `Seguidores de ${identificacaoPerfil}`
            : ehMeuPerfil
                ? "Pessoas que você segue"
                : `Pessoas que ${identificacaoPerfil} segue`;

    const descricao = seguindo
        ? ehMeuPerfil
            ? "Perfis que você acompanha no Maré."
            : "Perfis acompanhados por este usuário."
        : ehMeuPerfil
            ? "Pessoas que acompanham seu perfil."
            : "Pessoas que acompanham este usuário.";

    // Identifica o usuário que está conectado.
    useEffect(() => {
        let ativo = true;

        async function carregarMeuPerfil() {
            if (!localStorage.getItem("token")) {
                setMeuId(null);
                setCarregandoMeuPerfil(false);
                return;
            }

            try {
                const perfil = await apiRequest<{ id: number }>(
                    "/usuarios/me"
                );

                if (ativo) {
                    setMeuId(perfil.id);
                }
            } catch (error) {
                console.error(
                    "Erro ao identificar usuário logado:",
                    error
                );

                if (ativo) {
                    setMeuId(null);
                }
            } finally {
                if (ativo) {
                    setCarregandoMeuPerfil(false);
                }
            }
        }

        carregarMeuPerfil();

        return () => {
            ativo = false;
        };
    }, []);

    // Carrega seguidores ou pessoas seguidas.
    useEffect(() => {
        let ativo = true;

        async function carregarUsuarios() {
            if (!id || !tipoValido || !Number.isInteger(Number(id))) {
                setErro("Esta página não existe.");
                setCarregando(false);
                return;
            }

            try {
                setCarregando(true);
                setErro("");

                const dados = await apiRequest<Seguidor[]>(
                    `/usuarios/${id}/${tipo}`
                );

                if (!Array.isArray(dados)) {
                    throw new Error(
                        "A API não retornou uma lista válida."
                    );
                }

                const lista = dados
                    .map((relacao) =>
                        seguindo ? relacao.seguido : relacao.seguidor
                    )
                    .filter(
                        (usuario): usuario is UsuarioLista =>
                            usuario !== undefined
                    );

                if (ativo) {
                    setUsuarios(lista);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar os perfis."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarUsuarios();

        return () => {
            ativo = false;
        };
    }, [id, tipo, tipoValido, seguindo, tentativa]);

    // Carrega as músicas recomendadas.
    useEffect(() => {
        let ativo = true;

        async function carregarRecomendacoes() {
            try {
                const dados = await buscarMusicas();

                if (ativo) {
                    setMusicas(dados);
                }
            } catch (error) {
                console.error(
                    "Erro ao carregar músicas recomendadas:",
                    error
                );
            }
        }

        carregarRecomendacoes();

        return () => {
            ativo = false;
        };
    }, []);

    // Abre o perfil selecionado.
    function abrirPerfil(usuario: UsuarioLista) {
        if (!usuario.username) return;

        // Se for o próprio usuário, abre o perfil pessoal.
        if (meuId !== null && usuario.id === meuId) {
            navigate("/perfil");
            return;
        }

        navigate(`/u/${encodeURIComponent(usuario.username)}`);
    }

    return (
        <PageLayout>
            <PageContent>
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0">
                        {/* Busca */}
                        <div className="sticky md:relative search-header -mt-2.5 top-[calc(50px+env(safe-area-inset-top))] z-20 md:top-0 md:mt-0 bg-[var(--cor-fundo)]/80 backdrop-blur-md">
                            <div className="w-full max-w-[800px] pb-0 pt-0 md:pb-6 md:pt-6">
                                <SearchBar />
                            </div>
                        </div>

                        {/* Cabeçalho */}
                        <div className="mb-6 flex items-center gap-4">
                            <BotaoVoltar fallback="/explorar" />

                            <div className="min-w-0">
                                <h1 className="font-serif text-[24px] text-[var(--cor-texto-principal)]">
                                    {titulo}
                                </h1>

                                <p className="mt-1 font-serif text-[13px] text-[var(--cor-texto-discreto)]">
                                    {descricao}
                                </p>
                            </div>
                        </div>

                        {/* Lista */}
                        <section className="w-full overflow-hidden rounded-xl border border-[var(--cor-borda-discreta)] bg-[#0d121c]">
                            <header className="flex items-center justify-between gap-3 border-b border-[var(--cor-borda-discreta)] px-5 py-4">
                                <h2 className="font-serif text-[15px] text-[var(--cor-texto-cinza-100)]">
                                    {seguindo ? "Seguindo" : "Seguidores"}
                                </h2>

                                {!carregando && !erro && (
                                    <span className="shrink-0 font-serif text-[12px] text-[#9aa6ba]">
                                        {usuarios.length}{" "}
                                        {usuarios.length === 1
                                            ? "pessoa"
                                            : "pessoas"}
                                    </span>
                                )}
                            </header>

                            {carregando || carregandoMeuPerfil ? (
                                <div className="divide-y divide-[#252d38]">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className="flex animate-pulse items-center gap-4 px-5 py-4"
                                        >
                                            <div className="h-14 w-14 shrink-0 rounded-full bg-[var(--cor-superficie-elevada)]" />

                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-36 rounded bg-[var(--cor-superficie-elevada)]" />
                                                <div className="h-3 w-24 rounded bg-[var(--cor-superficie-elevada)]" />
                                            </div>

                                            <div className="h-8 w-20 rounded-lg bg-[var(--cor-superficie-elevada)]" />
                                        </div>
                                    ))}
                                </div>
                            ) : erro ? (
                                <div className="flex flex-col items-center px-6 py-12 text-center">
                                    <p className="text-sm text-red-400">
                                        {erro}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setTentativa((valor) => valor + 1)
                                        }
                                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--cor-borda)] px-4 py-2 font-serif text-[12px] text-[var(--cor-destaque)] transition hover:border-[var(--cor-destaque)]/50 hover:bg-[var(--cor-destaque)]/10"
                                    >
                                        <RefreshCw size={15} />
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : usuarios.length === 0 ? (
                                <div className="flex flex-col items-center px-6 py-14 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[#111827]">
                                        <UserRound
                                            size={28}
                                            className="text-[var(--cor-texto-discreto)]"
                                        />
                                    </div>

                                    <h2 className="font-serif text-[16px] text-[var(--cor-texto-cinza-100)]">
                                        {seguindo
                                            ? ehMeuPerfil
                                                ? "Você ainda não segue ninguém"
                                                : "Este perfil ainda não segue ninguém"
                                            : ehMeuPerfil
                                                ? "Você ainda não tem seguidores"
                                                : "Este perfil ainda não tem seguidores"}
                                    </h2>

                                    <p className="mt-2 max-w-xs font-serif text-[13px] leading-5 text-[var(--cor-texto-discreto)]">
                                        {seguindo
                                            ? "Os perfis que forem acompanhados aparecerão nesta lista."
                                            : "Quando alguém começar a seguir este perfil, aparecerá nesta lista."}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#252d38]">
                                    {usuarios.map((usuario) => (
                                        <button
                                            key={usuario.id}
                                            type="button"
                                            onClick={() => abrirPerfil(usuario)}
                                            className="group flex w-full cursor-pointer items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#141b29]"
                                        >
                                            {usuario.foto ? (
                                                <img
                                                    src={usuario.foto}
                                                    alt={`Foto de ${usuario.nome}`}
                                                    className="h-14 w-14 shrink-0 rounded-full border border-[var(--cor-borda)] object-cover transition-colors group-hover:border-[var(--cor-destaque)]/60"
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[#171e2c] transition-colors group-hover:border-[var(--cor-destaque)]/60">
                                                    <UserRound
                                                        size={25}
                                                        className="text-[#9aa6ba]"
                                                    />
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-serif text-[14px] text-[var(--cor-texto-cinza-100)] transition-colors group-hover:text-[var(--cor-destaque)]">
                                                    {usuario.nome}
                                                    {meuId !== null &&
                                                        usuario.id === meuId && (
                                                            <span className="ml-2 text-[11px] text-[var(--cor-texto-discreto)]">
                                                                Você
                                                            </span>
                                                        )}
                                                </p>

                                                <p className="mt-1 truncate font-serif text-[12px] text-[var(--cor-texto-discreto)]">
                                                    @{usuario.username}
                                                </p>
                                            </div>

                                            <span className="shrink-0 rounded-lg border border-[var(--cor-borda)] px-3 py-2 font-serif text-[11px] text-[#9aa6ba] transition-colors group-hover:border-[var(--cor-destaque)]/50 group-hover:text-[var(--cor-destaque)]">
                                                {meuId !== null &&
                                                    usuario.id === meuId
                                                    ? "Meu perfil"
                                                    : "Ver perfil"}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </section>
                    </section>

                    {/* Músicas recomendadas */}
                    <aside className="hidden min-w-0 xl:block">
                        <div className="sticky top-6 pt-6">
                            <h2 className="mb-5 font-serif text-[16px] text-[var(--cor-texto-principal)]">
                                Músicas recomendadas
                            </h2>

                            <div className="flex flex-col gap-3">
                                <RecommendedMusicList />
                            </div>
                        </div>
                    </aside>
                </div>
            </PageContent>
        </PageLayout>
    );
}
