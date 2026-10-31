import { Link } from "react-router-dom";
import Footer from "../components/footer";
import Navbar from "../components/navbar";

function Sobre() {

    return (
        <>
            <Navbar />

            {/* HERO */}
            <section
                className="relative w-full overflow-hidden bg-gradient-to-r from-[var(--cor-gradiente-inicio)] to-[var(--cor-gradiente-fim)] px-5 pb-16 pt-28 text-[var(--cor-texto-principal)] sm:px-10 sm:py-28 lg:px-24 lg:py-40"
                style={{ fontFamily: "Inter, sans-serif" }}
            >

                <div className="relative z-10 max-w-4xl mx-auto text-center">
                    <h1 className="mb-3 text-3xl font-bold leading-tight sm:mb-4 sm:text-5xl md:text-6xl">
                        Sobre a Maré
                    </h1>

                    <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--cor-texto-secundario)] sm:text-lg md:text-xl">
                        Um espaço para descobrir músicas, compartilhar opiniões e
                        conectar pessoas através da música.
                    </p>

                </div>

            </section>


            {/* HISTÓRIA */}
            <section className="mx-auto max-w-4xl px-5 py-9 text-center sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-24">

                <h2 className="mb-8 text-3xl font-semibold text-[var(--cor-destaque)] sm:mb-10 sm:text-4xl">
                    Nossa História
                </h2>

                <p className="text-[var(--cor-texto-discreto)] leading-relaxed">
                    A Maré surgiu com a ideia de criar um espaço onde a música pudesse
                    ser mais do que apenas algo para ouvir. Nossa proposta é aproximar
                    pessoas que compartilham interesses musicais, permitindo descobrir
                    novas músicas, publicar opiniões, avaliar faixas e acompanhar o
                    que outras pessoas estão ouvindo e recomendando.
                </p>

                <p className="text-[var(--cor-texto-discreto)] leading-relaxed mt-4">
                    A plataforma foi desenvolvida pensando em uma experiência simples
                    e intuitiva, reunindo descoberta musical e interação entre usuários
                    em um só lugar.
                </p>

            </section>


            {/* O QUE NOS GUIA */}
            <section className="bg-[var(--cor-superficie)] px-6 py-12 text-center sm:py-16 md:px-12 md:py-20 lg:px-24">

                <h2 className="mb-8 text-3xl font-semibold text-[var(--cor-destaque)] sm:mb-10 sm:text-4xl">
                    O que nos guia
                </h2>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-[var(--cor-superficie)] shadow-md rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-2">
                            Descoberta
                        </h3>

                        <p className="text-[var(--cor-texto-discreto)]">
                            Facilitar a descoberta de músicas e artistas que combinam
                            com os interesses de cada usuário.
                        </p>
                    </div>


                    <div className="bg-[var(--cor-superficie)] shadow-md rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-2">
                            Comunidade
                        </h3>

                        <p className="text-[var(--cor-texto-discreto)]">
                            Criar um espaço onde pessoas possam compartilhar opiniões
                            e conversar sobre música.
                        </p>
                    </div>


                    <div className="bg-[var(--cor-superficie)] shadow-md rounded-2xl p-6">
                        <h3 className="text-xl font-semibold mb-2">
                            Simplicidade
                        </h3>

                        <p className="text-[var(--cor-texto-discreto)]">
                            Oferecer uma experiência simples, organizada e agradável
                            para descobrir e interagir com músicas.
                        </p>
                    </div>

                </div>

            </section>


            {/* FUNCIONALIDADES */}
            <section className="px-6 py-12 text-center sm:py-16 md:px-12 md:py-20 lg:px-24">

                <h2 className="mb-8 text-3xl font-semibold text-[var(--cor-destaque)] sm:mb-10 sm:text-4xl">
                    O que você pode fazer na Maré
                </h2>

                <div className="grid md:grid-cols-3 gap-8">

                    <div className="bg-[var(--cor-superficie)] rounded-2xl p-6 shadow-md">
                        <h3 className="text-xl font-semibold mb-2">
                            Avaliar músicas
                        </h3>

                        <p className="text-[var(--cor-texto-discreto)]">
                            Dê notas de 1 a 5 estrelas, incluindo meios pontos, e compartilhe sua opinião
                            sobre suas músicas favoritas.
                        </p>
                    </div>


                    <div className="bg-[var(--cor-superficie)] rounded-2xl p-6 shadow-md">
                        <h3 className="text-xl font-semibold mb-2">
                            Criar publicações
                        </h3>

                        <p className="text-[var(--cor-texto-discreto)]">
                            Compartilhe suas descobertas e converse com outros
                            usuários através de publicações.
                        </p>
                    </div>


                    <div className="bg-[var(--cor-superficie)] rounded-2xl p-6 shadow-md">
                        <h3 className="text-xl font-semibold mb-2">
                            Salvar músicas
                        </h3>

                        <p className="text-[var(--cor-texto-discreto)]">
                            Guarde músicas que você deseja ouvir novamente e
                            mantenha sua coleção organizada.
                        </p>
                    </div>

                </div>

            </section>


            {/* EQUIPE */}
            <section className="bg-[var(--cor-superficie)] px-6 py-12 text-center sm:py-16 md:px-12 md:py-20 lg:px-24">

                <h2 className="mb-8 text-3xl text-[var(--cor-destaque)] sm:mb-10 sm:text-4xl">
                    Nosso Time
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">

                    {[
                        {
                            nome: "Brenda Maria",
                            funcao: "Dev Mobile & Designer",
                            imagem: ""
                        },
                        {
                            nome: "Celeny Ordonez",
                            funcao: "Desenvolvedora Mobile",
                            imagem: ""
                        },
                        {
                            nome: "Evellyn Caitano",
                            funcao: "Desenvolvedora Mobile",
                            imagem: ""
                        },
                        {
                            nome: "Miguel Francelino",
                            funcao: "Desenvolvedor Full-Stack",
                            imagem: ""
                        },
                        {
                            nome: "Samuel Lira",
                            funcao: "Desenvolvedor Back-End & APIs",
                            imagem: ""
                        },
                        {
                            nome: "Sarah Luiza",
                            funcao: "Dev Front End & Designer",
                            imagem: ""
                        }
                    ].map((membro, index) => (

                        <div
                            key={index}
                            className="bg-[var(--cor-superficie)] rounded-xl p-6 shadow-md"
                        >

                            {membro.imagem ? (
                                <img
                                    src={membro.imagem}
                                    alt={membro.nome}
                                    loading="lazy"
                                    className="mx-auto mb-3 h-40 w-40 rounded-full bg-[var(--cor-superficie-suave)] object-cover"
                                />
                            ) : (
                                <div
                                    aria-hidden="true"
                                    className="mx-auto mb-3 h-40 w-40 rounded-full bg-[var(--cor-superficie-suave)]"
                                />
                            )}

                            <h4 className="font-semibold">
                                {membro.nome}
                            </h4>

                            <span className="text-sm text-[var(--cor-texto-discreto)]">
                                {membro.funcao}
                            </span>

                        </div>

                    ))}

                </div>

            </section>


            {/* CTA */}
            <section className="px-6 py-12 text-center sm:py-16 md:py-20">

                <h2 className="mb-4 text-3xl text-[var(--cor-destaque)] sm:text-4xl">
                    Pronto para entrar na Maré?
                </h2>

                <p className="text-[var(--cor-texto-discreto)] mb-8">
                    Descubra músicas, compartilhe suas opiniões e encontre novos
                    artistas para ouvir.
                </p>

                <Link
                    to="/home"
                    className="bg-[var(--cor-destaque)] text-[var(--cor-texto-principal)] px-10 py-4 rounded-lg hover:scale-105 transition cursor-pointer"
                >
                    Explorar a Maré
                </Link>

            </section>



            <Footer />
        </>
    );
}

export default Sobre;
