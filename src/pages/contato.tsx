import { usePublicReveal } from "../hooks/usePublicReveal"
import type { FormEvent } from "react"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import { ArrowUpRight, Clock3, Mail, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"

const emailContato = "contato@mare.com"

function Contato() {
  const revealRef = usePublicReveal()
  function enviarMensagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const dados = new FormData(event.currentTarget)
    const nome = String(dados.get("nome") ?? "")
    const email = String(dados.get("email") ?? "")
    const mensagem = String(dados.get("mensagem") ?? "")
    const assunto = encodeURIComponent(`Contato pelo site — ${nome}`)
    const corpo = encodeURIComponent(`Nome: ${nome}\nE-mail: ${email}\n\n${mensagem}`)
    window.location.href = `mailto:${emailContato}?subject=${assunto}&body=${corpo}`
  }

  return <>
    <Navbar />
    <main ref={revealRef} className="relative isolate min-h-[80vh] overflow-hidden px-5 pb-20 pt-28 sm:px-10 sm:pt-36 lg:px-24 bg-[#080a10] text-white [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#83c4fa] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#83c4fa]">
      <div className="pointer-events-none absolute -left-32 top-[10%] -z-10 size-[35rem] rounded-full bg-[#58aaf015] blur-3xl" />
      <div className="relative mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
        <section data-reveal className="pt-3 lg:pt-10 ">
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">Vamos falar de <span className="text-[var(--cor-destaque)]">música?</span></h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--cor-texto-secundario)]">Tem uma dúvida, sugestão ou encontrou algo que podemos melhorar? Manda uma mensagem. A gente quer ouvir você.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <a href={`mailto:${emailContato}`} className="flex items-center gap-3 rounded-lg border border-white/10 p-4 transition-colors hover:border-[#58aaf066] [&_small]:block [&_small]:text-xs [&_small]:text-slate-400 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-sm [&_strong]:font-medium"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#58aaf033] text-[#83c4fa]"><Mail size={19} /></span><span><small>E-mail</small><strong>{emailContato}</strong></span><ArrowUpRight size={17} className="ml-auto text-white/35" /></a>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 p-4 transition-colors hover:border-[#58aaf066] [&_small]:block [&_small]:text-xs [&_small]:text-slate-400 [&_strong]:mt-1 [&_strong]:block [&_strong]:text-sm [&_strong]:font-medium"><span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-[#58aaf033] text-[#83c4fa]"><Clock3 size={19} /></span><span><small>Tempo de resposta</small><strong>Até 3 dias úteis</strong></span></div>
          </div>
          <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-[var(--cor-texto-discreto)]"><ShieldCheck size={17} className="mt-1 shrink-0 text-[var(--cor-destaque)]" /> <span>Suas informações serão usadas apenas para responder sua mensagem. Leia nossa <Link to="/privacidade" className="text-[var(--cor-destaque)] underline underline-offset-4">política de privacidade</Link>.</span></p>
        </section>

        <section className="rounded-2xl border border-white/20 bg-[#080a10] p-6 sm:p-9 ">
          <div className="mb-7"><h2 className="mt-2 text-2xl font-bold text-[var(--cor-texto-principal)]">Como podemos ajudar?</h2><p className="mt-2 text-sm text-[var(--cor-texto-secundario)]">Preencha os campos e prepare sua mensagem.</p></div>
          <form className="flex flex-col gap-5" onSubmit={enviarMensagem}>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">Seu nome<input name="nome" autoComplete="name" placeholder="Como podemos te chamar?" required className="min-h-12 w-full rounded-lg border border-white/20 bg-[#05080c] px-4 py-3 text-white outline-none transition-colors duration-200 placeholder:text-[#495564] hover:border-[#a9c9e4] focus:border-[#83c4fa] focus:ring-2 focus:ring-[#83c4fa]/50" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">Seu e-mail<input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required className="min-h-12 w-full rounded-lg border border-white/20 bg-[#05080c] px-4 py-3  text-white outline-none transition-colors duration-200 placeholder:text-[#495564] hover:border-[#a9c9e4] focus:border-[#83c4fa] focus:ring-2 focus:ring-[#83c4fa]/50" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-200">Sua mensagem<textarea name="mensagem" placeholder="Escreva sua dúvida, ideia ou sugestão..." required rows={5} className="min-h-12 w-full rounded-lg border border-white/20 bg-[#05080c] px-4 py-3  text-white outline-none transition-colors duration-200 placeholder:text-[#495564] hover:border-[#a9c9e4] focus:border-[#83c4fa] focus:ring-2 focus:ring-[#83c4fa]/50 resize-y" /></label>
            <p className="text-xs leading-5 text-slate-300">Ao continuar, seu aplicativo de e-mail será aberto com a mensagem preenchida para você revisar e enviar.</p>
            <button type="submit" className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[var(--cor-destaque)] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa] w-full">Preparar mensagem <ArrowUpRight size={18} /></button>
          </form>
        </section>
      </div>
    </main>
    <Footer />
  </>
}

export default Contato
