import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart } from "lucide-react";

import {
    PaperPlaneTiltIcon,
    ChatCircleIcon,
    DotsThreeIcon,
    PencilSimpleIcon,
    TrashIcon,
    UserIcon,
    XIcon,
    CheckIcon,
} from "@phosphor-icons/react";

import toast from "react-hot-toast";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import PostCard from "../components/postCard";
import BotaoVoltar from "../components/botaoVoltar";
import RecommendedMusicList from "../components/recommendedMusicList";

import { apiRequest } from "../api";

import {
    buscarPostPorId,
    type Post as TipoPost,
} from "../services/postService";

import {
    buscarComentarios,
    criarComentario,
    excluirComentario as excluirComentarioServico,
    type Comentario,
} from "../services/comentarioService";

import calcularTempo from "../calcularTempo";

interface UsuarioLogado {
    id: number;
    foto?: string | null;
}

export default function Post() {
    const { id } = useParams();

    const [post, setPost] = useState<TipoPost | null>(null);
    const [comentarios, setComentarios] = useState<Comentario[]>([]);
    const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);
    const [usuarioLogadoFoto, setUsuarioLogadoFoto] = useState<string | null>(
        null
    );

    const [textoComentario, setTextoComentario] = useState("");
    const [comentarioComRespostaAbertaId, setComentarioComRespostaAbertaId] = useState<number | null>(null);
    const [textoResposta, setTextoResposta] = useState("");
    const [acoesComentario, setAcoesComentario] = useState<Record<number, { curtido: boolean; quantidade: number }>>({});
    const [comentarioEditandoId, setComentarioEditandoId] = useState<
        number | null
    >(null);
    const [textoEditado, setTextoEditado] = useState("");

    const [menuComentarioAberto, setMenuComentarioAberto] = useState<
        number | null
    >(null);
    const [comentarioExclusaoId, setComentarioExclusaoId] = useState<
        number | null
    >(null);

    const [carregando, setCarregando] = useState(true);
    const [enviando, setEnviando] = useState(false);
    const [salvandoEdicao, setSalvandoEdicao] = useState(false);
    const [excluindo, setExcluindo] = useState(false);
    const [erro, setErro] = useState("");

    const token = localStorage.getItem("token");

    function atualizarComentarioNaLista(
        comentarioId: number,
        atualizar: (comentario: Comentario) => Comentario
    ) {
        setComentarios((atuais) => atuais.map((comentario) => {
            if (comentario.id === comentarioId) return atualizar(comentario);

            return {
                ...comentario,
                respostas: comentario.respostas?.map((resposta) =>
                    resposta.id === comentarioId ? atualizar(resposta) : resposta
                ),
            };
        }));
    }

    useEffect(() => {
        let ativo = true;

        async function carregarDados() {
            if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
                setErro("Publicação não encontrada.");
                setCarregando(false);
                return;
            }

            setCarregando(true);
            setErro("");

            try {
                const [dadosPost, dadosComentarios] = await Promise.all([
                    buscarPostPorId(Number(id)),
                    buscarComentarios(Number(id)),
                ]);

                if (!ativo) return;

                setPost(dadosPost);
                setComentarios(dadosComentarios);
            } catch (error) {
                if (!ativo) return;

                setErro(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível carregar a publicação."
                );

                setPost(null);
            } finally {
                if (ativo) setCarregando(false);
            }
        }

        async function carregarUsuarioLogado() {
            if (!token) {
                setUsuarioLogadoId(null);
                setUsuarioLogadoFoto(null);
                return;
            }

            try {
                const usuario = await apiRequest<UsuarioLogado>("/usuarios/me");

                if (ativo) {
                    setUsuarioLogadoId(usuario.id);
                    setUsuarioLogadoFoto(usuario.foto ?? null);
                }
            } catch {
                if (ativo) {
                    setUsuarioLogadoId(null);
                    setUsuarioLogadoFoto(null);
                }
            }
        }

        carregarDados();
        carregarUsuarioLogado();

        return () => {
            ativo = false;
        };
    }, [id, token]);

    useEffect(() => {
        if (carregando || window.location.hash !== "#comentar") return;

        const campo = document.getElementById(
            "campo-comentario"
        ) as HTMLTextAreaElement | null;

        if (!campo) return;

        campo.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });

        campo.focus();
    }, [carregando, id]);

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
            const novoComentario = await criarComentario(Number(id), {
                texto,
            });
            setComentarios((atuais) => [...atuais, novoComentario]);

            setPost((atual) => {
                if (!atual) return atual;

                return {
                    ...atual,
                    _count: {
                        curtidas: atual._count?.curtidas ?? 0,
                        comentarios:
                            (atual._count?.comentarios ?? comentarios.reduce(
                                (total, comentario) => total + 1 + (comentario.respostas?.length ?? 0),
                                0,
                            )) + 1,
                    },
                };
            });

            setTextoComentario("");
            toast.success("Comentário enviado com sucesso!");
        } catch (error) {
            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível enviar o comentário."
            );

            toast.error("Não foi possível enviar o comentário.");
        } finally {
            setEnviando(false);
        }
    }

    async function enviarResposta(event: FormEvent<HTMLFormElement>, comentarioPai: Comentario) {
        event.preventDefault();
        const texto = textoResposta.trim();
        if (!texto || !id || enviando) return;
        if (!token) {
            setErro("Entre na sua conta para responder.");
            return;
        }

        setEnviando(true);
        try {
            const resposta = await criarComentario(Number(id), { texto, respostaAId: comentarioPai.id });
            const respostaComContexto = { ...resposta, respondendoA: comentarioPai.usuario };
            setComentarios((atuais) => atuais.map((comentario) => comentario.id === comentarioPai.id
                ? { ...comentario, respostas: [...(comentario.respostas ?? []), respostaComContexto] }
                : comentario));
            setPost((atual) => atual ? {
                ...atual,
                _count: {
                    curtidas: atual._count?.curtidas ?? 0,
                    comentarios: (atual._count?.comentarios ?? 0) + 1,
                },
            } : atual);
            setTextoResposta("");
            setComentarioComRespostaAbertaId(null);
            toast.success("Resposta enviada com sucesso!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Não foi possível enviar a resposta.");
        } finally {
            setEnviando(false);
        }
    }

    async function alternarCurtidaComentario(comentario: Comentario) {
        const atual = acoesComentario[comentario.id] ?? {
            curtido: comentario.curtidoPorMim ?? false,
            quantidade: comentario._count?.curtidas ?? 0,
        };
        const novoEstado = !atual.curtido;
        setAcoesComentario((estados) => ({ ...estados, [comentario.id]: { curtido: novoEstado, quantidade: Math.max(0, atual.quantidade + (novoEstado ? 1 : -1)) } }));
        try {
            await apiRequest(`/comentarios/${comentario.id}/curtir`, { method: novoEstado ? "POST" : "DELETE" });
        } catch (error) {
            setAcoesComentario((estados) => ({ ...estados, [comentario.id]: atual }));
            toast.error(error instanceof Error ? error.message : "Não foi possível curtir o comentário.");
        }
    }

    function iniciarEdicao(comentario: Comentario) {
        setComentarioEditandoId(comentario.id);
        setTextoEditado(comentario.texto);
        setMenuComentarioAberto(null);
        setErro("");
    }

    function cancelarEdicao() {
        setComentarioEditandoId(null);
        setTextoEditado("");
    }

    async function salvarEdicao(comentarioId: number) {
        const texto = textoEditado.trim();

        if (!texto || salvandoEdicao) return;

        if (texto.length > 500) {
            toast.error("O comentário pode ter no máximo 500 caracteres.");
            return;
        }

        setSalvandoEdicao(true);

        try {
            await apiRequest(`/comentarios/${comentarioId}`, {
                method: "PATCH",
                body: JSON.stringify({ texto }),
            });

            atualizarComentarioNaLista(comentarioId, (comentario) => ({
                ...comentario,
                texto,
                editado: true,
            }));

            cancelarEdicao();
            toast.success("Comentário atualizado!");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível editar o comentário."
            );
        } finally {
            setSalvandoEdicao(false);
        }
    }

    async function confirmarExclusao() {
        if (comentarioExclusaoId === null || excluindo) return;

        const comentarioId = comentarioExclusaoId;

        setExcluindo(true);

        try {
            await excluirComentarioServico(comentarioId);

            const comentarioPrincipal = comentarios.find((comentario) => comentario.id === comentarioId);
            const quantidadeRemovida = comentarioPrincipal
                ? 1 + (comentarioPrincipal.respostas?.length ?? 0)
                : 1;

            setComentarios((atuais) => atuais
                .filter((comentario) => comentario.id !== comentarioId)
                .map((comentario) => ({
                    ...comentario,
                    respostas: comentario.respostas?.filter((resposta) => resposta.id !== comentarioId),
                })));

            setPost((atual) => {
                if (!atual) return atual;

                return {
                    ...atual,
                    _count: {
                        curtidas: atual._count?.curtidas ?? 0,
                        comentarios: Math.max(
                            0,
                            (atual._count?.comentarios ?? comentarios.reduce(
                                (total, comentario) => total + 1 + (comentario.respostas?.length ?? 0),
                                0,
                            )) - quantidadeRemovida
                        ),
                    },
                };
            });

            setComentarioExclusaoId(null);
            toast.success("Comentário excluído com sucesso!");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Não foi possível excluir o comentário."
            );
        } finally {
            setExcluindo(false);
        }
    }

    if (carregando) {
        return (
            <PageLayout>
                <PageContent>
                    <p className="py-10 text-center text-sm text-[var(--cor-texto-discreto)]">
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

                        <BotaoVoltar fallback="/explorar" />
                    </div>
                </PageContent>
            </PageLayout>
        );
    }

    const totalComentarios =
        post._count?.comentarios ?? comentarios.reduce(
            (total, comentario) => total + 1 + (comentario.respostas?.length ?? 0),
            0,
        );
    const comentariosVisiveis = comentarios.flatMap((comentario) => [
        comentario,
        ...(comentario.respostas ?? []).map((resposta) => ({
            ...resposta,
            respondendoA: comentario.usuario,
        })),
    ]);

    return (
        <PageLayout>
            <PageContent>
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0">
                        {/* Cabeçalho */}
                        <div className="sticky top-[calc(50px+env(safe-area-inset-top))] z-20 md:top-0 border-b border-[#242b3a] bg-[var(--cor-fundo)]/95 backdrop-blur-md">
                            <div className="py-0 md:py-3">
                                <SearchBar />
                            </div>

                            <div className="flex items-center gap-5 py-3">
                                <BotaoVoltar fallback="/explorar" />

                                <div>
                                    <h1 className="text-base font-bold text-[var(--cor-texto-principal)]">
                                        Publicação
                                    </h1>

                                    <p className="text-xs text-[var(--cor-texto-discreto)]">
                                        {totalComentarios} respostas
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Publicação */}
                        <div className="border-b border-[#242b3a] py-4">
                            <PostCard
                                postId={post.id}
                                name={post.usuario?.nome || "Usuário"}
                                username={post.usuario?.username || ""}
                                foto={post.usuario?.foto}
                                time={post.dataCriacao}
                                content={post.texto}
                                nota={post.nota}
                                editado={post.editado}
                                musicId={post.musica?.id ?? 0}
                                musicTitle={post.musica?.titulo || ""}
                                artist={post.musica?.artista?.nome || "Artista desconhecido"}
                                artistId={post.musica?.artista?.id}
                                musicCover={post.musica?.capa}
                                duracaoSegundos={post.musica?.duracaoSegundos}
                                likes={post._count?.curtidas ?? 0}
                                comments={totalComentarios}
                                avaliacoes={post.musica?.avaliacoes}
                                curtidoPorMim={post.curtidoPorMim ?? false}
                                ehMeuPost={
                                    usuarioLogadoId !== null &&
                                    post.usuario?.id === usuarioLogadoId
                                }
                            />
                        </div>

                        {/* Campo para comentar */}
                        {token ? (
                            <form
                                id="comentar"
                                onSubmit={enviarComentario}
                                className="flex gap-3 border-b border-[var(--cor-borda)] px-1 py-5"
                            >
                                {usuarioLogadoFoto ? (
                                    <img
                                        src={usuarioLogadoFoto}
                                        alt="Sua foto"
                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a2130] text-[var(--cor-texto-discreto)]">
                                        <UserIcon size={20} />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <textarea
                                        id="campo-comentario"
                                        value={textoComentario}
                                        onChange={(event) =>
                                            setTextoComentario(event.target.value)
                                        }
                                        placeholder="Comente nesta publicação"
                                        rows={2}
                                        maxLength={500}
                                        className="w-full resize-none border-b border-[var(--cor-borda)] bg-transparent py-2 text-[15px] leading-6 text-[var(--cor-texto-principal)] outline-none placeholder:text-[var(--cor-texto-discreto)] focus:border-[var(--cor-destaque)]"
                                    />

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-[var(--cor-texto-discreto)]">
                                            {textoComentario.length}/500
                                        </span>

                                        <button
                                            type="submit"
                                            disabled={!textoComentario.trim() || enviando}
                                            className="flex cursor-pointer items-center gap-2 rounded-full bg-[var(--cor-destaque)] px-4 py-2 text-sm font-semibold text-[var(--cor-texto-principal)] transition hover:bg-[#438fd0] disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <PaperPlaneTiltIcon size={15} />
                                            {enviando ? "Enviando..." : "Comentar"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div
                                id="comentar"
                                className="border-b border-[var(--cor-borda)] px-1 py-5 text-sm text-[#9ca3af]"
                            >
                                <Link
                                    to="/login"
                                    className="text-[var(--cor-destaque)] hover:underline"
                                >
                                    Entre na sua conta
                                </Link>{" "}
                                para responder a esta publicação.
                            </div>
                        )}

                        {erro && (
                            <p className="px-1 py-3 text-sm text-red-400">{erro}</p>
                        )}

                        {/* Comentários */}
                        <section>
                            <h2 className="border-b border-[#242b3a] px-1 py-4 text-base font-bold text-[var(--cor-texto-principal)]">
                                Respostas
                            </h2>

                            {comentariosVisiveis.length > 0 ? (
                                comentariosVisiveis.map((comentario) => {
                                    const ehMeuComentario =
                                        usuarioLogadoId !== null &&
                                        usuarioLogadoId === comentario.usuario?.id;

                                    const editando =
                                        comentarioEditandoId === comentario.id;

                                    return (
                                        <article
                                            key={comentario.id}
                                            className={`border-b border-[#242b3a] px-1 py-4 transition hover:bg-white/5 ${comentario.respostaAId ? "ml-8 border-l border-l-[var(--cor-borda)] pl-4" : ""}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar do comentário */}
                                                {comentario.usuario?.foto ? (
                                                    <Link to={`/u/${encodeURIComponent(comentario.usuario.username || "")}`} aria-label={`Abrir perfil de ${comentario.usuario.nome}`} className="shrink-0">
                                                    <img
                                                        src={comentario.usuario.foto}
                                                        alt={comentario.usuario.nome || "Usuário"}
                                                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                                                    />
                                                    </Link>
                                                ) : (
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a2130] text-[var(--cor-texto-discreto)]">
                                                        <UserIcon size={20} />
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    {/* Nome, horário e opções */}
                                                    <div className="flex items-center gap-2">
                                                        {comentario.usuario?.username ? <Link to={`/u/${encodeURIComponent(comentario.usuario.username)}`} className="truncate text-sm font-semibold text-[var(--cor-texto-principal)] hover:text-[var(--cor-destaque)]">{comentario.usuario.nome || "Usuário"}</Link> : <span className="truncate text-sm font-semibold text-[var(--cor-texto-principal)]">{comentario.usuario?.nome || "Usuário"}</span>}
                                                        {comentario.usuario?.username && <Link to={`/u/${encodeURIComponent(comentario.usuario.username)}`} className="truncate text-xs text-[var(--cor-texto-discreto)] hover:text-[var(--cor-destaque)]">@{comentario.usuario.username}</Link>}

                                                        <span className="shrink-0 text-xs text-[var(--cor-texto-discreto)]">
                                                            · {calcularTempo(comentario.dataCriacao) === "agora" ? "agora" : `há ${calcularTempo(comentario.dataCriacao)}`}
                                                        </span>

                                                        {comentario.editado && (
                                                            <span
                                                                title="editado"
                                                                className="shrink-0 text-xs text-[var(--cor-texto-discreto)]"
                                                            >
                                                                · editado
                                                            </span>
                                                        )}

                                                        {token && ehMeuComentario && (
                                                            <div className="relative ml-auto shrink-0">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setMenuComentarioAberto((atual) =>
                                                                            atual === comentario.id
                                                                                ? null
                                                                                : comentario.id
                                                                        )
                                                                    }
                                                                    aria-label="Opções do comentário"
                                                                    aria-expanded={
                                                                        menuComentarioAberto === comentario.id
                                                                    }
                                                                    title="Opções"
                                                                    className="rounded-full cursor-pointer p-1.5 text-[var(--cor-texto-discreto)] transition hover:bg-white/10 hover:text-[var(--cor-texto-principal)]"
                                                                >
                                                                    <DotsThreeIcon
                                                                        size={22}
                                                                        weight="bold"
                                                                    />
                                                                </button>

                                                                {menuComentarioAberto === comentario.id && (
                                                                    <div className="absolute right-0 top-9 z-30 w-48 overflow-hidden rounded-xl border border-[var(--cor-borda)] bg-[#151b29] p-1.5 shadow-xl shadow-black/30">
                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                iniciarEdicao(comentario)
                                                                            }
                                                                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#d1d5db] transition hover:bg-white/5 hover:text-[var(--cor-texto-principal)]"
                                                                        >
                                                                            <PencilSimpleIcon size={17} />
                                                                            Editar comentário
                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                setMenuComentarioAberto(null);
                                                                                setComentarioExclusaoId(
                                                                                    comentario.id
                                                                                );
                                                                            }}
                                                                            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                                                                        >
                                                                            <TrashIcon size={17} />
                                                                            Excluir comentário
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Edição ou texto do comentário */}
                                                    {editando ? (
                                                        <div className="mt-3 rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-superficie-profunda)] p-3">
                                    <textarea
                                                                value={textoEditado}
                                                                onChange={(event) =>
                                                                    setTextoEditado(event.target.value)
                                                                }
                                                                maxLength={500}
                                                                rows={3}
                                                                autoFocus
                                                                className="w-full resize-y bg-transparent text-sm leading-6 text-[var(--cor-texto-principal)] outline-none placeholder:text-[var(--cor-texto-discreto)]"
                                                            />

                                                            <div className="mt-2 flex items-center justify-between border-t border-[#242b3a] pt-3">
                                                                <span className="text-xs text-[var(--cor-texto-discreto)]">
                                                                    {textoEditado.length}/500
                                                                </span>

                                                                <div className="flex gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={cancelarEdicao}
                                                                        disabled={salvandoEdicao}
                                                                        className="flex items-center cursor-pointer gap-1.5 rounded-lg px-3 py-2 text-xs text-[#9ca3af] transition hover:bg-white/5 hover:text-[var(--cor-texto-principal)] disabled:opacity-50"
                                                                    >
                                                                        <XIcon size={15} />
                                                                        Cancelar
                                                                    </button>

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            salvarEdicao(comentario.id)
                                                                        }
                                                                        disabled={
                                                                            !textoEditado.trim() ||
                                                                            salvandoEdicao
                                                                        }
                                                                        className="flex items-center cursor-pointer gap-1.5 rounded-lg bg-[var(--cor-destaque)] px-3 py-2 text-xs font-semibold text-[var(--cor-texto-principal)] transition hover:bg-[#438fd0] disabled:cursor-not-allowed disabled:opacity-40"
                                                                    >
                                                                        <CheckIcon size={15} />
                                                                        {salvandoEdicao
                                                                            ? "Salvando..."
                                                                            : "Salvar"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-[#d1d5db]">
                                                            {comentario.respondendoA && <><span className="font-medium text-[var(--cor-destaque)]">@{comentario.respondendoA.username || comentario.respondendoA.nome}</span>{" "}</>}{comentario.texto}
                                                        </p>
                                                    )}

                                                    <div className="mt-3 flex items-center gap-4 text-xs text-[var(--cor-texto-discreto)]">
                                                        <button type="button" onClick={() => void alternarCurtidaComentario(comentario)} className={`inline-flex cursor-pointer items-center gap-1.5 transition hover:text-pink-400 ${(acoesComentario[comentario.id]?.curtido ?? comentario.curtidoPorMim) ? "text-pink-400" : ""}`} aria-pressed={acoesComentario[comentario.id]?.curtido ?? comentario.curtidoPorMim ?? false} aria-label={(acoesComentario[comentario.id]?.curtido ?? comentario.curtidoPorMim) ? "Descurtir comentário" : "Curtir comentário"}><Heart size={17} fill={(acoesComentario[comentario.id]?.curtido ?? comentario.curtidoPorMim) ? "currentColor" : "none"} />{acoesComentario[comentario.id]?.quantidade ?? comentario._count?.curtidas ?? 0}</button>
                                                        {!comentario.respostaAId && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setComentarioComRespostaAbertaId((atual) => atual === comentario.id ? null : comentario.id);
                                                                    setTextoResposta("");
                                                                }}
                                                                className="inline-flex cursor-pointer items-center gap-1.5 transition hover:text-[var(--cor-destaque)]"
                                                            >
                                                                <ChatCircleIcon size={15} />Responder
                                                            </button>
                                                        )}
                                                    </div>
                                                    {comentarioComRespostaAbertaId === comentario.id && !comentario.respostaAId && (
                                                        token ? (
                                                            <form onSubmit={(event) => void enviarResposta(event, comentario)} className="mt-3 border-l border-[var(--cor-borda)] pl-3">
                                                                <p className="mb-1 text-xs text-[var(--cor-destaque)]">Respondendo a @{comentario.usuario.username || comentario.usuario.nome}</p>
                                                                <textarea value={textoResposta} onChange={(event) => setTextoResposta(event.target.value)} maxLength={500} rows={2} placeholder="Escreva sua resposta..." className="w-full resize-y rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-superficie-profunda)] px-3 py-2 text-sm text-[var(--cor-texto-principal)] outline-none focus:border-[var(--cor-destaque)]" />
                                                                <div className="mt-2 flex items-center justify-between">
                                                                    <span className="text-xs text-[var(--cor-texto-discreto)]">{textoResposta.length}/500</span>
                                                                    <div className="flex gap-2">
                                                                        <button type="button" onClick={() => setComentarioComRespostaAbertaId(null)} className="rounded-lg px-3 py-1.5 text-xs text-[var(--cor-texto-discreto)] hover:bg-white/5">Cancelar</button>
                                                                        <button type="submit" disabled={!textoResposta.trim() || enviando} className="rounded-lg bg-[var(--cor-destaque)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{enviando ? "Enviando..." : "Responder"}</button>
                                                                    </div>
                                                                </div>
                                                            </form>
                                                        ) : (
                                                            <p className="mt-3 border-l border-[var(--cor-borda)] pl-3 text-sm text-[var(--cor-texto-discreto)]"><Link to="/login" className="text-[var(--cor-destaque)] hover:underline">Entre na sua conta</Link> para responder.</p>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            ) : (
                                <div className="px-4 py-10 text-center">
                                    <h3 className="text-base font-semibold text-[var(--cor-texto-principal)]">
                                        Ainda não há respostas
                                    </h3>

                                    <p className="mt-2 text-sm text-[var(--cor-texto-discreto)]">
                                        Seja a primeira pessoa a comentar nesta publicação.
                                    </p>
                                </div>
                            )}
                        </section>
                    </section>

                    {/* Músicas recomendadas */}
                    <aside className="hidden xl:block">
                        <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
                            <h2 className="mb-5 font-serif text-base text-[var(--cor-texto-principal)]">
                                Músicas recomendadas
                            </h2>

                            <div className="flex flex-col gap-3">
                                <RecommendedMusicList />
                            </div>
                        </div>
                    </aside>
                </div>
            </PageContent>

            {/* Confirmação de exclusão */}
            {comentarioExclusaoId !== null && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="titulo-exclusao"
                        className="w-full max-w-sm rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-5 shadow-2xl shadow-black/40"
                    >
                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
                            <TrashIcon size={22} />
                        </div>

                        <h2
                            id="titulo-exclusao"
                            className="text-base font-semibold text-[var(--cor-texto-principal)]"
                        >
                            Excluir comentário?
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-[#9ca3af]">
                            Essa ação não pode ser desfeita. Deseja excluir este comentário?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setComentarioExclusaoId(null)}
                                disabled={excluindo}
                                className="rounded-lg border cursor-pointer border-[var(--cor-borda)] px-4 py-2.5 text-sm text-[#d1d5db] transition hover:bg-white/5 disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={confirmarExclusao}
                                disabled={excluindo}
                                className="rounded-lg cursor-pointer bg-red-500 px-5 py-2.5 text-sm font-semibold text-[var(--cor-texto-principal)] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {excluindo ? "Excluindo..." : "Excluir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PageLayout>
    );
}
