import LandingDiscovery from "../components/landingDiscovery"
import LandingReview from "../components/landingReview"
import { usePublicReveal } from "../hooks/usePublicReveal"
import { useEffect, useState } from "react"
import { ArrowRight, Compass, Star, MessageSquare, Bookmark } from "lucide-react"
import MusicArtwork from "../components/musicArtwork"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import fundo from "../assets/fundoHero.jpg"
import qrcode from "../assets/uQhqvk.png"
import { Link, useNavigate } from "react-router-dom"
import { instalarPwaAgora, observarInstalacaoPwa } from "../services/instalacaoPwa"

const passos = [
  { icone: Compass, titulo: "Descubra artistas", texto: "Explore músicas e conheça os artistas por trás das suas próximas descobertas." },
  { icone: Star, titulo: "Dê sua nota", texto: "Avalie de 1 a 5 estrelas, com meios pontos para chegar à nota que faz sentido para você." },
  { icone: MessageSquare, titulo: "Escreva resenhas", texto: "Publique sua opinião e troque ideias com outros ouvintes." },
  { icone: Bookmark, titulo: "Salve favoritas", texto: "Guarde as faixas que você quer ouvir de novo em um só lugar." },
]

function Hero() {
  const revealRef = usePublicReveal()
  const navigate = useNavigate()
  const [instalacaoDisponivel, setInstalacaoDisponivel] = useState(false)
  const [mostrarAjudaPwa, setMostrarAjudaPwa] = useState(false)
  const [ehIOS, setEhIOS] = useState(false)

  useEffect(() => {
    const agente = navigator.userAgent
    setEhIOS(/iPad|iPhone|iPod/.test(agente) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
    return observarInstalacaoPwa(setInstalacaoDisponivel)
  }, [])

  async function instalarPwa() {
    if (!instalacaoDisponivel || !(await instalarPwaAgora())) setMostrarAjudaPwa(true)
  }

  function handleComeçar() {
    navigate(sessionStorage.getItem("user") ? "/home" : "/login")
  }

  return <>
    <Navbar />
    <main ref={revealRef} className="bg-[#080a10] text-white [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#83c4fa] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#83c4fa] ">
      <section className="isolate destaque-inicial relative flex min-h-[min(740px,100svh)] items-center overflow-hidden bg-[var(--cor-fundo)] px-5 pb-20 pt-28 text-white sm:px-10 lg:px-24">
        <div className="pointer-events-none absolute inset-0 bg-cover bg-[center_42%] opacity-55 after:absolute after:inset-0 after:bg-[linear-gradient(90deg,#080a10e8_0%,#080a1080_55%,#080a1010_100%)]" style={{ backgroundImage: `url(${fundo})` }} />
        <div data-reveal className="relative z-10 mx-auto w-full max-w-7xl">
          <div className="max-w-5xl">
            <h1 className="text-[clamp(2.6rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-[-.045em]">Descubra músicas.<br /> <span className="text-[var(--cor-destaque)]">Encontre sua Maré.</span></h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">Avalie suas faixas favoritas, compartilhe descobertas e conheça pessoas através da música.</p>
            <button onClick={handleComeçar} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#71b9f4] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa] min-h-16 px-10 text-lg mt-8">Começar agora <ArrowRight size={20} /></button>
          </div>
        </div>
      </section>

      <LandingDiscovery />

      <section id="como-funciona" className=" px-5 py-16 sm:px-8 sm:py-20 lg:px-24">
        <div data-reveal className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Como funciona</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">Encontre uma música e faça dela o começo de uma conversa.</p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {passos.map(({ icone: Icone, titulo, texto }) => <article key={titulo} className="group flex flex-col items-start gap-3 border-t border-white/15 py-6  [&_h3]:text-2xl [&_h3]:font-semibold [&_p]:text-[.95rem] [&_p]:leading-7 [&_p]:text-slate-400">
              <span className="mb-2 text-[#79bff5] transition-transform duration-300  [&_svg]:size-10 [&_svg]:stroke-[1.25]"><Icone size={21} /></span><h3>{titulo}</h3><p>{texto}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-y border-white/10 bg-[#080a10]">
        <div aria-hidden="true" className="pointer-events-none absolute right-[10%] top-1/2 -z-10 size-72 -translate-y-1/2 rounded-full bg-[#58aaf0]/10 blur-[100px]" />
        <div className="mx-auto grid max-w-[1472px] items-center gap-10 px-5 py-16 sm:px-10 sm:py-20 lg:grid-cols-[1.4fr_1fr] lg:gap-20 lg:px-24">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">A próxima indicação<br className="hidden sm:block" /> pode vir <span className="text-[#79bff5]">de você.</span></h2>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Sabe aquela música que você quer mostrar para todo mundo? Na Maré, ela pode virar a descoberta favorita de outra pessoa.</p>
            <p className="mt-4 max-w-xl leading-7 text-slate-400">Conte o que achou, dê sua nota e acompanhe as recomendações de quem você segue. Cada publicação abre espaço para uma conversa e para um som que ainda não fazia parte da sua rotina.</p>
            <Link to="/sobre" className="mt-7 inline-flex items-center gap-2 border-b border-[#79bff5]/40 pb-1 text-[#79bff5] transition-colors duration-200 hover:text-white [&_svg]:transition-transform [&_svg]:duration-200 ">Conheça a comunidade <ArrowRight size={17} /></Link>
          </div>
          <MusicArtwork />
        </div>
      </section>

      <LandingReview />

      <section className="bg-[var(--cor-secao-aplicativo)] px-5 py-12 sm:px-8 sm:py-14 lg:px-24">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div><h2 className="text-3xl font-bold sm:text-4xl">Baixe o aplicativo da Maré.</h2><p className="mt-3 max-w-xl text-base leading-7 text-[var(--cor-texto-secundario)]">Acesse pelo celular e continue descobrindo, avaliando e compartilhando de onde estiver.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="https://expo.dev/artifacts/eas/VkHo74tD9G0JfLHdD4yGRtvfIebIUoDOvymacq4iwYU.apk" download="mare.apk" className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#71b9f4] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa]">Baixar para Android <ArrowRight size={17} /></a>
              <button type="button" onClick={() => void instalarPwa()} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition-colors duration-200  hover:border-[#83c4fa] hover:bg-white/5">{ehIOS ? "Adicionar ao iPhone" : "Instalar Maré"}</button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 text-center [&_p]:font-medium [&_span]:text-sm [&_span]:text-slate-300 [&_img]:rounded-lg"><p>Ou acesse pelo QR Code</p><img src={qrcode} alt="QR Code para acessar a Maré" className="w-36 sm:w-40" /><span>Aponte a câmera do celular</span></div>
        </div>
      </section>
    </main>
    {mostrarAjudaPwa && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-labelledby="titulo-instalar-pwa" className="w-full max-w-sm rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-5 text-left"><h2 id="titulo-instalar-pwa" className="text-lg font-semibold text-[var(--cor-texto-principal)]">Adicionar a Maré à tela inicial</h2>{ehIOS ? <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-5 text-[var(--cor-texto-secundario)]"><li>Abra este site no Safari do iPhone.</li><li>Toque em Compartilhar.</li><li>Escolha “Adicionar à Tela de Início” e confirme em “Adicionar”.</li></ol> : <p className="mt-3 text-sm leading-5 text-[var(--cor-texto-secundario)]">No menu do navegador, escolha “Instalar app” ou “Adicionar à tela inicial”.</p>}<button type="button" onClick={() => setMostrarAjudaPwa(false)} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#71b9f4] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa] mt-5">Entendi</button></section></div>}
    <Footer />
  </>
}

export default Hero
