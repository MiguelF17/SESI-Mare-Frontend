import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, Music2 } from "lucide-react"
import { buscarMusicas, type Musica } from "../services/musicaService"

export default function LandingDiscovery() {
  const [musicas, setMusicas] = useState<Musica[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(false)
  const carrosselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let ativo = true

    async function carregarCatalogo() {
      try {
        const catalogo = await buscarMusicas()
        if (ativo) setMusicas(catalogo.slice(0, 10))
      } catch (error) {
        console.error("Erro ao carregar catálogo público:", error)
        if (ativo) setErro(true)
      } finally {
        if (ativo) setCarregando(false)
      }
    }

    void carregarCatalogo()
    return () => { ativo = false }
  }, [])

  function moverCarrossel(direcao: -1 | 1) {
    carrosselRef.current?.scrollBy({
      left: direcao * carrosselRef.current.clientWidth * 0.8,
      behavior: "smooth",
    })
  }

  return (
    <section className="bg-[linear-gradient(110deg,var(--cor-fundo)_0%,var(--cor-fundo)_58%,#1a3854_100%)] px-5 py-16 sm:px-8 sm:py-20 lg:px-24">
      <div data-reveal className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[minmax(220px,.65fr)_minmax(0,1.35fr)] lg:gap-14">
        <div className="max-w-sm">
            <h2 className="text-3xl font-bold tracking-tight text-[#dceeff] sm:text-4xl">Explore a <span className="text-[var(--cor-destaque)]">Maré</span></h2>
            <p className="mt-4 leading-7 text-slate-300">Passe pelo catálogo e conheça músicas que já fazem parte da comunidade. Abra uma faixa para ver mais detalhes, ouvir uma prévia e ler outras opiniões.</p>
          {musicas.length > 1 && <div className="mt-6 hidden gap-2 lg:flex">
            <button type="button" aria-label="Ver músicas anteriores" onClick={() => moverCarrossel(-1)} className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 transition-colors hover:border-[#79bff5]"><ChevronLeft size={19} /></button>
            <button type="button" aria-label="Ver próximas músicas" onClick={() => moverCarrossel(1)} className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 transition-colors hover:border-[#79bff5]"><ChevronRight size={19} /></button>
          </div>}
        </div>

        {carregando ? <p role="status" className="py-10 text-slate-400">Carregando catálogo…</p> : erro ? <p role="status" className="py-10 text-slate-400">Não foi possível carregar o catálogo agora.</p> : musicas.length ? (
          <div className="relative min-w-0">
            <div ref={carrosselRef} className="scrollbar-oculta flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Catálogo de músicas">
              {musicas.map((musica) => <Link key={musica.id} to={`/musica/${musica.id}`} className="group w-32 shrink-0 snap-start cursor-pointer sm:w-36">
                {musica.capa ? <img src={musica.capa} alt={`Capa de ${musica.titulo}`} loading="lazy" className="aspect-square w-full rounded-lg border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.02]" /> : <div className="grid aspect-square place-items-center rounded-lg border border-white/10 bg-[var(--cor-secao-aplicativo)]"><Music2 className="size-9 text-[#79bff5]" /></div>}
                <h3 className="mt-2 truncate text-sm font-semibold">{musica.titulo}</h3>
                <p className="truncate text-xs text-slate-400">{musica.artista?.nome ?? "Artista"}</p>
              </Link>)}
            </div>
            <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[4.2rem] bg-gradient-to-l from-[#1a3854] to-transparent" />
          </div>
        ) : <p className="py-10 text-slate-400">Ainda não há músicas no catálogo.</p>}
      </div>
    </section>
  )
}
