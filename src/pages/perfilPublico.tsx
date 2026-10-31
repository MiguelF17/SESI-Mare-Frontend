import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    UserCircleIcon,
    UserPlus,
    UserCheck,
    MusicNoteIcon,
    ShareNetworkIcon,
    ChatCircleIcon,
} from "@phosphor-icons/react";
import { Settings } from "lucide-react";
import toast from "react-hot-toast";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import BotaoVoltar from "../components/botaoVoltar";

import {
    buscarMeuPerfil,
    buscarPerfilPublico,
    seguirUsuario,
    deixarDeSeguirUsuario,
    type PerfilPublico as PerfilPublicoTipo,
} from "../services/usuarioService";

import { apiRequest } from "../api";

import {
    buscarMusicas,
    type Musica,
} from "../services/musicaService";
import ComentarioPerfilCard, {
    type ComentarioPerfil,
} from "../components/comentarioPerfilCard";
import RecommendedMusicList from "../components/recommendedMusicList";

export default function PerfilPublico() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState<PerfilPublicoTipo | null>(null);
    const [, setMusicas] = useState<Musica[]>([]);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [processando, setProcessando] = useState(false);
    const [comentarios, setComentarios] = useState<ComentarioPerfil[]>([]);
    const [aba, setAba] = useState<"avaliacoes" | "comentarios">("avaliacoes");


    const ehMeuPerfil = usuario !== null && usuario.id === meuId;


    useEffect(() => {
        let ativo = true;

        async function carregarPerfil() {
            if (!username) {
                setErro("Perfil não encontrado.");
                setCarregando(false);
                return;
            }

            setCarregando(true);
            setErro("");
            setUsuario(null);
            setComentarios([]);

            try {
                const perfil = await buscarPerfilPublico(username);

                if (!ativo) return;

                setUsuario(perfil);

                // Busca os comentários da pessoa cujo perfil foi aberto.
                try {
                    const dados = await apiRequest<ComentarioPerfil[]>(
                        `/usuarios/${perfil.id}/comentarios`
                    );

                    if (ativo) {
                        setComentarios(dados);
                    }
                } catch (error) {
                    console.error("Erro ao buscar comentários do perfil:", error);

                    if (ativo) {
                        toast.error("Não foi possível carregar os comentários.");
                    }
                }
            } catch (error) {
                console.error("Erro ao carregar perfil público:", error);

                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Não foi possível carregar este perfil."
                    );
                }
            } finally {
                if (ativo) {
                    setCarregando(false);
                }
            }
        }

        carregarPerfil();

        return () => {
            ativo = false;
        };
    }, [username]);

    const usuarioId = usuario?.id;

    useEffect(() => {
        if (usuarioId == null) return;

        let ativo = true;

        async function carregarComentarios() {
            try {
                const dados = await apiRequest<ComentarioPerfil[]>(
                    `/usuarios/${usuarioId}/comentarios`
                );

                if (ativo) setComentarios(dados);
            } catch (error) {
                console.error("Erro ao buscar comentários do perfil:", error);

                if (ativo) {
                    toast.error("Não foi possível carregar os comentários.");
                }
            }
        }

        void carregarComentarios();

        return () => {
            ativo = false;
        };
    }, [usuarioId]);


    useEffect(() => {
        let ativo = true;

        async function carregarDadosAdicionais() {
            try {
                const listaMusicas = await buscarMusicas();

                if (ativo) {
                    setMusicas(listaMusicas);
                }
            } catch (error) {
                console.error("Erro ao carregar músicas:", error);
            }

            if (!localStorage.getItem("token")) {
                if (ativo) setMeuId(null);
                return;
            }

            try {
                const perfil = await buscarMeuPerfil();

                if (ativo) {
                    setMeuId(perfil.id);
                }
            } catch (error) {
                console.error("Erro ao identificar usuário logado:", error);

                if (ativo) {
                    setMeuId(null);
                }
            }
        }

        carregarDadosAdicionais();

        return () => {
            ativo = false;
        };
    }, []);

    async function alternarSeguir() {
        if (!usuario || processando) return;

        if (!localStorage.getItem("token")) {
            toast.error("Entre na sua conta para seguir pessoas.");
            navigate("/login");
            return;
        }

        try {
            setProcessando(true);

            if (usuario.seguindoPorMim) {
                await deixarDeSeguirUsuario(usuario.id);

                setUsuario((atual) => {
                    if (!atual) return atual;

                    return {
                        ...atual,
                        seguindoPorMim: false,
                        _count: {
                            ...atual._count,
                            seguidores: Math.max(
                                0,
                                atual._count.seguidores - 1
                            ),
                        },
                    };
                });

                toast.success("Você deixou de seguir este perfil.");
            } else {
                await seguirUsuario(usuario.id);

                setUsuario((atual) => {
                    if (!atual) return atual;

                    return {
                        ...atual,
                        seguindoPorMim: true,
                        _count: {
                            ...atual._count,
                            seguidores: atual._count.seguidores + 1,
                        },
                    };
                });

                toast.success("Você começou a seguir este perfil.");
            }
        } catch (error) {
            console.error("Erro ao alterar seguimento:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível atualizar o seguimento."
            );
        } finally {
            setProcessando(false);
        }
    }

    async function compartilharPerfil() {
        if (!usuario) return;

        const url = `${window.location.origin}/u/${encodeURIComponent(
            usuario.username
        )}`;

        if (!navigator.share) {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Link do perfil copiado!");
            } catch {
                toast.error("Não foi possível copiar o link do perfil.");
            }

            return;
        }

        try {
            await navigator.share({
                title: `Perfil de ${usuario.nome}`,
                text: `Confira o perfil de @${usuario.username} no Maré`,
                url,
            });
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                console.error("Erro ao compartilhar perfil:", error);
            }
        }
    }

    if (carregando) {
        return (
            <PageLayout>
                <PageContent>
                    <p className="py-10 text-center font-serif text-sm text-[var(--cor-texto-discreto)]">
                        Carregando perfil...
                    </p>
                </PageContent>
            </PageLayout>
        );
    }

    if (erro || !usuario) {
        return (
            <PageLayout>
                <PageContent>
                    <div className="py-12 text-center">
                        <UserCircleIcon
                            size={36}
                            className="mx-auto mb-4 text-[var(--cor-texto-discreto)]"
                        />

                        <p className="font-serif text-sm text-red-400">
                            {erro || "Perfil não encontrado."}
                        </p>

                        <div className="mt-5 flex justify-center">
                            <BotaoVoltar fallback="/" />
                        </div>
                    </div>
                </PageContent>
            </PageLayout>
        );
    }

    const posts = (usuario.posts ?? []).filter(
        (post) => post.musica?.id != null
    );

    return (
        <PageLayout>
            <PageContent>
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0">
                        {/* Busca */}
                        <div className="sticky top-[calc(50px+env(safe-area-inset-top))] z-20 md:top-0 bg-[var(--cor-fundo)]">
                            <div className="w-full max-w-[800px] pb-6 pt-6">
                                <SearchBar />
                            </div>
                        </div>

                        {/* Título da página */}
                        <div className="mb-6 flex items-center gap-4">
                            <BotaoVoltar fallback="/" />

                            <div className="min-w-0">
                                <h1 className="font-serif text-[26px] text-[var(--cor-texto-cinza-100)]">
                                    {usuario.nome}
                                </h1>

                                <p className="mt-1 truncate font-serif text-[13px] text-[var(--cor-texto-discreto)]">
                                    Músicas e publicações de @{usuario.username}
                                </p>
                            </div>
                        </div>

                        <section className="w-full overflow-hidden rounded-2xl border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie-profunda)]">
                            {/* Capa */}
                            <div
                                className="relative h-36 bg-gradient-to-br from-[#172a43] via-[#142033] to-[#0C121D] bg-cover bg-center sm:h-44"
                                style={
                                    usuario.capa
                                        ? {
                                            backgroundImage: `url("${usuario.capa}")`,
                                        }
                                        : undefined
                                }
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0C121D]/80 to-transparent" />
                            </div>

                            {/* Dados e ações */}
                            <div className="px-5 pb-6 sm:px-6">
                                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                                    <div className="flex min-w-0 items-end gap-4">
                                        <div className="relative z-0 -mt-12 flex h-[88px] w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#0C121D] bg-[#192538] sm:h-24 sm:w-24">
                                            {usuario.foto ? (
                                                <img
                                                    src={usuario.foto}
                                                    alt={`Foto de ${usuario.nome}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserCircleIcon
                                                    size={42}
                                                    className="text-[#8793a8]"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 pb-1">
                                            <h2 className="break-words text-lg font-semibold text-[var(--cor-texto-principal)]">
                                                {usuario.nome}
                                            </h2>

                                            <p className="text-sm text-[#8793a8]">
                                                @{usuario.username}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={compartilharPerfil}
                                            aria-label="Compartilhar perfil"
                                            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--cor-borda)] px-3 py-2 text-sm text-[var(--cor-texto-cinza-300)] transition hover:border-[var(--cor-destaque)] hover:text-[var(--cor-destaque)]"
                                        >
                                            <ShareNetworkIcon size={18} />
                                            <span>Compartilhar</span>
                                        </button>

                                        {ehMeuPerfil ? (
                                            <button
                                                type="button"
                                                onClick={() => navigate("/perfil")}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--cor-destaque)] px-3 py-2 text-sm text-[var(--cor-tinta)] transition hover:bg-[#80c0fa]"
                                            >
                                                <Settings size={17} />
                                                Editar perfil
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={alternarSeguir}
                                                disabled={processando}
                                                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${usuario.seguindoPorMim
                                                    ? "border border-[var(--cor-borda)] text-[var(--cor-texto-cinza-300)] hover:border-red-400 hover:text-red-400"
                                                    : "bg-[var(--cor-destaque)] text-[var(--cor-tinta)] hover:bg-[#80c0fa]"
                                                    }`}
                                            >
                                                {usuario.seguindoPorMim ? (
                                                    <UserCheck size={18} />
                                                ) : (
                                                    <UserPlus size={18} />
                                                )}

                                                {processando
                                                    ? "Aguarde..."
                                                    : usuario.seguindoPorMim
                                                        ? "Seguindo"
                                                        : "Seguir"}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="mt-5 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--cor-texto-cinza-300)]">
                                    {usuario.bio || (
                                        <span className="italic text-[var(--cor-texto-discreto)]">
                                            Este usuário ainda não adicionou uma bio.
                                        </span>
                                    )}
                                </p>

                                {/* Contadores */}
                                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--cor-borda-suave)] pt-5 text-sm text-[#8793a8]">
                                    <Link
                                        to={`/usuarios/${usuario.id}/seguidores?nome=${encodeURIComponent(usuario.nome)}&username=${encodeURIComponent(usuario.username)}`}
                                        className="transition hover:text-[var(--cor-destaque)]"
                                    >
                                        <strong className="text-[var(--cor-texto-principal)]">
                                            {usuario._count?.seguidores ?? 0}
                                        </strong>{" "}
                                        Seguidores
                                    </Link>

                                    <Link
                                        to={`/usuarios/${usuario.id}/seguindo?nome=${encodeURIComponent(usuario.nome)}&username=${encodeURIComponent(usuario.username)}`}
                                        className="transition hover:text-[var(--cor-destaque)]"
                                    >
                                        <strong className="text-[var(--cor-texto-principal)]">
                                            {usuario._count?.seguindo ?? 0}
                                        </strong>{" "}
                                        Seguindo
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        <MusicNoteIcon size={17} />

                                        <span>
                                            <strong className="text-[var(--cor-texto-principal)]">
                                                {usuario._count?.posts ?? posts.length}
                                            </strong>{" "}
                                            Avaliações
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Avaliações */}
                        {/* ABAS */}
                        <div className="mt-8 border-b border-[var(--cor-borda-discreta)]">
                            <div className="flex gap-8 overflow-x-auto">
                                <button
                                    type="button"
                                    onClick={() => setAba("avaliacoes")}
                                    className={`shrink-0 cursor-pointer border-b-2 px-1 pb-3 font-serif text-[14px] transition ${aba === "avaliacoes"
                                        ? "border-blue-400 text-[var(--cor-texto-principal)]"
                                        : "border-transparent text-gray-500 hover:text-blue-400"
                                        }`}
                                >
                                    Últimas avaliações
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setAba("comentarios")}
                                    className={`shrink-0 cursor-pointer border-b-2 px-1 pb-3 font-serif text-[14px] transition ${aba === "comentarios"
                                        ? "border-blue-400 text-[var(--cor-texto-principal)]"
                                        : "border-transparent text-gray-500 hover:text-blue-400"
                                        }`}
                                >
                                    Comentários
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 pt-6">
                            {aba === "avaliacoes" && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <MusicNoteIcon size={18} className="text-blue-400" />
                                        <h2 className="font-serif text-[18px] text-[var(--cor-texto-cinza-100)]">
                                            Últimas avaliações
                                        </h2>
                                    </div>

                                    {posts.length > 0 ? (
                                        posts.map((post) => (
                                            <PostCard
                                                key={post.id}
                                                postId={post.id}
                                                name={post.usuario?.nome ?? usuario.nome}
                                                username={post.usuario?.username ?? usuario.username}
                                                foto={post.usuario?.foto ?? usuario.foto ?? undefined}
                                                time={post.dataCriacao}
                                                content={post.texto ?? ""}
                                                nota={post.nota}
                                                editado={post.editado}
                                                musicId={post.musica!.id}
                                                musicTitle={post.musica?.titulo ?? "Música indisponível"}
                                                artist={post.musica?.artista?.nome ?? "Artista desconhecido"}
                                                artistId={post.musica?.artista?.id}
                                                musicCover={post.musica?.capa ?? undefined}
                                                duracaoSegundos={post.musica?.duracaoSegundos}
                                                likes={post._count?.curtidas ?? 0}
                                                comments={post._count?.comentarios ?? 0}
                                                avaliacoes={
                                                    post.musica?._count?.posts ??
                                                    post.musica?.avaliacoes ??
                                                    0
                                                }
                                                curtidoPorMim={post.curtidoPorMim ?? false}
                                                ehMeuPost={
                                                    meuId !== null && post.usuario?.id === meuId
                                                }
                                            />
                                        ))
                                    ) : (
                                        <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
                                            Nenhuma avaliação publicada.
                                        </p>
                                    )}
                                </>
                            )}

                            {aba === "comentarios" && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <ChatCircleIcon size={18} className="text-blue-400" />
                                        <h2 className="font-serif text-[18px] text-[var(--cor-texto-cinza-100)]">
                                            Comentários
                                        </h2>
                                    </div>

                                    {comentarios.length > 0 ? (
                                        comentarios.map((comentario) => (
                                            <ComentarioPerfilCard
                                                key={comentario.id}
                                                comentario={comentario}
                                            />
                                        ))
                                    ) : (
                                        <p className="py-8 text-center text-sm text-[var(--cor-texto-discreto)]">
                                            Nenhum comentário publicado.
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </section>

                    {/* RECOMENDAÇÕES */}
                    <aside className="hidden xl:block">
                        <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
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
