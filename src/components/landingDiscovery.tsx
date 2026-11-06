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
    <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-24">
      <div data-reveal className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Explore a Maré</h2>
            <p className="mt-3 max-w-2xl leading-7 text-slate-300">Um recorte do catálogo de músicas da comunidade.</p>
          </div>
          {musicas.length > 1 && (
            <div className="hidden gap-2 sm:flex">
              <button type="button" aria-label="Ver músicas anteriores" onClick={() => moverCarrossel(-1)} className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 transition-colors hover:border-[#79bff5]">
                <ChevronLeft size={19} />
              </button>
              <button type="button" aria-label="Ver próximas músicas" onClick={() => moverCarrossel(1)} className="grid size-10 cursor-pointer place-items-center rounded-full border border-white/20 transition-colors hover:border-[#79bff5]">
                <ChevronRight size={19} />
              </button>
            </div>
          )}
        </div>

        {carregando ? (
          <p role="status" className="py-10 text-slate-400">Carregando catálogo…</p>
        ) : erro ? (
          <p role="status" className="py-10 text-slate-400">Não foi possível carregar o catálogo agora.</p>
        ) : musicas.length ? (
          <div ref={carrosselRef} className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4" aria-label="Catálogo de músicas">
            {musicas.map((musica) => (
              <Link key={musica.id} to={`/musica/${musica.id}`} className="group w-[42vw] max-w-56 shrink-0 snap-start cursor-pointer sm:w-[28vw] md:w-[22vw] lg:w-[18vw]">
                {musica.capa ? (
                  <img src={musica.capa} alt={`Capa de ${musica.titulo}`} loading="lazy" className="aspect-square w-full rounded-lg border border-white/10 object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                ) : (
                  <div className="grid aspect-square place-items-center rounded-lg border border-white/10 bg-[var(--cor-secao-aplicativo)]"><Music2 className="size-10 text-[#79bff5]" /></div>
                )}
                <h3 className="mt-3 truncate font-semibold">{musica.titulo}</h3>
                <p className="truncate text-sm text-slate-400">{musica.artista?.nome ?? "Artista"}{musica.genero ? ` · ${musica.genero}` : ""}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-10 text-slate-400">Ainda não há músicas no catálogo.</p>
        )}
      </div>
    </section>
  )
}
