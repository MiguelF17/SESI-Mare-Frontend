import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Star } from "lucide-react"
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
      <div data-reveal className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Avaliações da comunidade</h2>
        <p className="mt-3 text-slate-300">Uma opinião publicada por quem ouve.</p>

        {carregando ? (
          <p role="status" className="py-8 text-slate-400">Carregando avaliação…</p>
        ) : erro ? (
          <p role="status" className="py-8 text-slate-400">Não foi possível carregar a avaliação agora.</p>
        ) : avaliacao ? (
          <article className="mt-8 max-w-3xl border-l-2 border-[#58aaf0] py-2 pl-6 sm:pl-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to={avaliacao.usuario?.username ? `/u/${avaliacao.usuario.username}` : "/explorar"} className="font-semibold transition-colors hover:text-[#79bff5]">
                {avaliacao.usuario?.nome ?? "Ouvinte da Maré"}
              </Link>
              <span className="inline-flex items-center gap-1.5 text-sm text-[#79bff5]">
                <Star size={16} fill="currentColor" /> {avaliacao.nota.toFixed(1)} / 5
              </span>
            </div>
            <p className="mt-5 text-lg leading-8 text-slate-200">“{avaliacao.texto}”</p>
            <p className="mt-4 text-sm text-slate-400">
              {avaliacao.musica?.titulo}
              {avaliacao.musica?.artista?.nome ? ` · ${avaliacao.musica.artista.nome}` : ""}
            </p>
          </article>
        ) : (
          <p className="py-8 text-slate-400">Ainda não há avaliações com texto para exibir.</p>
        )}
      </div>
    </section>
  )
}
