import { usePublicReveal } from "../hooks/usePublicReveal"
import { useMemo, useState } from "react"
import Navbar from "../components/navbar"
import Footer from "../components/footer"
import { ArrowRight, ChevronDown, CircleHelp, Mail, Search } from "lucide-react"
import { Link } from "react-router-dom"

const perguntas = [
  { categoria: "A Maré", pergunta: "O que é a Maré?", resposta: "A Maré é uma plataforma para descobrir músicas, compartilhar opiniões e interagir com outros usuários. Você pode avaliar músicas, criar posts, seguir pessoas e salvar suas músicas favoritas." },
  { categoria: "A Maré", pergunta: "A Maré reproduz as músicas?", resposta: "Não. A Maré funciona como uma plataforma de descoberta e interação musical. Ao escolher uma música, você pode ser direcionado para o Spotify para ouvi-la." },
  { categoria: "Músicas", pergunta: "Como faço uma avaliação?", resposta: "Escolha uma música e crie um post compartilhando sua opinião. Você pode dar uma nota de 1 a 5 estrelas, em intervalos de meia estrela, e escrever um comentário sobre a música." },
  { categoria: "Músicas", pergunta: "Como salvar uma música?", resposta: "Ao encontrar uma música que deseja guardar, utilize a opção de salvar. As músicas salvas ficam disponíveis na sua área de músicas salvas para que você possa encontrá-las novamente." },
  { categoria: "Comunidade", pergunta: "Como seguir outro usuário?", resposta: "Acesse o perfil do usuário que deseja acompanhar e clique na opção de seguir. As publicações desse usuário poderão aparecer no seu feed de pessoas que você segue." },
  { categoria: "Conta", pergunta: "Como editar meu perfil?", resposta: "Acesse seu perfil e entre nas opções de edição. Você poderá alterar informações como nome, foto e biografia e salvar as alterações." },
  { categoria: "Conta", pergunta: "Como alterar minha senha?", resposta: "Acesse as configurações da sua conta e procure pela opção de segurança. Informe sua senha atual, escolha uma nova senha e salve as alterações." },
  { categoria: "Músicas", pergunta: "Como funcionam as recomendações?", resposta: "Durante o cadastro, você pode escolher seus gêneros e artistas favoritos. Essas informações ajudam a Maré a apresentar conteúdos relacionados aos seus interesses musicais." },
  { categoria: "Comunidade", pergunta: "Posso curtir e comentar uma publicação?", resposta: "Sim. Você pode interagir com as publicações do feed curtindo e deixando comentários para compartilhar sua opinião com outros usuários." },
  { categoria: "Conta", pergunta: "Esqueci minha senha. O que faço?", resposta: "Na tela de login, utilize a opção de recuperação de senha para iniciar o processo de redefinição do acesso à sua conta." },
]
const categorias = ["Todas", "A Maré", "Músicas", "Comunidade", "Conta"]

