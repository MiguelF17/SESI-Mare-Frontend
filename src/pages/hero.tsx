
import { useEffect, useState } from "react"
import Navbar from "../components/navbar"
import Footer from "../components/footer"

import fundo from "../assets/fundoHero.jpg"
import qrcode from "../assets/RoW2Cw.png"

import { useNavigate } from "react-router-dom"

type EventoInstalacaoPwa = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function Hero() {

  const navigate = useNavigate();
  const [eventoInstalacao, setEventoInstalacao] = useState<EventoInstalacaoPwa | null>(null)
  const [mostrarAjudaPwa, setMostrarAjudaPwa] = useState(false)
  const [ehIOS, setEhIOS] = useState(false)

  useEffect(() => {
    const agente = navigator.userAgent
    setEhIOS(/iPad|iPhone|iPod/.test(agente) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))

    const guardarPrompt = (evento: Event) => {
      evento.preventDefault()
      setEventoInstalacao(evento as EventoInstalacaoPwa)
    }
    window.addEventListener("beforeinstallprompt", guardarPrompt)
    return () => window.removeEventListener("beforeinstallprompt", guardarPrompt)
  }, [])

  async function instalarPwa() {
    if (!eventoInstalacao) {
      setMostrarAjudaPwa(true)
      return
    }

    try {
      await eventoInstalacao.prompt()
      const escolha = await eventoInstalacao.userChoice
      if (escolha.outcome === "accepted") setEventoInstalacao(null)
    } catch {
      setMostrarAjudaPwa(true)
    }
  }


  /* se não estiver logado, vai para o login */
  function handleComeçar() {

    const usuario = sessionStorage.getItem("user");

    if (!usuario) {
      navigate("/login");
      return;
    }

    navigate("/home")
  }


  return (
    <>

      <Navbar />


      {/* =================== HERO ====================== */}

      <div
        className="
          destaque-inicial
          relative
          bg-[var(--cor-fundo)]
          text-[var(--cor-texto-principal)]
          min-h-[82svh] sm:min-h-[100svh]
          flex
          items-center
          px-5
          py-24
          sm:px-10
          lg:px-24
          overflow-hidden
        "
        style={{ fontFamily: "Inter, sans-serif" }}
      >

        {/* imagem de fundo */}

        <div
          className="absolute inset-0 bg-[length:auto_100%] bg-right-center opacity-55 sm:bg-cover sm:bg-center sm:opacity-60"
          style={{ backgroundImage: `url(${fundo})` }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--cor-fundo)]/55 via-transparent to-[var(--cor-fundo)]/70" />

        {/* Texto */}

        <div className="relative z-10 mt-8 w-full max-w-2xl sm:mt-24">

          <h1 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">

            DESCUBRA, AVALIE E
            <br />

            COMPARTILHE MÚSICAS

          </h1>


          <h2 className="mt-2 text-xl font-light text-[var(--cor-destaque)] sm:mt-3 sm:text-3xl">

            que combinam com você

          </h2>


          <div className="my-6 h-1 w-full max-w-[520px] rounded-full bg-[var(--cor-destaque)]"></div>


          <p className="text-[16px] leading-6 max-w-[500px] text-[var(--cor-texto-cinza-300)]">

            Encontre novas músicas, compartilhe suas descobertas
            e descubra o que outras pessoas estão ouvindo.

          </p>


          {/* BOTÃO */}

          <button
            onClick={handleComeçar}
            className="
              mt-8
              border
              text-lg
              border-[white]
              text-[var(--cor-texto-principal)]
              px-8
              sm:px-20
              py-4
              rounded-lg
              hover:bg-[var(--cor-destaque)]
              hover:text-[#080D14]
              hover:border-[var(--cor-destaque)]
              cursor-pointer
              hover:scale-105
              transition
              duration-300
              outline-none
            "
          >

            Começar agora

          </button>

        </div>

      </div>



      {/* ================= DESTAQUES ================= */}

      <div className="bg-[var(--cor-fundo-alternativo)] px-4 py-16 sm:px-8 sm:py-20 lg:px-24 lg:py-28">

        <h2
          className="mb-8 text-center text-3xl text-[var(--cor-destaque)] sm:mb-10 sm:text-5xl"
          style={{ fontFamily: "Inter, sans-serif" }}
        >

          Destaques

        </h2>


        {/* Banner */}

        <div
          className="
            w-full
            h-80
            rounded-2xl
            border-2
            border-[#1d3653]
            bg-[#111A25]
            flex
            items-center
            justify-center
          "
        >

          <div className="text-center">

            <p className="text-2xl font-semibold text-[var(--cor-texto-principal)] sm:text-3xl">

              Descubra novas músicas

            </p>

            <p className="mt-3 px-3 text-base text-[var(--cor-texto-cinza-400)] sm:text-lg">

              Encontre artistas e músicas que combinam com você.

            </p>

          </div>

        </div>

      </div>



      {/* ================= APP SECTION ================= */}

      <div
        className="
          bg-[var(--cor-secao-aplicativo)]
          px-4
          py-12
          sm:px-8
          lg:px-16
          flex
          flex-col
          items-center
          gap-10
          lg:flex-row
        "
      >

        {/* espaço da esquerda */}

        <div className="flex-1 text-[var(--cor-texto-principal)] text-center">

          <p className="text-2xl text-[#9FC5F3] sm:text-3xl">

            ACESSE DE QUALQUER LUGAR

          </p>


          <h2 className="mt-2 text-3xl font-bold sm:text-5xl">

            Leve a Maré com você

          </h2>

        </div>


        {/* TEXTO */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
            text-[var(--cor-texto-principal)]
            flex-1
          "
        >

          <h2 className="mt-2 text-2xl">

            Acesse a Maré pelo seu celular.
          </h2>

          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4">

            <a
              href="https://expo.dev/artifacts/eas/wPvRiEwrkL8WQavRrdrPkg3_dSry2DSVhF3123FZomU.apk"
              download="mare.apk"
              aria-label="Baixar o aplicativo Maré para Android"
              className="
                inline-flex min-h-12 items-center justify-center rounded-xl
                bg-[#58AAF0] px-6 py-3 text-base font-semibold text-[#08111B]
                shadow-lg shadow-[#58AAF0]/20 transition hover:scale-105
                hover:bg-[#83C4FA] focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-4 focus-visible:outline-[#58AAF0]
              "
            >
              Baixar para Android
            </a>

            <button
              type="button"
              onClick={() => void instalarPwa()}
              aria-label={ehIOS ? "Adicionar o site Maré à tela inicial do iPhone" : "Instalar o site Maré como aplicativo"}
              className="
                inline-flex min-h-12 items-center justify-center rounded-xl
                bg-[#58AAF0] px-6 py-3 text-base font-semibold text-[#08111B]
                shadow-lg shadow-[#58AAF0]/20 transition hover:scale-105
                hover:bg-[#83C4FA] focus-visible:outline focus-visible:outline-2
                focus-visible:outline-offset-4 focus-visible:outline-[#58AAF0]
              "
            >
              {ehIOS ? "Adicionar ao iPhone" : "Instalar Maré"}
            </button>

          </div>

        </div>



        {/* QR CODE */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            text-center
            text-[var(--cor-texto-principal)]
            flex-1
          "
        >

          <p className="text-2xl mb-4">

            Ou acesse pelo QR Code

          </p>


          <img
            src={qrcode}
            alt="QR Code"
            className="w-36 sm:w-[180px]"
          />

        </div>

      </div>


      {mostrarAjudaPwa && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-instalar-pwa" className="w-full max-w-sm rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-5 text-left shadow-2xl">
            <h2 id="titulo-instalar-pwa" className="text-lg font-semibold text-[var(--cor-texto-principal)]">Adicionar a Maré à tela inicial</h2>
            {ehIOS ? (
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-5 text-[var(--cor-texto-secundario)]">
                <li>Abra este site no Safari do iPhone.</li>
                <li>Toque em Compartilhar.</li>
                <li>Escolha “Adicionar à Tela de Início” e confirme em “Adicionar”.</li>
              </ol>
            ) : (
              <p className="mt-3 text-sm leading-5 text-[var(--cor-texto-secundario)]">No menu do navegador, escolha “Instalar app” ou “Adicionar à tela inicial”.</p>
            )}
            <button type="button" onClick={() => setMostrarAjudaPwa(false)} className="mt-5 rounded-lg bg-[var(--cor-destaque-alternativo)] px-4 py-2 text-sm font-semibold text-[var(--cor-tinta)]">Entendi</button>
          </section>
        </div>
      )}



      {/* ================= FOOTER ================= */}

      <Footer />

    </>
  )
}

export default Hero
