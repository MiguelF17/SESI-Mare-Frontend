import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    BellIcon,
    HeartIcon,
    ChatCircleIcon,
    UserCircleIcon,
    MusicNotesIcon,
    ArrowClockwiseIcon,
    CheckIcon,
} from "@phosphor-icons/react";

import PageLayout from "../components/pageLayout";
import PageContent from "../components/pageContent";
import SearchBar from "../components/searchbar";
import BotaoVoltar from "../components/botaoVoltar";
import RecommendedMusicList from "../components/recommendedMusicList";
import PostCard from "../components/postCard";

import { apiRequest } from "../api";

interface Notificacao {
    id: number;
    tipo: string;
    mensagem: string;
    lida: boolean;
    criadaEm: string;

    usuario?: {
        id: number;
        nome: string;
        username: string;
        foto: string | null;
    } | null;

    usuarioId?: number | null;
    postId?: number | null;
    musicaId?: number | null;
    textoComentario?: string | null;

    musica?: {
        id: number;
        titulo: string;
        capa: string | null;
        artista?: {
            nome: string;
        } | null;
    } | null;

    post?: {
        id: number;
        texto: string;
        nota: number;
        editado?: boolean;
        musica: {
            id: number;
            titulo: string;
            capa: string | null;
            artista?: {
                nome: string;
            } | null;
        } | null;
    } | null;
}

type Filtro = "todas" | "naoLidas";

function tempoNotificacao(data: string) {
    const dataNotificacao = new Date(data);

    if (Number.isNaN(dataNotificacao.getTime())) {
        return "";
    }

    const diferenca = Date.now() - dataNotificacao.getTime();

    if (diferenca < 0) {
        return "Agora";
    }

    const minutos = Math.floor(diferenca / 60000);

    if (minutos < 1) return "Agora";
    if (minutos < 60) return `Há ${minutos} min`;

    const horas = Math.floor(minutos / 60);

    if (horas < 24) return `Há ${horas} h`;

    const dias = Math.floor(horas / 24);

    if (dias < 7) {
        return `Há ${dias} dia${dias > 1 ? "s" : ""}`;
    }

    return dataNotificacao.toLocaleDateString("pt-BR");
}

