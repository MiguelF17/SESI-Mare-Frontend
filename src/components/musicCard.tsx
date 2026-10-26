
import {
  BookmarkSimpleIcon,
  DotsThreeIcon,
  Star,
  StarIcon,
  ArrowSquareOutIcon,
  UserCircleIcon,
  ShareNetworkIcon,
  CheckIcon,
} from "@phosphor-icons/react";

import { useEffect, useState } from "react";
import type { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import logo from "../assets/logo.png";
import {
  verificarMusicaSalva,
  alternarMusicaSalva,
} from "../services/salvarMusicaService";

type MusicCardProps = {
  id?: number;
  tipo: "banner" | "quadrado" | "post";
  titulo?: string;
  artista?: string;
  artistaId?: number;
  capa?: string | null;
  nota?: number;
  avaliacoes?: number;
  duracaoSegundos?: number;
  larguraFixa?: boolean;
  onRemover?: () => void;
};

export default function MusicCard({
  id,
  tipo,
  titulo = "Nome da música",
  artista = "Nome do artista",
  artistaId,
  capa,
  nota = 0,
  avaliacoes = 0,
  duracaoSegundos = 0,
  larguraFixa = false,
  onRemover,
}: MusicCardProps) {
  const navigate = useNavigate();

  const [salva, setSalva] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  function formatarDuracao(segundos: number) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;

    return `${minutos}:${segundosRestantes.toString().padStart(2, "0")}`;
  }

  // Verificar se a música está salva
  useEffect(() => {
    let ativo = true;

    async function verificarSalvamento() {
      setSalva(false);

      if (!id || !localStorage.getItem("token")) {
        return;
      }

      try {
        const estaSalva = await verificarMusicaSalva(id);

        if (ativo) {
          setSalva(estaSalva);
        }
      } catch (error) {
        console.error("Erro ao verificar música salva:", error);
      }
    }

    verificarSalvamento();

    return () => {
      ativo = false;
    };
  }, [id]);

  // Salvar ou remover música dos salvos
  async function alternarSalvamento() {
    if (!id || salvando) return;

    if (!localStorage.getItem("token")) {
      setMenuAberto(false);
      navigate("/login");
      return;
    }

    try {
      setSalvando(true);

      await alternarMusicaSalva(id, salva);

      const estavaSalva = salva;
      setSalva(!estavaSalva);
      setMenuAberto(false);

      if (estavaSalva) {
        onRemover?.();
      }
    } catch (error) {
      console.error("Erro ao salvar/remover música:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao atualizar música salva."
      );
    } finally {
      setSalvando(false);
    }
  }

  function abrirMusica(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setMenuAberto(false);

    if (id) {
      navigate(`/musica/${id}`);
    }
  }

  function abrirArtista(e: MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setMenuAberto(false);

    if (artistaId != null) {
      navigate(`/artista/${artistaId}`);
    }
  }

  async function compartilharMusica(
    e: MouseEvent<HTMLButtonElement>
  ) {
    e.stopPropagation();

    if (!id) return;

    const link = `${window.location.origin}/musica/${id}`;

    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);

      window.setTimeout(() => {
        setCopiado(false);
      }, 2000);
    } catch (error) {
      console.error("Não foi possível copiar o link:", error);
      toast.error("Não foi possível copiar o link.");
    }
  }

  // CARD BANNER
  if (tipo === "banner") {
    return (
      <div
        onClick={() => id && navigate(`/musica/${id}`)}
        className="h-[160px] w-[320px] shrink-0 cursor-pointer overflow-hidden rounded-lg border border-[#354052] bg-[#111420]"
      >
        <div className="relative h-full w-full">
          <img
            src={capa || logo}
            alt={titulo}
            className="absolute inset-0 h-full w-full object-cover" draggable={false}
          />

          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 flex h-full w-full flex-col justify-end p-4">
            <div>
              <p className="truncate text-lg text-white">{titulo}</p>

              <p className="mt-1 truncate text-xs text-[#D0D0D5]">
                {artista}
              </p>

              <div className="mt-2 flex items-center">
                {avaliacoes > 0 ? (
                  <>
                    <StarIcon
                      size={13}
                      weight="fill"
                      className="text-[#58AAF0]"
                    />

                    <span className="ml-1 text-[11px] text-white">
                      {Number(nota).toFixed(1)}
                    </span>

                    <span className="ml-1 text-[11px] text-[#b5bbca]">
                      ({avaliacoes}{" "}
                      {avaliacoes === 1 ? "avaliação" : "avaliações"})
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] text-[#b5bbca]">
                    Sem avaliações
                  </span>
                )}

                <span className="ml-3 text-[11px] text-[#D0D0D5]">
                  {formatarDuracao(duracaoSegundos)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CARD QUADRADO
  if (tipo === "quadrado") {
    return (
      <div
        onClick={() => id && navigate(`/musica/${id}`)}
        className={`cursor-pointer rounded-lg border border-[#354052] bg-[#111420] p-2 transition hover:bg-[#171C2A] ${
          larguraFixa ? "w-[180px] shrink-0" : "w-full min-w-0"
        }`}
      >
        <img
          src={capa || logo}
          alt={titulo}
          className="mx-auto aspect-square w-full rounded-xl object-cover" draggable={false}
        />

        <p className="mt-2 truncate text-xs text-white">{titulo}</p>

        <p className="mt-1 truncate text-[11px] text-[#8B93A3]">
          {artista}
        </p>

        <div className="mt-1 flex items-center">
          {avaliacoes > 0 ? (
            <>
              <Star
                size={12}
                weight="fill"
                className="text-[#58AAF0]"
              />

              <span className="ml-1 text-[10px] text-[#D0D0D5]">
                {Number(nota).toFixed(1)}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-[#687386]">
              Sem avaliações
            </span>
          )}
        </div>
      </div>
    );
  }

  // CARD POST / SALVO
  return (
    <div
      onClick={() => id && navigate(`/musica/${id}`)}
      className="w-full cursor-pointer rounded-lg border border-[#354052] bg-[#111420] p-3 transition hover:border-[#40516b]"
    >
      <div className="flex w-full items-center">
        <img
          src={capa || logo}
          alt={titulo}
          className="h-16 w-16 shrink-0 rounded-xl object-cover" draggable={false}
        />

        <div className="ml-3 min-w-0 flex-1">
          <p className="truncate text-sm text-white">{titulo}</p>

          <p className="mt-1 truncate text-xs text-[#8B93A3]">
            {artista}
          </p>

          <div className="mt-2 flex min-w-0 items-center">
            {avaliacoes > 0 ? (
              <>
                <StarIcon
                  size={13}
                  weight="fill"
                  className="shrink-0 text-[#58AAF0]"
                />

                <span className="ml-1 text-[11px] text-white">
                  {Number(nota).toFixed(1)}
                </span>

                <span className="ml-1 truncate text-[11px] text-[#687386]">
                  ({avaliacoes}{" "}
                  {avaliacoes === 1 ? "avaliação" : "avaliações"})
                </span>
              </>
            ) : (
              <span className="text-[11px] text-[#687386]">
                Sem avaliações
              </span>
            )}
          </div>
        </div>

        <div className="ml-2 flex shrink-0 items-center">
          <span className="mr-2 text-[12px] text-[#687386]">
            {formatarDuracao(duracaoSegundos)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[#354052] pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            alternarSalvamento();
          }}
          disabled={salvando}
          aria-label={salva ? "Remover dos salvos" : "Salvar música"}
          className="flex cursor-pointer items-center disabled:opacity-50"
        >
          <BookmarkSimpleIcon
            size={17}
            weight={salva ? "fill" : "regular"}
            className={salva ? "text-[#58AAF0]" : "text-[#687386]"}
          />

          <span
            className={`ml-1 text-[11px] ${
              salva ? "text-[#58AAF0]" : "text-[#687386]"
            }`}
          >
            {salvando ? "Salvando..." : salva ? "Salva" : "Salvar"}
          </span>
        </button>

        {/* MENU DOS TRÊS PONTINHOS */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuAberto(!menuAberto);
            }}
            aria-label="Mais opções da música"
            aria-expanded={menuAberto}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition ${
              menuAberto
                ? "bg-[#273349] text-[#58AAF0]"
                : "text-[#D0D0D5] hover:bg-[#202536]"
            }`}
          >
            <DotsThreeIcon size={22} weight="bold" />
          </button>

          {menuAberto && (
            <>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAberto(false);
                }}
                className="fixed inset-0 z-30 cursor-default"
              />

              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-10 right-0 z-40 w-56 overflow-hidden rounded-xl border border-[#354052] bg-[#111420] p-1.5 shadow-xl"
              >
                <button
                  type="button"
                  onClick={alternarSalvamento}
                  disabled={salvando}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D0D0D5] transition hover:bg-[#202536] hover:text-white disabled:opacity-50"
                >
                  <BookmarkSimpleIcon
                    size={18}
                    weight={salva ? "fill" : "regular"}
                    className={salva ? "text-[#58AAF0]" : ""}
                  />

                  <span className="flex-1">
                    {salvando
                      ? "Aguarde..."
                      : salva
                        ? "Remover dos salvos"
                        : "Salvar música"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={abrirMusica}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D0D0D5] transition hover:bg-[#202536] hover:text-white"
                >
                  <ArrowSquareOutIcon size={18} />
                  Abrir página da música
                </button>

                {artistaId != null && (
                  <button
                    type="button"
                    onClick={abrirArtista}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D0D0D5] transition hover:bg-[#202536] hover:text-white"
                  >
                    <UserCircleIcon size={18} />
                    Ver artista
                  </button>
                )}

                <div className="my-1 border-t border-[#273349]" />

                <button
                  type="button"
                  onClick={compartilharMusica}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-[#D0D0D5] transition hover:bg-[#202536] hover:text-white"
                >
                  {copiado ? (
                    <CheckIcon
                      size={18}
                      className="text-[#58AAF0]"
                    />
                  ) : (
                    <ShareNetworkIcon size={18} />
                  )}

                  <span>
                    {copiado ? "Link copiado!" : "Compartilhar música"}
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
