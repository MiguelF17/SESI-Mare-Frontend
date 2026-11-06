import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Heart, MessageCircle, Star } from "lucide-react"
import { buscarPosts, type Post } from "../services/postService"

export default function LandingReview() {
  const [avaliacao, setAvaliacao] = useState<Post | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)

  useEffect(() => {
    let ativo = true

    async function carregarAvaliacao() {
      try {
        const publicacoes = await buscarPosts({ rota: "/posts?limit=50" })
        const candidatas = publicacoes.filter((post) => post.texto?.trim())
        if (ativo && candidatas.length) {
          const indice = Math.floor(Math.random() * candidatas.length)
          setAvaliacao(candidatas[indice])
        }
      } catch (error) {
        console.error("Erro ao carregar avaliação pública:", error)
        if (ativo) setErro(true)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void carregarAvaliacao()
    return () => { ativo = false }
  }, [])

  return (
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-24">
      <div data-reveal className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(220px,.65fr)_minmax(0,1.35fr)] lg:gap-14">
        <div className="max-w-sm">
          <h2 className="text-3xl font-bold tracking-tight text-[#dceeff] sm:text-4xl">Avaliações da <span className="text-[var(--cor-destaque)]">comunidade</span></h2>
          <p className="mt-4 leading-7 text-slate-300">Cada publicação reúne uma nota e uma opinião pessoal sobre uma música. Veja o que outro ouvinte destacou, conheça a faixa avaliada e explore diferentes perspectivas da comunidade Maré.</p>
        </div>

        {carregando ? (
          <p role="status" className="py-8 text-slate-400">Carregando avaliação…</p>
        ) : erro ? (
          <p role="status" className="py-8 text-slate-400">Não foi possível carregar a avaliação agora.</p>
        ) : avaliacao ? (
          <article className="w-full max-w-2xl rounded-xl border border-white/10 bg-[linear-gradient(145deg,rgba(29,54,83,0.3),rgba(8,10,16,0.72))] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              {avaliacao.usuario?.foto ? <img src={avaliacao.usuario.foto} alt="" className="size-11 rounded-full object-cover" /> : <span aria-hidden="true" className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/5 font-semibold text-[#9dcfff]">{(avaliacao.usuario?.nome ?? "M").slice(0, 1).toUpperCase()}</span>}
              <div className="min-w-0 flex-1">
                <Link to={avaliacao.usuario?.username ? `/u/${avaliacao.usuario.username}` : "/explorar"} className="block truncate font-semibold transition-colors hover:text-[#79bff5]">{avaliacao.usuario?.nome ?? "Ouvinte da Maré"}</Link>
                <span className="text-xs text-slate-400">Compartilhou uma avaliação</span>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm text-[#79bff5]"><Star size={16} fill="currentColor" />{avaliacao.nota.toFixed(1)}</span>
            </div>
            <p className="mt-5 leading-7 text-slate-200">{avaliacao.texto}</p>
            {avaliacao.musica && <Link to={`/musica/${avaliacao.musica.id}`} className="mt-5 flex items-center gap-3 rounded-lg border border-white/10 bg-black/15 p-3 transition-colors hover:border-[#79bff5]/40">
              {avaliacao.musica.capa && <img src={avaliacao.musica.capa} alt="" className="size-12 rounded-md object-cover" />}
              <span className="min-w-0"><strong className="block truncate text-sm">{avaliacao.musica.titulo}</strong><span className="block truncate text-xs text-slate-400">{avaliacao.musica.artista?.nome}</span></span>
            </Link>}
            <div className="mt-5 flex items-center gap-5 border-t border-white/10 pt-4 text-sm text-slate-400"><span className="inline-flex items-center gap-1.5"><Heart size={16} />{avaliacao._count?.curtidas ?? 0}</span><span className="inline-flex items-center gap-1.5"><MessageCircle size={16} />{avaliacao._count?.comentarios ?? 0}</span></div>
          </article>
        ) : (
          <p className="py-8 text-slate-400">Ainda não há avaliações com texto para exibir.</p>
        )}
      </div>
    </section>
  )
}
