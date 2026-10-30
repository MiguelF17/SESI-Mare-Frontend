import toast from "react-hot-toast";
import { BsAppleMusic } from "react-icons/bs";
import { FaAmazon, FaSpotify } from "react-icons/fa";
import { SiYoutubemusic } from "react-icons/si";
import {
  abrirPlataforma,
  type PlataformaMusical,
} from "../services/ouvirService";

interface OuvirCardProps {
  spotifyURL?: string | null;
  appleMusicURL?: string | null;
  amazonMusicURL?: string | null;
  youtubeMusicURL?: string | null;
}

export default function OuvirCard({
  spotifyURL,
  appleMusicURL,
  amazonMusicURL,
  youtubeMusicURL,
}: OuvirCardProps) {
  function abrir(
    plataforma: PlataformaMusical,
    url: string | null | undefined,
    nome: string
  ) {
    if (!url) {
      toast.error(`Essa música não possui um link do ${nome}.`);
      return;
    }

    if (!abrirPlataforma(plataforma, url)) {
      toast.error(`O link do ${nome} é inválido.`);
    }
  }

  return (
    <section className="mt-5 rounded-xl border border-[var(--cor-borda-suave)] bg-[#182131] p-3">
      <h2 className="text-[24px] font-medium text-[var(--cor-texto-principal)]">Ouvir</h2>

      <p className="mb-3 mt-1 text-[12px] text-[#8d96a6]">
        Escolha a plataforma que você usa para ouvir.
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          onClick={() => abrir("spotify", spotifyURL, "Spotify")}
          className="flex h-[40px] cursor-pointer items-center gap-2 rounded-md border border-[#293449] bg-[var(--cor-superficie-cartao)] px-2 text-[12px] text-[var(--cor-texto-principal)] transition hover:bg-[var(--cor-superficie-suave)]"
        >
          <FaSpotify size={24} className="text-[#1DB954]" />
          Spotify
        </button>

        <button
          onClick={() => abrir("youtubeMusic", youtubeMusicURL, "YouTube Music")}
          className="flex h-[40px] cursor-pointer items-center gap-2 rounded-md border border-[#293449] bg-[var(--cor-superficie-cartao)] px-2 text-[12px] text-[var(--cor-texto-principal)] transition hover:bg-[var(--cor-superficie-suave)]"
        >
          <SiYoutubemusic size={24} className="text-[#FF0033]" />
          YouTube Music
        </button>

        <button
          onClick={() => abrir("amazonMusic", amazonMusicURL, "Amazon Music")}
          className="flex h-[40px] cursor-pointer items-center gap-2 rounded-md border border-[#293449] bg-[var(--cor-superficie-cartao)] px-2 text-[12px] text-[var(--cor-texto-principal)] transition hover:bg-[var(--cor-superficie-suave)]"
        >
          <FaAmazon size={24} className="text-[#25B7D3]" />
          Amazon Music
        </button>

        <button
          onClick={() => abrir("appleMusic", appleMusicURL, "Apple Music")}
          className="flex h-[40px] cursor-pointer items-center gap-2 rounded-md border border-[#293449] bg-[var(--cor-superficie-cartao)] px-2 text-[12px] text-[var(--cor-texto-principal)] transition hover:bg-[var(--cor-superficie-suave)]"
        >
          <BsAppleMusic size={24} className="text-[#FF4E6B]" />
          Apple Music
        </button>
      </div>
    </section>
  );
}