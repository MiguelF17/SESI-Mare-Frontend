import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeftIcon, PaperPlaneTiltIcon, ChatCircleIcon, TrashIcon } from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import RecommendedMusic from "../components/recommendedMusic";
import PostCard from "../components/postCard";

import { API_URL } from "../api";
import calcularTempo from "../calcularTempo";
import fotoPadrao from "../assets/logo.png";

interface Comentario {
    id: number;
    texto: string;
    dataCriacao: string;
    usuario: {
        id: number;
        nome: string;
        foto?: string | null;
    };
}

export default function Post() {
    const { id } = useParams();

    const [post, setPost] = useState<any>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [musicas, setMusicas] = useState<any[]>([]);
    const [textoComentario, setTextoComentario] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [erro, setErro] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            if (!id) return;

            setCarregando(true);
            setErro("");

            try {
                const [respostaPost, respostaComentarios] = await Promise.all([
                    fetch(`${API_URL}/posts/${id}`),
                    fetch(`${API_URL}/posts/${id}/comentarios`),
                ]);

                if (!respostaPost.ok) {
                    throw new Error("Não foi possível encontrar este post.");
                }

                if (!respostaComentarios.ok) {
                    throw new Error("Não foi possível carregar os comentários.");
                }

                const [dadosPost, dadosComentarios] = await Promise.all([
                    respostaPost.json(),
                    respostaComentarios.json(),
                ]);

                if (ativo) {
                    setPost(dadosPost);
                    setComentarios(dadosComentarios);
                }
            } catch (error) {
                if (ativo) {
                    setErro(
                        error instanceof Error
                            ? error.message
                            : "Erro ao carregar o post."
                    );
                }
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        async function carregarMusicas() {
            try {
                const resposta = await fetch(`${API_URL}/musicas`);

                if (!resposta.ok) return;

                const dados = await resposta.json();

                if (ativo) setMusicas(dados);
            } catch (error) {
                console.error("Erro ao buscar músicas recomendadas:", error);
            }
        }

        carregarDados();
        carregarMusicas();

        return () => {
            ativo = false;
        };
    }, [id]);

    async function enviarComentario(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const texto = textoComentario.trim();

        if (!texto || !id || enviando) return;

        if (!token) {
            setErro("Entre na sua conta para comentar.");
            return;
        }

        setEnviando(true);
        setErro("");

        try {
            const resposta = await fetch(
                `${API_URL}/posts/${id}/comentarios`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ texto }),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.error || "Não foi possível enviar o comentário."
                );
            }

            setComentarios((atuais) => [...atuais, dados]);
            setTextoComentario("");

            setPost((atual: any) => ({
                ...atual,
                _count: {
                    ...atual._count,
                    comentarios: (atual._count?.comentarios ?? 0) + 1,
                },
            }));
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao enviar comentário."
            );
        } finally {
            setEnviando(false);
        }
    }

    async function excluirComentario(comentarioId: number) {
        if (!token) return;

        if (!window.confirm("Deseja excluir este comentário?")) return;

        try {
            const resposta = await fetch(
                `${API_URL}/comentarios/${comentarioId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.error || "Não foi possível excluir.");
            }

            setComentarios((atuais) =>
                atuais.filter((comentario) => comentario.id !== comentarioId)
            );

            setPost((atual: any) => ({
                ...atual,
                _count: {
                    ...atual._count,
                    comentarios: Math.max(
                        0,
                        (atual._count?.comentarios ?? 1) - 1
                    ),
                },
            }));
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Erro ao excluir comentário."
            );
        }
    }

    if (carregando) {
        return (
            <PageLayout>
                <PageContent>
                    <p className="py-10 text-center text-sm text-[#697386]">
                        Carregando publicação...
                    </p>
                </PageContent>
            </PageLayout>
        );
    }

    if (!post) {
        return (
            <PageLayout>
                <PageContent>
                    <div className="py-10 text-center">
                        <p className="text-sm text-[#d1d5db]">
                            {erro || "Publicação não encontrada."}
                        </p>

                        <Link
                            to="/home"
                            className="mt-4 inline-block text-sm text-[#58AAF0] hover:underline"
                        >
                            Voltar para a Home
                        </Link>
                    </div>
                </PageContent>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <PageContent>
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">

                    {/* COLUNA PRINCIPAL */}
                    <section className="min-w-0">
                        {/* BUSCA FIXA */}

                        {/* CABEÇALHO DA PUBLICAÇÃO */}
                        <div className="sticky top-0 z-20 border-b border-[#242b3a] bg-[#080A10]/95 backdrop-blur-md">
                            <div className="py-3">
                                <SearchBar />
                            </div>

                            <div className="flex items-center gap-5 py-3">
                                <Link
                                    to="/home"
                                    aria-label="Voltar para a Home"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#d1d5db] transition hover:bg-[#202536] hover:text-white"
                                >
                                    <ArrowLeftIcon size={24} weight="bold" />
                                </Link>

                                <div>
                                    <h1 className="text-base font-bold text-white">
                                        Publicação
                                    </h1>
                                    <p className="text-xs text-[#697386]">
                                        {post._count?.comentarios ?? comentarios.length} respostas
                                    </p>
                                </div>
                            </div>
                        </div>


                        {/* PUBLICAÇÃO */}
                        <div className="border-b border-[#242b3a] py-4">
                            <PostCard
                                name={post.usuario?.nome || "Usuário"}
                                username={post.usuario?.username || ""}
                                foto={post.usuario?.foto}
                                time={post.dataCriacao}
                                content={post.texto}
                                nota={post.nota}
                                musicId={post.musica?.id}
                                musicTitle={post.musica?.titulo || ""}
                                artist={post.musica?.artista?.nome || "Artista desconhecido"}
                                artistId={post.musica?.artista?.id}
                                musicCover={post.musica?.capa}
                                duracaoSegundos={post.musica?.duracaoSegundos}
                                likes={post._count?.curtidas ?? 0}
                                comments={post._count?.comentarios ?? comentarios.length}
                                avaliacoes={post.musica?.avaliacoes}
                            />
                        </div>

                        {/* CAMPO DE COMENTÁRIO */}
                        {token ? (
                            <form
                                onSubmit={enviarComentario}
                                className="flex gap-3 border-b border-[#354052] px-1 py-5"
                            >
                                <img
                                    src={fotoPadrao}
                                    alt="Sua foto"
                                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                                />

                                <div className="min-w-0 flex-1">
                                    <textarea
                                        value={textoComentario}
                                        onChange={(event) =>
                                            setTextoComentario(event.target.value)
                                        }
                                        placeholder="Publique sua resposta"
                                        rows={2}
                                        maxLength={500}
                                        className="w-full resize-none border-b border-[#354052] bg-transparent py-2 text-[15px] leading-6 text-white outline-none placeholder:text-[#697386] focus:border-[#58AAF0]"
                                    />

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-[#697386]">
                                            {textoComentario.length}/500
                                        </span>

                                        <button
                                            type="submit"
                                            disabled={!textoComentario.trim() || enviando}
                                            className="flex cursor-pointer items-center gap-2 rounded-full bg-[#58AAF0] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#438fd0] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <PaperPlaneTiltIcon size={15} />
                                            {enviando ? "Enviando..." : "Responder"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="border-b border-[#354052] px-1 py-5 text-sm text-[#9ca3af]">
                                <Link
                                    to="/login"
                                    className="text-[#58AAF0] hover:underline"
                                >
                                    Entre na sua conta
                                </Link>{" "}
                                para responder a esta publicação.
                            </div>
                        )}

                        {erro && (
                            <p className="px-1 py-3 text-sm text-red-400">{erro}</p>
                        )}

                        {/* LISTA DE COMENTÁRIOS — ESTILO X */}
                        <section>
                            <h2 className="border-b border-[#242b3a] px-1 py-4 text-base font-bold text-white">
                                Respostas
                            </h2>

                            {comentarios.length > 0 ? (
                                comentarios.map((comentario) => (
                                    <article
                                        key={comentario.id}
                                        className="border-b border-[#242b3a] px-1 py-4 transition hover:bg-white/[0.02]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={comentario.usuario?.foto || fotoPadrao}
                                                alt={comentario.usuario?.nome || "Usuário"}
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-x-2">
                                                    <span className="text-sm font-semibold text-white">
                                                        {comentario.usuario?.nome || "Usuário"}
                                                    </span>

                                                    <span className="text-xs text-[#697386]">
                                                        · há {calcularTempo(comentario.dataCriacao)}
                                                    </span>
                                                </div>

                                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#d1d5db]">
                                                    {comentario.texto}
                                                </p>

                                                <div className="mt-3 flex items-center gap-2 text-[#697386]">
                                                    <ChatCircleIcon size={15} />

                                                    {token && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                excluirComentario(comentario.id)
                                                            }
                                                            title="Excluir comentário"
                                                            className="ml-auto cursor-pointer rounded-full p-2 transition hover:bg-red-500/10 hover:text-red-400"
                                                        >
                                                            <TrashIcon size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="px-4 py-10 text-center">
                                    <h3 className="text-base font-semibold text-white">
                                        Ainda não há respostas
                                    </h3>

                                    <p className="mt-2 text-sm text-[#697386]">
                                        Seja a primeira pessoa a comentar nesta publicação.
                                    </p>
                                </div>
                            )}
                        </section>
                    </section>

                    {/* COLUNA LATERAL — MÚSICAS RECOMENDADAS */}
                    <aside className="hidden xl:block">
                        <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
                            <h2 className="mb-5 font-serif text-base text-white">
                                Músicas recomendadas
                            </h2>

                            <div className="flex flex-col gap-3">
                                {musicas.length > 0 ? (
                                    musicas.slice(0, 5).map((musica) => (
                                        <RecommendedMusic
                                            key={musica.id}
                                            id={musica.id}
                                            titulo={musica.titulo}
                                            artist={musica.artista?.nome || "Artista desconhecido"}
                                            capa={musica.capa}
                                        />
                                    ))
                                ) : (
                                    <p className="py-5 text-sm text-[#697386]">
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