export default function Notificacoes() {
    const navigate = useNavigate();

    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [filtro, setFiltro] = useState<Filtro>("todas");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [atualizando, setAtualizando] = useState<number | null>(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);
    const [seguindoIds, setSeguindoIds] = useState<number[]>([]);
    const [seguindoId, setSeguindoId] = useState<number | null>(null);

    const carregarNotificacoes = useCallback(async () => {
        await Promise.resolve();

        try {
            const dados = await apiRequest<Notificacao[]>("/notificacoes");

            if (!Array.isArray(dados)) {
                throw new Error("A API retornou uma lista inválida.");
            }

            setNotificacoes(dados);
        } catch (error) {
            console.error("Erro ao carregar notificações:", error);

            setErro(
                error instanceof Error
                    ? error.message
                    : "Não foi possível carregar as notificações."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        void Promise.resolve().then(carregarNotificacoes);
    }, [carregarNotificacoes, tentativa]);

    useEffect(() => {
        let ativo = true;

        async function carregarSeguindo() {
            try {
                const usuario = await apiRequest<{ id: number }>("/usuarios/me");
                const seguindo = await apiRequest<{ seguido: { id: number } }[]>(
                    `/usuarios/${usuario.id}/seguindo`
                );

                if (ativo) {
                    setSeguindoIds(seguindo.map((relacao) => relacao.seguido.id));
                }
            } catch (error) {
                console.error("Erro ao carregar quem você segue:", error);
            }
        }

        void carregarSeguindo();
        return () => { ativo = false; };
    }, []);

    const naoLidas = notificacoes.filter(
        (notificacao) => !notificacao.lida
    ).length;

    const notificacoesFiltradas = notificacoes.filter(
        (notificacao) =>
            filtro === "todas" || !notificacao.lida
    );

    function tentarNovamente() {
        setCarregando(true);
        setErro("");
        setTentativa((valor) => valor + 1);
    }

    function iconeNotificacao(tipo: string) {
        switch (tipo) {
            case "curtida":
                return <HeartIcon size={20} />;

            case "comentario":
                return <ChatCircleIcon size={20} />;

            case "seguir":
            case "seguidor":
                return <UserCircleIcon size={20} />;

            case "musica":
                return <MusicNotesIcon size={20} />;

            default:
                return <BellIcon size={20} />;
        }
    }

    async function marcarComoLida(id: number) {
        if (atualizando !== null) return;

        setAtualizando(id);
        setErro("");

        try {
            await apiRequest(`/notificacoes/${id}/lida`, {
                method: "PATCH",
            });

            setNotificacoes((lista) =>
                lista.map((notificacao) =>
                    notificacao.id === id
                        ? { ...notificacao, lida: true }
                        : notificacao
                )
            );
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
            setErro("Não foi possível atualizar a notificação.");
            throw error;
        } finally {
            setAtualizando(null);
        }
    }

    async function marcarTodasComoLidas() {
        if (naoLidas === 0 || marcandoTodas) return;

        setMarcandoTodas(true);
        setErro("");

        try {
            await apiRequest("/notificacoes/lidas", {
                method: "PATCH",
            });

            setNotificacoes((lista) =>
                lista.map((notificacao) => ({
                    ...notificacao,
                    lida: true,
                }))
            );
        } catch (error) {
            console.error("Erro ao atualizar notificações:", error);
            setErro("Não foi possível atualizar as notificações.");
        } finally {
            setMarcandoTodas(false);
        }
    }

    async function abrirNotificacao(notificacao: Notificacao) {
        if (!notificacao.lida) {
            try {
                await marcarComoLida(notificacao.id);
            } catch {
                return;
            }
        }

        if (notificacao.postId != null) {
            navigate(`/post/${notificacao.postId}`);
            return;
        }

        if (notificacao.musicaId != null) {
            navigate(`/musica/${notificacao.musicaId}`);
            return;
        }

        if (notificacao.usuario?.username) {
            navigate(
                `/u/${encodeURIComponent(notificacao.usuario.username)}`
            );
        }
    }

    async function seguirDeVolta(usuarioId: number) {
        if (seguindoId !== null) return;
        setSeguindoId(usuarioId);
        try {
            await apiRequest(`/usuarios/${usuarioId}/seguir`, { method: "POST" });
            setSeguindoIds((ids) => [...ids, usuarioId]);
        } catch (error) {
            console.error("Erro ao seguir usuário:", error);
        } finally {
            setSeguindoId(null);
        }
    }

    return (
        <PageLayout>
            <PageContent>
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0">
                        {/* Barra de busca */}
                        <div className="sticky top-[calc(40px+env(safe-area-inset-top))] z-20 md:top-0 bg-[var(--cor-fundo)]">
                            <div className="pt-3 sm:pt-6">
                                <SearchBar />
                            </div>
                        </div>

                        {/* Cabeçalho */}
                        <div className="mb-6 mt-6 flex items-center gap-4">
                            <BotaoVoltar fallback="/" />

                            <div className="min-w-0 flex-1">
                                <h1 className="font-serif text-2xl text-[var(--cor-texto-destaque)]">
                                    Notificações
                                </h1>

                                <p className="mt-1 font-serif text-[13px] text-[#718096]">
                                    Acompanhe as interações no seu perfil.
                                </p>
                            </div>

                            {naoLidas > 0 && (
                                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[var(--cor-destaque)]/15 px-2 text-xs font-medium text-[var(--cor-destaque)]">
                                    {naoLidas}
                                </span>
                            )}
                        </div>

                        {/* Lista de notificações */}
                        <section className="overflow-hidden rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)]">
                            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252d3c] px-4 py-4 sm:px-5">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFiltro("todas")}
                                        className={`cursor-pointer rounded-lg px-4 py-2 text-xs transition ${
                                            filtro === "todas"
                                                ? "bg-[var(--cor-superficie-elevada)] text-[var(--cor-destaque)]"
                                                : "text-[#718096] hover:bg-[var(--cor-superficie-elevada)] hover:text-[var(--cor-texto-destaque)]"
                                        }`}
                                    >
                                        Todas
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFiltro("naoLidas")}
                                        className={`cursor-pointer rounded-lg px-4 py-2 text-xs transition ${
                                            filtro === "naoLidas"
                                                ? "bg-[var(--cor-superficie-elevada)] text-[var(--cor-destaque)]"
                                                : "text-[#718096] hover:bg-[var(--cor-superficie-elevada)] hover:text-[var(--cor-texto-destaque)]"
                                        }`}
                                    >
                                        Não lidas
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={marcarTodasComoLidas}
                                    disabled={naoLidas === 0 || marcandoTodas}
                                    className="inline-flex text-[12px] cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-[var(--cor-destaque)] transition hover:bg-[var(--cor-superficie-elevada)] disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <CheckIcon size={20} />

                                    {marcandoTodas
                                        ? "Atualizando..."
                                        : "Marcar todas como lidas"}
                                </button>
                            </header>

                            {/* Carregamento */}
                            {carregando ? (
                                <div className="divide-y divide-[#252d3c]">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className="flex animate-pulse items-center gap-4 px-5 py-5"
                                        >
                                            <div className="h-11 w-11 shrink-0 rounded-full bg-[var(--cor-superficie-elevada)]" />

                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-3/4 rounded bg-[var(--cor-superficie-elevada)]" />
                                                <div className="h-3 w-20 rounded bg-[var(--cor-superficie-elevada)]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : erro && notificacoes.length === 0 ? (
                                /* Erro ao carregar */
                                <div className="flex flex-col items-center px-6 py-12 text-center">
                                    <p className="text-sm text-red-400">
                                        {erro}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={tentarNovamente}
                                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--cor-borda)] px-4 py-2 text-xs text-[var(--cor-destaque)] transition hover:bg-[var(--cor-superficie-elevada)]"
                                    >
                                        <ArrowClockwiseIcon size={16} />
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : notificacoesFiltradas.length === 0 ? (
                                /* Lista vazia */
                                <div className="flex flex-col items-center px-6 py-14 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie-elevada)]">
                                        <BellIcon
                                            size={28}
                                            className="text-[#718096]"
                                        />
                                    </div>

                                    <h2 className="text-base font-medium text-[var(--cor-texto-destaque)]">
                                        {filtro === "naoLidas"
                                            ? "Tudo em dia"
                                            : "Nenhuma notificação por enquanto"}
                                    </h2>

                                    <p className="mt-2 max-w-xs text-[13px] leading-5 text-[#718096]">
                                        {filtro === "naoLidas"
                                            ? "Você já conferiu todas as suas notificações."
                                            : "Quando alguém curtir suas publicações, comentar ou seguir você, os avisos aparecerão aqui."}
                                    </p>
                                </div>
                            ) : (
                                /* Notificações */
                                <div className="divide-y divide-[#252d3c]">
                                    {notificacoesFiltradas.map((notificacao) => (
                                        <div
                                            key={notificacao.id}
                                            className={`group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-[var(--cor-superficie-elevada)]/50 sm:gap-4 sm:px-5 ${
                                                !notificacao.lida
                                                    ? "bg-[var(--cor-destaque)]/[0.035]"
                                                    : ""
                                            }`}
                                        >
                                            <div
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(event) => {
                                                    if (event.key === "Enter" || event.key === " ") {
                                                        event.preventDefault();
                                                        void abrirNotificacao(notificacao);
                                                    }
                                                }}
                                                onClick={() =>
                                                    abrirNotificacao(notificacao)
                                                }
                                                aria-label="Abrir notificação"
                                                className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 text-left sm:gap-4"
                                            >
                                                {/* Foto ou ícone */}
                                                {notificacao.usuario?.foto ? (
                                                    <img
                                                        src={notificacao.usuario.foto}
                                                        alt=""
                                                        className="h-11 w-11 shrink-0 rounded-full border border-[var(--cor-borda)] object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie-elevada)] text-[var(--cor-destaque)]">
                                                        {iconeNotificacao(notificacao.tipo)}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    {/* Nome e ação */}
                                                    <p className="break-words text-[14px] leading-5 text-[#d1d5db]">
                                                        <span className="font-semibold text-[var(--cor-texto-destaque)]">
                                                            {notificacao.usuario?.nome ?? "Alguém"}
                                                        </span>{" "}
                                                        {notificacao.mensagem}
                                                    </p>

                                                    {notificacao.usuario?.username && (
                                                        <p className="mt-0.5 text-[12px] text-[#718096]">
                                                            @{notificacao.usuario.username}
                                                        </p>
                                                    )}

                                                    {(notificacao.tipo === "seguir" || notificacao.tipo === "seguidor") && notificacao.usuario?.id && (
                                                        <button
                                                            type="button"
                                                            disabled={seguindoId === notificacao.usuario.id || seguindoIds.includes(notificacao.usuario.id)}
                                                            onClick={(event) => { event.stopPropagation(); void seguirDeVolta(notificacao.usuario!.id); }}
                                                            className="mt-2 rounded-full bg-[var(--cor-destaque)] px-3 py-1.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
                                                        >
                                                            {seguindoIds.includes(notificacao.usuario.id) ? "Seguindo" : seguindoId === notificacao.usuario.id ? "Seguindo..." : "Seguir de volta"}
                                                        </button>
                                                    )}

                                                    {/* Texto do comentário */}
                                                    {notificacao.tipo === "comentario" &&
                                                        notificacao.textoComentario && (
                                                            <p className="mt-2 break-words text-sm leading-6 text-[#9ca8ba]">
                                                                “{notificacao.textoComentario}”
                                                            </p>
                                                        )}

                                                    {/* Publicação relacionada */}
                                                    {notificacao.post && (
                                                        <div
                                                            className="mt-3"
                                                            onClick={(event) => event.stopPropagation()}
                                                        >
                                                            <PostCard
                                                                postId={notificacao.post.id}
                                                                name={notificacao.usuario?.nome ?? "Usuário"}
                                                                username={notificacao.usuario?.username ?? null}
                                                                foto={notificacao.usuario?.foto ?? null}
                                                                time={notificacao.criadaEm}
                                                                content={notificacao.post.texto}
                                                                nota={notificacao.post.nota}
                                                                editado={notificacao.post.editado}
                                                                musicId={
                                                                    notificacao.post.musica?.id ??
                                                                    notificacao.musicaId ??
                                                                    0
                                                                }
                                                                musicTitle={notificacao.post.musica?.titulo ?? "Música"}
                                                                artist={notificacao.post.musica?.artista?.nome ?? ""}
                                                                musicCover={notificacao.post.musica?.capa ?? null}
                                                                modoNotificacao
                                                            />
                                                        </div>
                                                    )}

                                                    {/* Data */}
                                                    <p className="mt-2 text-[11px] text-[#718096]">
                                                        {tempoNotificacao(notificacao.criadaEm)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Ações da notificação */}
                                            <div className="flex shrink-0 items-center gap-2 pt-1">
                                                {!notificacao.lida && (
                                                    <span
                                                        className="h-2 w-2 rounded-full bg-[var(--cor-destaque)]"
                                                        title="Não lida"
                                                    />
                                                )}

                                                {!notificacao.lida && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            marcarComoLida(notificacao.id).catch(() => {});
                                                        }}
                                                        disabled={atualizando !== null}
                                                        title="Marcar como lida"
                                                        aria-label="Marcar como lida"
                                                        className="cursor-pointer rounded-lg p-2 text-[#718096] transition hover:bg-[var(--cor-superficie-elevada)] hover:text-[var(--cor-destaque)] disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <CheckIcon size={17} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {erro && notificacoes.length > 0 && (
                            <p className="mt-3 text-sm text-red-400">
                                {erro}
                            </p>
                        )}
                    </section>

                    {/* Músicas recomendadas */}
                    <aside className="hidden min-w-0 xl:block">
                        <div className="fixed top-2/5 w-[340px] -translate-y-2/5">
                            <h2 className="mb-5 font-serif text-base text-[var(--cor-texto-destaque)]">
                                Músicas recomendadas
                            </h2>

                            <RecommendedMusicList />
                        </div>
                    </aside>
                </div>
            </PageContent>
        </PageLayout>
    );
}
