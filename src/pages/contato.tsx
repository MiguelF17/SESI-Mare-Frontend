import Navbar from "../components/navbar"
import Footer from "../components/footer"
import { Link } from "react-router-dom"

import { FaPhone, FaEnvelope, FaClock } from "react-icons/fa"

import fundo from "../assets/fundoHero.jpg"


function Contato() {

    return (
        <>

            <Navbar />

            <main
                className="
            relative
            min-h-[100svh]
            flex
            items-center
            justify-center
            px-6
            md:px-12
            lg:px-24
            pt-24
            pb-8
            sm:py-16
            overflow-hidden
             bg-[var(--cor-fundo)]
             "
            >

                {/* IMAGEM DE FUNDO */}

                <div
                    className="
                        absolute
                        inset-0
                        bg-cover
                        bg-center
                        bg-no-repeat
                    "
                    style={{
                        backgroundImage: `url(${fundo})`
                    }}
                />

                {/* CONTEÚDO */}

                <div className="relative z-10 flex justify-center w-full">

                    <section
                        className="
    w-full
    max-w-xl
    bg-[#111A25]
    shadow-xl
    rounded-2xl
    p-4
    sm:p-8
    my-12
"
                    >

                        {/* TÍTULO */}

                        <h1 className="mb-2 text-2xl font-bold text-[var(--cor-destaque)] sm:text-3xl">

                            Fale conosco

                        </h1>


                        <p className="text-[var(--cor-texto-destaque)] mb-6">

                            Tem alguma dúvida, sugestão ou quer saber mais sobre a Maré?
                            Nossa equipe está pronta para te atender.

                        </p>


                        {/* FORMULÁRIO */}

                        <form className="flex flex-col gap-4">

                            <input
                                type="text"
                                name="nome"
                                placeholder="Seu nome"
                                required
                                className="
                                    bg-[var(--cor-fundo-alternativo)]
                                    border
                                    border-[#445264]
                                    text-[var(--cor-texto-principal)]
                                    placeholder-[#445264]
                                    p-3
                                    rounded-lg
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[var(--cor-destaque)]
                                "
                            />


                            <input
                                type="email"
                                name="email"
                                placeholder="Seu e-mail"
                                required
                                className="
                                    bg-[var(--cor-fundo-alternativo)]
                                    border
                                    border-[#445264]
                                    text-[var(--cor-texto-principal)]
                                    placeholder-[#445264]
                                    p-3
                                    rounded-lg
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[var(--cor-destaque)]
                                "
                            />


                            <input
                                type="tel"
                                name="telefone"
                                placeholder="Seu telefone"
                                required
                                className="
                                    bg-[var(--cor-fundo-alternativo)]
                                    border
                                    border-[#445264]
                                    text-[var(--cor-texto-principal)]
                                    placeholder-[#445264]
                                    p-3
                                    rounded-lg
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[var(--cor-destaque)]
                                "
                            />


                            <textarea
                                name="mensagem"
                                placeholder="Sua mensagem..."
                                required
                                className="
                                    bg-[var(--cor-fundo-alternativo)]
                                    border
                                    border-[#445264]
                                    text-[var(--cor-texto-principal)]
                                    placeholder-[#445264]
                                    p-3
                                    rounded-lg
                                    h-32
                                    resize-none
                                    focus:outline-none
                                    focus:ring-1
                                    focus:ring-[var(--cor-destaque)]
                                "
                            />


                            <p className="text-xs text-[#B8C7D9]">

                                Ao enviar, você concorda com nossa{" "}
                                <Link to="/privacidade" className="text-[var(--cor-destaque)] hover:underline">
                                    política de privacidade
                                </Link>.

                            </p>


                            <button
                                type="submit"
                                className="
                                    mt-2
                                    bg-[var(--cor-destaque)]
                                    text-[#0E192A]
                                    py-3
                                    rounded-lg
                                    font-semibold
                                    hover:bg-[var(--cor-destaque-forte)]
                                    hover:text-[var(--cor-texto-principal)]
                                    hover:scale-105
                                    transition
                                    duration-300
                                    shadow-md
                                    cursor-pointer
                                "
                            >

                                Enviar mensagem

                            </button>

                        </form>


                        {/* ATENDIMENTO */}

                        <div className="text-center mt-8">

                            <h2 className="text-2xl font-bold text-[var(--cor-destaque)] mb-2">

                                Atendimento

                            </h2>


                            <p className="text-[var(--cor-texto-destaque)] mb-4">

                                Você pode falar com a gente pelos canais abaixo:

                            </p>


                            <div className="space-y-3 text-[var(--cor-texto-destaque)]">

                                <p className="flex items-center justify-center gap-2">

                                    <FaPhone className="text-[var(--cor-destaque)]" />

                                    (11) 99999-9999

                                </p>


                                <p className="flex items-center justify-center gap-2">

                                    <FaEnvelope className="text-[var(--cor-destaque)]" />

                                    contato@mare.com

                                </p>


                                <p className="flex items-center justify-center gap-2">

                                    <FaClock className="text-[var(--cor-destaque)]" />

                                    Segunda a sexta, 9h às 18h

                                </p>

                            </div>

                        </div>

                    </section>

                </div>

            </main>


            <Footer />

        </>
    )
}


export default Contato
