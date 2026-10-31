import { Link } from "react-router-dom";
import {
    ChatCircleIcon,
    UserIcon,
    ArrowUpRightIcon,
} from "@phosphor-icons/react";

import PostCard from "./postCard";
import calcularTempo from "../calcularTempo";
import { useState, useEffect } from "react";
import { apiRequest } from "../api";

export interface ComentarioPerfil {
    id: number;
    texto: string;
    dataCriacao: string;

    usuario?: {
        id?: number;
        nome?: string;
        username?: string;
        foto?: string | null;
    };

    post?: {
        id?: number;
        texto?: string | null;
        nota?: number;
        editado?: boolean;
        dataCriacao?: string;

        usuario?: {
            id?: number;
            nome?: string;
            username?: string;
            foto?: string | null;
        };

        musica?: {
            id?: number;
            titulo?: string;
            capa?: string | null;
            duracaoSegundos?: number;
            avaliacoes?: number;
            artista?: {
                id?: number;
                nome?: string;
            };
        };

        _count?: {
            curtidas?: number;
            comentarios?: number;
        };

        curtidoPorMim?: boolean;
    };
}

interface ComentarioPerfilCardProps {
    comentario: ComentarioPerfil;
}


interface UsuarioLogado {
    id: number;
}

export default function ComentarioPerfilCard({
    comentario,
}: ComentarioPerfilCardProps) {
    const post = comentario.post;
    const autor = comentario.usuario;
    const [usuarioLogadoId, setUsuarioLogadoId] = useState<number | null>(null);
    const token = localStorage.getItem("token");

    const temPostCompleto =
        post?.id != null && post.musica?.id != null;

    useEffect(() => {
        let ativo = true;

        async function carregarUsuarioLogado() {
            if (!token) {
                setUsuarioLogadoId(null);
                return;
            }

            try {
                const usuario = await apiRequest<UsuarioLogado>("/usuarios/me");

                if (ativo) {
                    setUsuarioLogadoId(usuario.id);
                }
            } catch {
                if (ativo) {
                    setUsuarioLogadoId(null);
                }
            }
        }

        carregarUsuarioLogado();

        return () => {
            ativo = false;
        };
    }, [token]);
    
    return (
        <article className="border-b border-[var(--cor-borda-suave)] pb-6">
            {/* Publicação original */}
            {temPostCompleto ? (
                <div className="min-w-0">
                    <PostCard
                        postId={post.id}
                        name={post.usuario?.nome || "Usuário"}
                        username={post.usuario?.username || ""}
                        foto={post.usuario?.foto}
                        time={post.dataCriacao || comentario.dataCriacao}
                        content={post.texto}
                        nota={post.nota}
                        editado={post.editado}
                        musicId={post.musica!.id!}
                        musicTitle={post.musica?.titulo || "Música indisponível"}
                        artist={post.musica?.artista?.nome || "Artista desconhecido"}
                        artistId={post.musica?.artista?.id}
                        musicCover={post.musica?.capa}
                        duracaoSegundos={post.musica?.duracaoSegundos}
                        likes={post._count?.curtidas ?? 0}
                        comments={post._count?.comentarios ?? 0}
                        avaliacoes={post.musica?.avaliacoes}
                        curtidoPorMim={post.curtidoPorMim ?? false}

                        ehMeuPost={
                            usuarioLogadoId !== null &&
                            post.usuario?.id === usuarioLogadoId
                        }
                    />
                </div>
            ) : (
                <div className="rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-4">
                    <p className="text-sm text-[#8793a8]">
                        A publicação original não está disponível.
                    </p>

                    {post?.id != null && (
                        <Link
                            to={`/post/${post.id}`}
                            className="mt-2 inline-flex items-center gap-1 text-sm text-[var(--cor-destaque)] hover:underline"
                        >
                            Ver publicação
                            <ArrowUpRightIcon size={15} />
                        </Link>
                    )}
                </div>
            )}

            {/* Conexão visual entre a publicação e o comentário */}
            <div className="relative ml-[34px] flex min-h-12 items-center gap-3">
                <div className="absolute bottom-0 left-0 top-0 w-px bg-[#354052]" />

                <div className="ml-4 flex items-center gap-2 rounded-full border border-[var(--cor-borda-suave)] bg-[var(--cor-superficie-profunda)] px-3 py-1.5">
                    <ChatCircleIcon size={15} className="text-[var(--cor-destaque)]" />

                    <span className="text-xs text-[#8793a8]">
                        Sua resposta
                    </span>
                </div>
            </div>

            {/* Comentário */}
            <div className="flex items-start gap-3 px-3">
                {autor?.foto ? (
                    <img
                        src={autor.foto}
                        alt={autor.nome || "Foto de perfil"}
                        className="h-10 w-10 shrink-0 rounded-full border border-[var(--cor-borda)] object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie-elevada)]">
                        <UserIcon size={21} className="text-[#9aa6ba]" />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-semibold text-[var(--cor-texto-destaque)]">
                            {autor?.nome || "Usuário"}
                        </span>

                        {autor?.username && (
                            <span className="text-xs text-[#718096]">
                                @{autor.username}
                            </span>
                        )}

                        <span className="text-xs text-[var(--cor-texto-discreto)]">
                            · {calcularTempo(comentario.dataCriacao) === "agora" ? "agora" : `há ${calcularTempo(comentario.dataCriacao)}`}
                        </span>
                    </div>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#d1d5db]">
                        {comentario.texto}
                    </p>

                    {post?.id != null && (
                        <Link
                            to={`/post/${post.id}#comentar`}
                            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-[#8793a8] transition hover:bg-[var(--cor-destaque)]/10 hover:text-[var(--cor-destaque)]"
                        >
                            <ChatCircleIcon size={15} />
                            Ver conversa
                        </Link>
                    )}
                </div>
            </div>
        </article>
    );
}
