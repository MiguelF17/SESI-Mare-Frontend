import { usePublicReveal } from "../hooks/usePublicReveal"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import Footer from "../components/footer"
import Navbar from "../components/navbar"
import brenda from "../assets/brenda.jpeg"
import celeny from "../assets/celeny.jpeg"
import evellyn from "../assets/evellyn.jpeg"
import miguel from "../assets/miguel.jpg"
import samuel from "../assets/samuel.jpeg"
import sarah from "../assets/sarah.jpeg"

const equipe = [
  { nome: "Brenda Maria", funcao: "Dev Mobile & Designer", foto: brenda },
  { nome: "Celeny Ordonez", funcao: "Desenvolvedora Mobile", foto: celeny },
  { nome: "Evellyn Caitano", funcao: "Desenvolvedora Mobile", foto: evellyn },
  { nome: "Miguel Francelino", funcao: "Desenvolvedor Full-Stack", foto: miguel },
  { nome: "Samuel Lira", funcao: "Desenvolvedor Back-End & APIs", foto: samuel },
  { nome: "Sarah Luiza", funcao: "Dev Front End & Designer", foto: sarah },
]

export default function Sobre() {
  const revealRef = usePublicReveal()
  return <>
    <Navbar />
    <main ref={revealRef} className="bg-[#080a10] text-white [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#83c4fa] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#83c4fa]">
      <section className="relative isolate overflow-hidden px-5 pt-32 text-center sm:px-10 sm:pt-40 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-[1.1] [&_h1]:tracking-tight sm:[&_h1]:text-6xl [&_p]:mx-auto [&_p]:mt-5 [&_p]:max-w-2xl [&_p]:leading-8 [&_p]:text-slate-300 pb-8">
        <div data-reveal className="relative mx-auto max-w-5xl text-center ">
          <h1>A gente também <span className="text-[var(--cor-destaque)]">fala de música.</span></h1>
          <p>A Maré nasceu para reunir quem gosta de descobrir músicas e dividir opiniões.</p>
          <a href="#nossa-historia" className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#71b9f4] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa] mx-auto mt-8">Conheça a nossa história <ArrowRight size={17} /></a>
        </div>
      </section>

      <section id="nossa-historia" className="scroll-mt-24 bg-[var(--cor-secao-aplicativo)] px-5 py-10 sm:px-8 sm:py-12 lg:px-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">Por trás <span className="text-[var(--cor-destaque)]">da Maré.</span></h2>
          <div className="space-y-4 border-l border-[#58aaf055] pl-6 text-base leading-8 text-slate-300"><p>A Maré nasceu da vontade de criar um lugar onde a música pudesse ser mais do que algo para ouvir. Um lugar para dividir descobertas, opiniões e aquela faixa que não sai da cabeça.</p><p>Hoje, a plataforma reúne descoberta musical e interação em uma experiência simples: encontre músicas, avalie, publique e acompanhe o que a comunidade está ouvindo.</p></div>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-24"><div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl"><h2 className="text-3xl font-bold sm:text-4xl">Quem faz a Maré</h2><p className="mt-3 text-[var(--cor-texto-secundario)]">Uma equipe que juntou tecnologia, design e vontade de aproximar pessoas pela música.</p></div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-8 sm:gap-y-12">{equipe.map((membro) => <article data-reveal key={membro.nome} className="text-center [&_h3]:font-semibold [&_p]:mt-1.5 [&_p]:text-sm [&_p]:text-slate-400"><img src={membro.foto} alt={`Foto de ${membro.nome}`} loading="lazy" className="mx-auto mb-5 aspect-square w-full max-w-64 rounded-full object-cover transition-transform duration-300 " /><h3>{membro.nome}</h3><p>{membro.funcao}</p></article>)}</div>
      </div></section>

      <section className="border-t border-white/10 bg-[var(--cor-secao-aplicativo)] [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_p]:mt-3 [&_p]:text-slate-300 px-5 py-14 sm:px-8 sm:py-16 lg:px-24"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5"><div><h2>Venha compartilhar suas descobertas.</h2><p>Crie sua conta e encontre sua próxima música favorita.</p></div><Link to="/cadastro" className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#71b9f4] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa]">Criar minha conta <ArrowRight size={18} /></Link></div></section>
    </main>
    <Footer />
  </>
}
