import { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import {
    CircleHelp,
    ChevronDown,
    ChevronUp,
    Search,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function FAQ() {
    const [perguntaAberta, setPerguntaAberta] = useState<number | null>(null);

    const perguntas = [
        {
            pergunta: "O que é a Maré?",
            resposta:
                "A Maré é uma plataforma para descobrir músicas, compartilhar opiniões e interagir com outros usuários. Você pode avaliar músicas, criar posts, seguir pessoas e salvar suas músicas favoritas.",
        },
        {
            pergunta: "A Maré reproduz as músicas?",
            resposta:
                "Não. A Maré funciona como uma plataforma de descoberta e interação musical. Ao escolher uma música, você pode ser direcionado para o Spotify para ouvi-la.",
        },
        {
            pergunta: "Como faço uma avaliação?",
            resposta:
                "Escolha uma música e crie um post compartilhando sua opinião. Você pode adicionar uma avaliação de 1 a 5 estrelas e escrever um comentário sobre a música.",
        },
        {
            pergunta: "Como salvar uma música?",
            resposta:
                "Ao encontrar uma música que deseja guardar, utilize a opção de salvar. As músicas salvas ficam disponíveis na sua área de músicas salvas para que você possa encontrá-las novamente.",
        },
        {
            pergunta: "Como seguir outro usuário?",
            resposta:
                "Acesse o perfil do usuário que deseja acompanhar e clique na opção de seguir. As publicações desse usuário poderão aparecer no seu feed de pessoas que você segue.",
        },
        {
            pergunta: "Como editar meu perfil?",
            resposta:
                "Acesse seu perfil e entre nas opções de edição. Você poderá alterar informações como nome, foto e biografia e salvar as alterações.",
        },
        {
            pergunta: "Como alterar minha senha?",
            resposta:
                "Acesse as configurações da sua conta e procure pela opção de segurança. Informe sua senha atual, escolha uma nova senha e salve as alterações.",
        },
        {
            pergunta: "Como funcionam as recomendações?",
            resposta:
                "Durante o cadastro, você pode escolher seus gêneros e artistas favoritos. Essas informações ajudam a Maré a apresentar conteúdos relacionados aos seus interesses musicais.",
        },
        {
            pergunta: "Posso curtir e comentar uma publicação?",
            resposta:
                "Sim. Você pode interagir com as publicações do feed curtindo e deixando comentários para compartilhar sua opinião com outros usuários.",
        },
        {
            pergunta: "Esqueci minha senha. O que faço?",
            resposta:
                "Na tela de login, utilize a opção de recuperação de senha para iniciar o processo de redefinição do acesso à sua conta.",
        },
    ];

    return (
        <>
            <Navbar />

            {/* HERO */}
            <section
                className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--cor-gradiente-inicio)] to-[var(--cor-gradiente-fim)] px-4 pb-10 pt-24 text-[var(--cor-texto-principal)] sm:px-8 sm:pb-20 sm:pt-36 lg:px-24"
                style={{ fontFamily: "Inter, sans-serif" }}
            >

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <CircleHelp
                        size={42}
                        className="mx-auto mb-3 text-[var(--cor-destaque)] sm:mb-6 sm:h-[70px] sm:w-[70px]"
                    />

                    <h1 className="text-3xl font-bold sm:text-5xl lg:text-6xl">
                        Central de Ajuda
                    </h1>

                    <p className="mt-3 text-sm text-[var(--cor-texto-secundario)] sm:mt-5 sm:text-xl">
                        Encontre respostas para as dúvidas mais frequentes sobre a Maré.
                    </p>

                    {/* Pesquisa */}
                    <div className="mt-10 max-w-2xl mx-auto relative">
                        <Search
                            className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--cor-texto-cinza-400)]"
                        />

                        <input
                            placeholder="Pesquisar uma dúvida..."
                            className="w-full bg-white rounded-xl py-4 pl-14 pr-5 text-gray-800 outline-none shadow-lg"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-[#fafafa] px-4 py-12 sm:px-8 sm:py-16 lg:px-24 lg:py-20">
                <div className="max-w-5xl mx-auto">
                    <h2 className="mb-8 text-3xl font-semibold text-[var(--cor-destaque-forte)] sm:mb-10 sm:text-4xl">
                        Perguntas frequentes
                    </h2>

                    <div className="space-y-5">
                        {perguntas.map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl border shadow-sm overflow-hidden"
                            >
                                <button
                                    onClick={() =>
                                        setPerguntaAberta(
                                            perguntaAberta === index ? null : index
                                        )
                                    }
                                    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-gray-50 sm:px-6 sm:py-5"
                                >
                                    <span className="text-base font-medium text-[#2D2D2D] sm:text-lg">
                                        {item.pergunta}
                                    </span>

                                    {perguntaAberta === index ? (
                                        <ChevronUp className="text-[var(--cor-destaque)]" />
                                    ) : (
                                        <ChevronDown className="text-[var(--cor-destaque)]" />
                                    )}
                                </button>

                                {perguntaAberta === index && (
                                    <div className="border-t px-4 pb-5 sm:px-6 sm:pb-6">
                                        <p className="pt-5 text-gray-600 leading-7">
                                            {item.resposta}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-12 rounded-3xl bg-gradient-to-r from-[var(--cor-destaque-forte)] to-[var(--cor-destaque)] p-6 text-center text-[var(--cor-texto-principal)] sm:mt-16 sm:p-10 lg:mt-20 lg:p-14">
                        <h2 className="text-2xl font-bold sm:text-4xl">
                            Ainda não encontrou sua resposta?
                        </h2>

                        <p className="mb-8 mt-4 text-base text-[var(--cor-texto-destaque)] sm:text-lg">
                            Entre em contato com nossa equipe e tire suas dúvidas.
                        </p>

                        <Link to="/contato" className="inline-flex rounded-lg border border-white px-6 py-3 transition hover:scale-105 hover:bg-white hover:text-[var(--cor-destaque-forte)] sm:px-10 sm:py-4">
                            Entrar em contato
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    );
}
