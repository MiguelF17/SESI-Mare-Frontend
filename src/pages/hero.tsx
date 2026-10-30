
import Navbar from "../components/navbar"
import Footer from "../components/footer"

import fundo from "../assets/fundoHero.jpg"
import app_store from "../assets/app_store.png"
import play_store from "../assets/play_store.png"
import qrcode from "../assets/qrcode.png"

import { useNavigate } from "react-router-dom"


function Hero() {

  const navigate = useNavigate();


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

            <img
              src={app_store}
              alt="App Store"
              className="
                w-40
                sm:w-[190px]
                h-auto
                cursor-pointer
                hover:scale-105
                transition
              "
            />


            <img
              src={play_store}
              alt="Google Play"
              className="
                w-40
                sm:w-[180px]
                h-auto
                cursor-pointer
                hover:scale-105
                transition
              "
            />

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



      {/* ================= FOOTER ================= */}

      <Footer />

    </>
  )
}

export default Hero
