
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../api";

import {
  MicrophoneIcon,
  HeadphonesIcon,
  RadioIcon,
  HandIcon,
  GuitarIcon,
  DiscIcon,
  HeartIcon,
  XCircleIcon,
  CircleIcon,
  StarIcon,
  WavesIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";

const genres = [
  { name: "Pop", Icon: MicrophoneIcon },
  { name: "Rap", Icon: HeadphonesIcon },
  { name: "Hip Hop", Icon: RadioIcon },
  { name: "Rock", Icon: HandIcon },
  { name: "Sertanejo", Icon: GuitarIcon },
  { name: "Pagode", Icon: DiscIcon },
  { name: "Gospel", Icon: HeartIcon },
  { name: "Jazz", Icon: XCircleIcon },
  { name: "MPB", Icon: CircleIcon },
  { name: "K-pop", Icon: StarIcon },
];

const secondPageGenres = [
  { name: "Funk", Icon: RadioIcon },
  { name: "Eletrônica", Icon: WavesIcon },
  { name: "Indie", Icon: GuitarIcon },
  { name: "Reggae", Icon: HeadphonesIcon },
  { name: "Clássica", Icon: DiscIcon },
  { name: "Blues", Icon: GuitarIcon },
  { name: "Metal", Icon: HandIcon },
  { name: "R&B", Icon: HeartIcon },
  { name: "Lo-fi", Icon: RadioIcon },
  { name: "Forró", Icon: DiscIcon },
];

export default function EscolherMusica() {
  const navigate = useNavigate();

  const [selectedGenres, setSelectedGenres] = useState<string[]>([
    "Pop",
    "Hip Hop",
    "Pagode",
    "MPB",
  ]);

  const [page, setPage] = useState(1);
  const [salvando, setSalvando] = useState(false);

  const visibleGenres = page === 1 ? genres : secondPageGenres;

  function toggleGenre(name: string) {
    setSelectedGenres((current) =>
      current.includes(name)
        ? current.filter((genre) => genre !== name)
        : [...current, name]
    );
  }

  async function nextPage() {
    if (salvando) return;

    if (page === 1) {
      setPage(2);
      return;
    }

    if (selectedGenres.length === 0) {
      alert("Selecione pelo menos um gênero musical.");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Sua sessão expirou. Faça login novamente.");
      navigate("/login");
      return;
    }

    try {
      setSalvando(true);

      const response = await fetch(`${API_URL}/usuarios/me/generos`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          generos: selectedGenres,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Não foi possível salvar os gêneros musicais."
        );
      }

      navigate("/home");
    } catch (error) {
      console.error("Erro ao salvar gêneros:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Erro ao salvar os gêneros musicais."
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;500;600&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          min-width: 320px;
          min-height: 100vh;
          font-family: 'Inter', Arial, sans-serif;
          color: #f5f7fb;
          background: #080b10;
        }

        button {
          font: inherit;
        }

        .vibe-page {
          min-height: 100vh;
          padding: 36px 6.1% 30px;
          overflow: hidden;
          background-color: #080b10;
          background-image:
            radial-gradient(
              ellipse at 50% 100%,
              rgba(39, 69, 106, 0.68),
              transparent 72%
            ),
            linear-gradient(
              180deg,
              #080b10 0%,
              #090d13 46%,
              #142338 100%
            );
        }

        .vibe-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .mare-logo {
          height: 93px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5ba9f4;
        }

        .mare-logo span {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 31px;
          font-weight: 700;
          letter-spacing: -2px;
          text-transform: uppercase;
          text-shadow: 0 1px 0 #a4d7ff;
        }

        .logo-wave {
          width: 51px;
          height: 66px;
          margin-left: -1px;
          transform: rotate(-25deg);
        }

        .vibe-header h1 {
          margin: 8px 0 6px;
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 25px;
          font-weight: 400;
        }

        .vibe-header p {
          margin: 0;
          color: #a4a8b0;
          font-family: Georgia, serif;
          font-size: 12px;
        }

        .genre-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 13px 14px;
          max-width: 1200px;
          margin: 130px auto 0;
        }

        .genre-card {
          position: relative;
          min-height: 83px;
          padding: 11px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: space-between;
          text-align: left;
          color: #dce3ed;
          background: linear-gradient(145deg, #0d131c, #1d2c40);
          border: 1px solid #34404f;
          border-radius: 8px;
          cursor: pointer;
          transition:
            border-color 0.16s ease,
            transform 0.16s ease;
        }

        .genre-card:hover {
          border-color: #5ba9f4;
          transform: translateY(-1px);
        }

        .genre-card.selected {
          border: 1px solid #55a8f7;
          background: linear-gradient(145deg, #0c1521, #1e3149);
          box-shadow: inset 0 0 0 1px rgba(85, 168, 247, 0.1);
        }

        .genre-icon {
          width: 21px;
          height: 21px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 5px;
          color: #eef4fb;
          background: rgba(148, 162, 180, 0.13);
        }

        .genre-card.selected .genre-icon {
          color: #58aaf7;
          background: rgba(66, 157, 242, 0.2);
        }

        .genre-name {
          font-family: Georgia, serif;
          font-size: 11px;
          line-height: 1;
        }

        .selected-check {
          position: absolute;
          right: 10px;
          bottom: 13px;
          width: 10px;
          height: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          color: white;
          background: #59aaf5;
          font-size: 8px;
          font-weight: 700;
        }

        .vibe-footer {
          max-width: 1200px;
          margin: 49px auto 0;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .step-indicator {
          width: 96px;
          color: #9ba8b8;
          font-family: Georgia, serif;
          font-size: 10px;
        }

        .progress-track {
          height: 2px;
          margin-top: 5px;
          overflow: hidden;
          background: rgba(142, 160, 181, 0.28);
        }

        .progress-value {
          width: 15%;
          height: 100%;
          background: #58aaf7;
          transition: width 0.18s ease;
        }

        .progress-value.page-2 {
          width: 100%;
        }

        .next-button {
          width: 53px;
          height: 53px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: none;
          border-radius: 50%;
          color: white;
          background: #59a9f3;
          cursor: pointer;
          transition:
            background 0.16s ease,
            transform 0.16s ease;
        }

        .next-button:hover:not(:disabled) {
          background: #76baff;
          transform: translateX(2px);
        }

        .next-button:disabled {
          opacity: 0.7;
          cursor: wait;
        }

        @media (max-width: 760px) {
          .vibe-page {
            padding: 28px 20px;
          }

          .vibe-header h1 {
            font-size: 24px;
          }

          .vibe-header p {
            max-width: 340px;
            line-height: 1.6;
          }

          .genre-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 11px;
            margin-top: 62px;
          }

          .genre-card {
            min-height: 82px;
          }

          .vibe-footer {
            margin-top: 36px;
          }
        }

        @media (min-width: 761px) and (max-width: 1000px) {
          .genre-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            margin-top: 90px;
          }
        }
      `}</style>

      <main className="vibe-page">
        <header className="vibe-header">
          <div className="mare-logo" aria-label="Maré">
            <span>Maré</span>
            <WavesIcon
              className="logo-wave"
              weight="regular"
            />
          </div>

          <h1>Qual a sua vibe?</h1>

          <p>
            Escolha seus estilos favoritos para personalizar seu feed de
            descobertas.
          </p>
        </header>

        <section
          className="genre-grid"
          aria-label="Escolha seus estilos musicais"
        >
          {visibleGenres.map(({ name, Icon }) => {
            const selected = selectedGenres.includes(name);

            return (
              <button
                className={`genre-card${selected ? " selected" : ""}`}
                type="button"
                key={name}
                onClick={() => toggleGenre(name)}
                aria-pressed={selected}
              >
                <span className="genre-icon">
                  <Icon size={15} weight="regular" />
                </span>

                <span className="genre-name">{name}</span>

                {selected && (
                  <span
                    className="selected-check"
                    aria-label="Selecionado"
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </section>

        <footer className="vibe-footer">
          <div className="step-indicator">
            <span>Passo {page} de 2</span>

            <div className="progress-track">
              <div className={`progress-value page-${page}`} />
            </div>
          </div>

          <button
            className="next-button"
            type="button"
            onClick={nextPage}
            disabled={salvando}
            aria-label={
              salvando
                ? "Salvando gêneros"
                : page === 1
                  ? "Próxima etapa"
                  : "Concluir seleção"
            }
          >
            {salvando ? (
              <span style={{ fontSize: 11 }}>...</span>
            ) : (
              <ArrowRightIcon size={25} weight="regular" />
            )}
          </button>
        </footer>
      </main>
    </>
  );
}
