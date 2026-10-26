import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Bell,
    Heart,
    MessageCircle,
    UserRound,
    Music2,
    CheckCheck,
    RefreshCw,
    Check,
} from "lucide-react";

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

export default function Notificacoes() {
    const navigate = useNavigate();

    const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
    const [filtro, setFiltro] = useState<Filtro>("todas");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [tentativa, setTentativa] = useState(0);
    const [atualizando, setAtualizando] = useState<number | null>(null);
    const [marcandoTodas, setMarcandoTodas] = useState(false);

    // Carrega as notificações do usuário logado.
    const carregarNotificacoes = useCallback(async () => {
        try {
            setCarregando(true);
            setErro("");

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
        carregarNotificacoes();
    }, [carregarNotificacoes, tentativa]);

    const naoLidas = notificacoes.filter(
        (notificacao) => !notificacao.lida
    ).length;

    const notificacoesFiltradas = notificacoes.filter(
        (notificacao) =>
            filtro === "todas" || !notificacao.lida
    );

    // Escolhe o ícone conforme o tipo de notificação.
    function iconeNotificacao(tipo: string) {
        switch (tipo) {
            case "curtida":
                return <Heart size={19} />;

            case "comentario":
                return <MessageCircle size={19} />;

            case "seguir":
            case "seguidor":
                return <UserRound size={19} />;

            case "musica":
                return <Music2 size={19} />;

            default:
                return <Bell size={19} />;
        }
    }

    // Formata a data em um texto mais fácil de ler.
    function tempoNotificacao(data: string) {
        const dataNotificacao = new Date(data);
        const diferenca = Date.now() - dataNotificacao.getTime();

        if (Number.isNaN(dataNotificacao.getTime())) {
            return "";
        }

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

    // Marca uma notificação específica como lida.
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

    // Marca todas as notificações como lidas.
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

    // Abre a publicação, música ou perfil relacionado.
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

    return (
        <PageLayout>
            <PageContent>
                <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <section className="min-w-0">
                        {/* Barra de busca */}
                        <div className="sticky top-0 z-20 bg-[#080A10]">
                            <div className="pt-6">
                                <SearchBar />
                            </div>
                        </div>

                        {/* Cabeçalho */}
                        <div className="mb-6 mt-6 flex items-center gap-4">
                            <BotaoVoltar fallback="/" />

                            <div className="min-w-0 flex-1">
                                <h1 className="font-serif text-[24px] text-white">
                                    Notificações
                                </h1>

                                <p className="mt-1 font-serif text-[13px] text-[#697386]">
                                    Acompanhe as interações no seu perfil.
                                </p>
                            </div>

                            {naoLidas > 0 && (
                                <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#58AAF0]/15 px-2 font-serif text-xs text-[#58AAF0]">
                                    {naoLidas}
                                </span>
                            )}
                        </div>

                        {/* Lista de notificações */}
                        <section className="overflow-hidden rounded-xl border border-[#252d38] bg-[#0d121c]">
                            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#252d38] px-4 py-4 sm:px-5">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFiltro("todas")}
                                        className={`cursor-pointer rounded-lg px-4 py-2 font-serif text-[12px] transition ${filtro === "todas"
                                            ? "bg-[#58AAF0]/15 text-[#58AAF0]"
                                            : "text-[#9aa6ba] hover:bg-[#141b29]"
                                            }`}
                                    >
                                        Todas
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFiltro("naoLidas")}
                                        className={`cursor-pointer rounded-lg px-4 py-2 font-serif text-[12px] transition ${filtro === "naoLidas"
                                            ? "bg-[#58AAF0]/15 text-[#58AAF0]"
                                            : "text-[#9aa6ba] hover:bg-[#141b29]"
                                            }`}
                                    >
                                        Não lidas
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={marcarTodasComoLidas}
                                    disabled={naoLidas === 0 || marcandoTodas}
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 font-serif text-[11px] text-[#58AAF0] transition hover:bg-[#58AAF0]/10 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <CheckCheck size={15} />

                                    {marcandoTodas
                                        ? "Atualizando..."
                                        : "Marcar todas como lidas"}
                                </button>
                            </header>

                            {/* Carregamento */}
                            {carregando ? (
                                <div className="divide-y divide-[#252d38]">
                                    {[1, 2, 3, 4].map((item) => (
                                        <div
                                            key={item}
                                            className="flex animate-pulse items-center gap-4 px-5 py-5"
                                        >
                                            <div className="h-12 w-12 shrink-0 rounded-full bg-[#202737]" />

                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 w-3/4 rounded bg-[#202737]" />
                                                <div className="h-3 w-20 rounded bg-[#202737]" />
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
                                        onClick={() =>
                                            setTentativa((valor) => valor + 1)
                                        }
                                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#354052] px-4 py-2 font-serif text-xs text-[#58AAF0] transition hover:bg-[#58AAF0]/10"
                                    >
                                        <RefreshCw size={15} />
                                        Tentar novamente
                                    </button>
                                </div>
                            ) : notificacoesFiltradas.length === 0 ? (
                                /* Lista vazia */
                                <div className="flex flex-col items-center px-6 py-14 text-center">
                                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#354052] bg-[#111827]">
                                        <Bell
                                            size={27}
                                            className="text-[#697386]"
                                        />
                                    </div>

                                    <h2 className="font-serif text-base text-gray-100">
                                        {filtro === "naoLidas"
                                            ? "Tudo em dia"
                                            : "Nenhuma notificação por enquanto"}
                                    </h2>

                                    <p className="mt-2 max-w-xs font-serif text-[13px] leading-5 text-[#697386]">
                                        {filtro === "naoLidas"
                                            ? "Você já conferiu todas as suas notificações."
                                            : "Quando alguém curtir suas publicações, comentar ou seguir você, os avisos aparecerão aqui."}
                                    </p>
                                </div>
                            ) : (
                                /* Notificações */
                                <div className="divide-y divide-[#252d38]">
                                    {notificacoesFiltradas.map((notificacao) => (
                                        <div
                                            key={notificacao.id}
                                            className={`group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-[#141b29] sm:gap-4 sm:px-5 ${!notificacao.lida
                                                ? "bg-[#58AAF0]/[0.035]"
                                                : ""
                                                }`}
                                        >
                                            <button
                                                type="button"
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
                                                        className="h-12 w-12 shrink-0 rounded-full border border-[#354052] object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#354052] bg-[#171e2c] text-[#58AAF0]">
                                                        {iconeNotificacao(notificacao.tipo)}
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    {/* Nome e ação */}
                                                    <p className="break-words font-serif text-[13px] leading-5 text-gray-200">
                                                        <span className="font-semibold text-white">
                                                            {notificacao.usuario?.nome ?? "Alguém"}
                                                        </span>{" "}
                                                        {notificacao.mensagem}
                                                    </p>

                                                    {notificacao.usuario?.username && (
                                                        <p className="mt-0.5 font-serif text-[11px] text-[#697386]">
                                                            @{notificacao.usuario.username}
                                                        </p>
                                                    )}

                                                    {/* Texto do comentário */}
                                                    {notificacao.tipo === "comentario" &&
                                                        notificacao.textoComentario && (
                                                            <div className="mt-2 rounded-lg border-l-2 border-[#58AAF0] bg-[#111827] px-3 py-2">
                                                                <p className="break-words font-serif text-xs leading-5 text-[#b8c3d5]">
                                                                    “{notificacao.textoComentario}”
                                                                </p>
                                                            </div>
                                                        )}

                                                    {/* Detalhes da publicação */}
                                                    {notificacao.post && (
                                                        <div
                                                            className="mt-3 rounded-xl border border-[#252d38] bg-[#111827] p-3"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <PostCard
                                                                postId={notificacao.post.id}
                                                                name={notificacao.usuario?.nome ?? "Usuário"}
                                                                username={notificacao.usuario?.username ?? null}
                                                                foto={notificacao.usuario?.foto ?? null}
                                                                time={notificacao.criadaEm}
                                                                content={notificacao.post.texto}
                                                                nota={notificacao.post.nota}
                                                                musicId={
                                                                    notificacao.post.musica?.id ??
                                                                    notificacao.musicaId ??
                                                                    0
                                                                }
                                                                musicTitle={
                                                                    notificacao.post.musica?.titulo ?? "Música"
                                                                }
                                                                artist={
                                                                    notificacao.post.musica?.artista?.nome ?? ""
                                                                }
                                                                musicCover={notificacao.post.musica?.capa ?? null}
                                                                modoNotificacao
                                                            />
                                                        </div>
                                                    )}



                                                    {/* Data */}
                                                    <p className="mt-2 font-serif text-[11px] text-[#697386]">
                                                        {tempoNotificacao(notificacao.criadaEm)}
                                                    </p>
                                                </div>
                                            </button>

                                            {/* Ações da notificação */}
                                            <div className="flex shrink-0 items-center gap-2 pt-1">
                                                {!notificacao.lida && (
                                                    <span
                                                        className="h-2 w-2 rounded-full bg-[#58AAF0]"
                                                        title="Não lida"
                                                    />
                                                )}

                                                {!notificacao.lida && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            marcarComoLida(notificacao.id).catch(() => { });
                                                        }}
                                                        disabled={atualizando !== null}
                                                        title="Marcar como lida"
                                                        aria-label="Marcar como lida"
                                                        className="cursor-pointer rounded-lg p-2 text-[#697386] transition hover:bg-[#58AAF0]/10 hover:text-[#58AAF0] disabled:cursor-not-allowed disabled:opacity-40"
                                                    >
                                                        <Check size={16} />
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
                            <h2 className="mb-5 font-serif text-[16px] text-white">
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