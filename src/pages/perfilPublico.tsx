import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    UserCircleIcon,
    UserPlus,
    UserCheck,
    MusicNoteIcon,
    ShareNetworkIcon,
} from "@phosphor-icons/react";
import { Settings, User } from "lucide-react";
import toast from "react-hot-toast";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import RecommendedMusic from "../components/recommendedMusic";
import BotaoVoltar from "../components/botaoVoltar";

import {
    buscarMeuPerfil,
    buscarPerfilPublico,
    seguirUsuario,
    deixarDeSeguirUsuario,
    type PerfilPublico as PerfilPublicoTipo,
} from "../services/usuarioService";

import {
    buscarMusicas,
    type Musica,
} from "../services/musicaService";

export default function PerfilPublico() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();

    const [usuario, setUsuario] = useState<PerfilPublicoTipo | null>(null);
    const [musicas, setMusicas] = useState<Musica[]>([]);
    const [meuId, setMeuId] = useState<number | null>(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [processando, setProcessando] = useState(false);

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

            try {
                const perfil = await buscarPerfilPublico(username);

                if (ativo) {
                    setUsuario(perfil);
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
                    <p className="py-10 text-center font-serif text-sm text-[#697386]">
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
                            className="mx-auto mb-4 text-[#697386]"
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
                        <div className="sticky top-0 z-20 bg-[#080A10]">
                            <div className="w-full max-w-[800px] pb-6 pt-6">
                                <SearchBar />
                            </div>
                        </div>

                        {/* Título da página */}
                        <div className="mb-6 flex items-center gap-4">
                            <BotaoVoltar fallback="/" />

                            <div className="min-w-0">
                                <h1 className="font-serif text-[26px] text-gray-100">
                                    {usuario.nome}
                                </h1>

                                <p className="mt-1 truncate font-serif text-[13px] text-[#697386]">
                                    Músicas e publicações de @{usuario.username}
                                </p>
                            </div>
                        </div>

                        {/* Cabeçalho do perfil */}
                        <section className="w-full overflow-hidden rounded-xl border border-[#252d38] bg-[#0d121c]">
                            {/* Capa */}
                            <div
                                className="h-[140px] bg-[#141a28] bg-cover bg-center"
                                style={
                                    usuario.capa
                                        ? { backgroundImage: `url("${usuario.capa}")` }
                                        : undefined
                                }
                            />

                            {/* Informações */}
                            <div className="px-6 pb-6">
                                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                                    <div className="flex min-w-0 items-end gap-4">
                                        <div className="-mt-4 flex h-[82px] w-[82px] shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-[#0d121c] bg-[#1a2130]">
                                            {usuario.foto ? (
                                                <img
                                                    src={usuario.foto}
                                                    alt={`Foto de ${usuario.nome}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserCircleIcon
                                                    size={34}
                                                    className="text-gray-400"
                                                />
                                            )}
                                        </div>

                                        <div className="min-w-0 pb-1">
                                            <div className="flex flex-wrap items-baseline gap-x-2">
                                                <h2 className="font-serif text-[18px] text-gray-100">
                                                    {usuario.nome}
                                                </h2>

                                                <p className="font-serif text-[16px] text-gray-500">
                                                    @{usuario.username}
                                                </p>
                                            </div>

                                            <p className="mt-1 whitespace-pre-wrap break-words font-serif text-[12px] text-gray-500">
                                                {usuario.bio || "Ainda não adicionou uma bio."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Ações do perfil */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={compartilharPerfil}
                                            className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#252d38] px-4 py-2 font-serif text-[12px] text-gray-300 transition hover:border-blue-400 hover:text-blue-400"
                                        >
                                            <ShareNetworkIcon size={18} />
                                            Compartilhar
                                        </button>

                                        {ehMeuPerfil ? (
                                            <button
                                                type="button"
                                                onClick={() => navigate("/perfil")}
                                                className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#5ea3ee] px-4 py-2 font-serif text-[12px] text-white transition hover:bg-[#7ab4f2]"
                                            >
                                                <Settings size={17} />
                                                Editar perfil
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={alternarSeguir}
                                                disabled={processando}
                                                className={`flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 font-serif text-[12px] transition disabled:cursor-not-allowed disabled:opacity-50 ${usuario.seguindoPorMim
                                                    ? "border border-[#252d38] text-gray-300 hover:border-red-400 hover:text-red-400"
                                                    : "bg-[#5ea3ee] text-white hover:bg-[#7ab4f2]"
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

                                {/* Contadores */}
                                <div className="mt-5 flex flex-wrap gap-6 font-serif text-[14px] text-gray-400">
                                    <Link
                                        to={`/usuarios/${usuario.id}/seguidores?nome=${encodeURIComponent(usuario.nome)}&username=${encodeURIComponent(usuario.username)}`}
                                        className="transition-colors hover:text-[#58AAF0]"
                                    >
                                        <strong className="text-gray-200">
                                            {usuario._count?.seguidores ?? 0}
                                        </strong>{" "}
                                        Seguidores
                                    </Link>

                                    <Link
                                        to={`/usuarios/${usuario.id}/seguindo?nome=${encodeURIComponent(usuario.nome)}&username=${encodeURIComponent(usuario.username)}`}
                                        className="transition-colors hover:text-[#58AAF0]"
                                    >
                                        <strong className="text-gray-200">
                                            {usuario._count?.seguindo ?? 0}
                                        </strong>{" "}
                                        Seguindo
                                    </Link>

                                    <span>
                                        <strong className="text-gray-200">
                                            {usuario._count?.posts ?? posts.length}
                                        </strong>{" "}
                                        Avaliações
                                    </span>
                                </div>

                            </div>
                        </section>

                        {/* Avaliações */}
                        <div className="mt-8 border-b border-[#252d38]">
                            <div className="flex gap-8">
                                <div className="shrink-0 border-b-2 border-blue-400 px-1 pb-3 font-serif text-[14px] text-white">
                                    Últimas avaliações
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 pt-6">
                            <div className="flex items-center gap-2">
                                <MusicNoteIcon
                                    size={18}
                                    className="text-blue-400"
                                />

                                <h2 className="font-serif text-[18px] text-gray-100">
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
                                        musicId={post.musica!.id}
                                        musicTitle={
                                            post.musica?.titulo ?? "Música indisponível"
                                        }
                                        artist={
                                            post.musica?.artista?.nome ??
                                            "Artista desconhecido"
                                        }
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
                                <div className="rounded-xl border border-[#252d38] bg-[#0d121c] px-6 py-12 text-center">
                                    <MusicNoteIcon
                                        size={30}
                                        className="mx-auto mb-3 text-[#697386]"
                                    />

                                    <p className="font-serif text-[14px] text-gray-300">
                                        Nenhuma avaliação publicada.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* RECOMENDAÇÕES */}
                    <aside className="hidden xl:block">
                        <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
                            <h2 className="mb-5 font-serif text-[16px] text-white">
                                Músicas recomendadas
                            </h2>

                            <div className="flex flex-col gap-3">
                                {musicas.length > 0 ? (
                                    musicas.slice(0, 5).map((musica) => (
                                        <RecommendedMusic
                                            id={musica.id}
                                            key={musica.id}
                                            titulo={musica.titulo}
                                            artist={musica.artista?.nome ?? "Artista desconhecido"}
                                            capa={musica.capa ?? undefined}
                                        />
                                    ))
                                ) : (
                                    <p className="py-8 text-center text-[14px] text-[#697386]">
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