export default function FAQ() {
  const revealRef = usePublicReveal()
  const [perguntaAberta, setPerguntaAberta] = useState<string | null>(perguntas[0].pergunta)
  const [busca, setBusca] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todas")
  const filtradas = useMemo(() => perguntas.filter((item) => {
    const correspondeCategoria = categoriaAtiva === "Todas" || item.categoria === categoriaAtiva
    const termo = busca.trim().toLocaleLowerCase("pt-BR")
    return correspondeCategoria && (!termo || `${item.pergunta} ${item.resposta} ${item.categoria}`.toLocaleLowerCase("pt-BR").includes(termo))
  }), [busca, categoriaAtiva])

  return <>
    <Navbar />
    <main ref={revealRef} className="bg-[#080a10] text-white [&_button:not(:disabled)]:cursor-pointer [&_a]:cursor-pointer [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#83c4fa] [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#83c4fa]">
      <section className="relative isolate overflow-hidden px-5 pt-32 text-center sm:px-10 sm:pt-40 [&_h1]:text-4xl [&_h1]:font-bold [&_h1]:leading-[1.1] [&_h1]:tracking-tight sm:[&_h1]:text-6xl [&_p]:mx-auto [&_p]:mt-5 [&_p]:max-w-2xl [&_p]:leading-8 [&_p]:text-slate-300 bg-[radial-gradient(ellipse_at_50%_32%,#58aaf029,transparent_65%)] pb-14 sm:pb-20">
        <div data-reveal className="relative mx-auto max-w-4xl text-center ">
          <h1>Vamos deixar tudo <span className="text-[var(--cor-destaque)]">mais claro.</span></h1>
          <p>Busque sua dúvida ou escolha um assunto para encontrar a resposta que precisa.</p>
          <label className="mx-auto mt-8 flex h-16 max-w-2xl items-center gap-3 rounded-xl border border-white/20 px-5 text-slate-400 focus-within:border-[#83c4fa] [&_input]:min-w-0 [&_input]:flex-1 [&_input]:bg-transparent [&_input]:text-white [&_input]:outline-none"><Search size={20} /><span className="sr-only">Pesquisar perguntas</span><input value={busca} onChange={(event) => setBusca(event.target.value)} placeholder="Ex.: como salvar uma música?" /></label>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-20 lg:px-24"><div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap gap-2" aria-label="Filtrar por assunto">{categorias.map((categoria) => <button key={categoria} type="button" onClick={() => setCategoriaAtiva(categoria)} aria-pressed={categoriaAtiva === categoria} className={`rounded-full border border-white/15 px-4 py-2 text-sm text-slate-300 transition-colors duration-200  hover:border-[#83c4fa] aria-pressed:border-[#58aaf0] aria-pressed:bg-[#58aaf01c] aria-pressed:text-[#a8d8ff] ${categoriaAtiva === categoria ? "is-active" : ""}`}>{categoria}</button>)}</div>
        <div className="mb-5 flex items-end justify-between gap-4"><h2 className="text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2><span className="text-sm text-[var(--cor-texto-discreto)]">{filtradas.length} {filtradas.length === 1 ? "resposta" : "respostas"}</span></div>
        {filtradas.length ? <div className="space-y-3">{filtradas.map((item, index) => {
          const aberta = perguntaAberta === item.pergunta
          const answerId = `faq-answer-${index}`
          return <article key={item.pergunta} className={`overflow-hidden border-b border-white/15 ${aberta ? "is-open" : ""}`}>
            <button type="button" aria-expanded={aberta} aria-controls={answerId} onClick={() => setPerguntaAberta(aberta ? null : item.pergunta)} className="group flex min-h-20 w-full items-center justify-between gap-4 py-5 text-left font-medium transition-colors duration-200 hover:text-[#83c4fa] [&_small]:mb-1 [&_small]:block [&_small]:text-xs [&_small]:text-[#83c4fa]"><span><small>{item.categoria}</small>{item.pergunta}</span><span className="flex size-8 shrink-0 items-center justify-center text-[#83c4fa] transition-transform duration-300 motion-reduce:transition-none group-aria-expanded:rotate-180"><ChevronDown size={19} /></span></button>
            {aberta && <div id={answerId} className="pb-6 leading-8 text-slate-300 "><p>{item.resposta}</p></div>}
          </article>
        })}</div> : <div className="py-12 text-center text-slate-400 [&_svg]:mx-auto [&_svg]:mb-4 [&_svg]:text-[#83c4fa] [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-white [&_p]:mt-2 [&_button]:mt-4 [&_button]:text-[#83c4fa] [&_button]:underline"><CircleHelp size={30} /><h3>Nenhuma resposta encontrada</h3><p>Tente outro termo ou escolha um assunto diferente.</p><button onClick={() => { setBusca(""); setCategoriaAtiva("Todas") }}>Limpar filtros</button></div>}
        <div className="flex flex-wrap items-center gap-5 rounded-xl bg-[var(--cor-secao-aplicativo)] p-6 sm:p-8 [&_h3]:font-semibold [&_p]:mt-2 [&_p]:text-sm [&_p]:leading-6 [&_p]:text-slate-300 mt-12"><span className="flex size-11 shrink-0 items-center justify-center text-[#83c4fa]"><Mail size={21} /></span><div><h3>Não encontrou o que procurava?</h3><p>Conta pra gente — vamos ajudar você a encontrar a resposta.</p></div><Link to="/contato" className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[#71b9f4] px-6 py-3 text-[.94rem] font-semibold text-[#08111b] transition-colors duration-200 hover:bg-[#9bd2ff]   focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#83c4fa] sm:ml-auto">Falar com a equipe <ArrowRight size={17} /></Link></div>
      </div></section>
    </main>
    <Footer />
  </>
}
