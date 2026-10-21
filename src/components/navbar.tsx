
import { BsAppleMusic } from "react-icons/bs";
import { FaAmazon, FaSpotify } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";
import {
  abrirPlataforma,
  type PlataformaMusical,
} from "../services/ouvirService";
import toast from "react-hot-toast";

interface OuvirCardProps {
  spotifyURL?: string | null;
  youtubeMusicURL?: string | null;
  amazonMusicURL?: string | null;
  appleMusicURL?: string | null;
}

export default function OuvirCard({
  spotifyURL,
  youtubeMusicURL,
  amazonMusicURL,
  appleMusicURL,
}: OuvirCardProps) {
  const plataformas: {
    id: PlataformaMusical;
    nome: string;
    url?: string | null;
    icone: React.ReactNode;
    cor: string;
  }[] = [
    {
      id: "spotify",
      nome: "Spotify",
      url: spotifyURL,
      icone: <FaSpotify size={24} />,
      cor: "text-[#1DB954]",
    },
    {
      id: "youtubeMusic",
      nome: "YouTube Music",
      url: youtubeMusicURL,
      icone: <SiYoutubemusic size={24} />,
      cor: "text-[#FF0033]",
    },
    {
      id: "amazonMusic",
      nome: "Amazon Music",
      url: amazonMusicURL,
      icone: <FaAmazon size={24} />,
      cor: "text-[#25B7D3]",
    },
    {
      id: "appleMusic",
      nome: "Apple Music",
      url: appleMusicURL,
      icone: <BsAppleMusic size={24} />,
      cor: "text-[#FF4E6B]",
    },
  ];

  return (
    <section className="mt-5 rounded-xl border border-[#273349] bg-[#182131] p-3">
      <h2 className="text-[24px] font-medium text-white">
        Ouvir
      </h2>

      <p className="mb-3 mt-1 text-[12px] text-[#8d96a6]">
        Escolha uma plataforma para ouvir a música.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {plataformas.map((plataforma) => (
          <button
            key={plataforma.id}
            type="button"
            disabled={!plataforma.url}
            onClick={() => {
              const abriu = abrirPlataforma(
                plataforma.id,
                plataforma.url
              );

              if (!abriu) {
                toast.error("Link indisponível ou inválido para essa plataforma.");
              }
            }}
            className="
              flex h-[40px] items-center gap-2 rounded-md
              border border-[#293449] bg-[#111824] px-2
              text-[12px] text-white transition
              enabled:cursor-pointer enabled:hover:bg-[#172131]
              disabled:cursor-not-allowed disabled:opacity-40
            "
          >
            <span className={plataforma.cor}>
              {plataforma.icone}
            </span>

            {plataforma.nome}
          </button>
        ))}
      </div>
    </section>
  );
}
