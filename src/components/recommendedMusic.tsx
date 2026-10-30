
import { useNavigate } from "react-router-dom";

interface RecommendedMusicProps {
  id: number;
  titulo: string;
  artist?: string;
  capa?: string | null;
}

export default function RecommendedMusic({
  id,
  titulo,
  artist = "Artista desconhecido",
  capa,
}: RecommendedMusicProps) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(`/musica/${id}`)}
      className="w-full cursor-pointer rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-3 text-left transition-colors hover:bg-[#171d2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cor-destaque)]"
    >
      <div className="flex items-center gap-3">
        <img
          src={capa || "/logo.png"}
          alt={`Capa de ${titulo}`}
          loading="lazy"
          className="h-14 w-14 shrink-0 rounded-lg object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-[#d7dbe2]">
            {titulo}
          </p>

          <p className="mt-1 truncate text-[10px] text-[var(--cor-texto-discreto)]">
            {artist}
          </p>
        </div>
      </div>
    </button>
  );
}
