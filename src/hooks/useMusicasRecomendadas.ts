import { useMemo } from "react";
import type { Musica } from "../services/musicaService";

export function useMusicasRecomendadas(
  musicas: Musica[],
  generosFavoritos: string[]
) {
  const musicasRecomendadas = useMemo(() => {
    if (generosFavoritos.length === 0) {
      return musicas;
    }

    const normalizarGenero = (genero: string) =>
      genero.trim().toLocaleLowerCase("pt-BR");

    return musicas.filter(
      (musica) =>
        typeof musica.genero === "string" &&
        generosFavoritos.some(
          (genero) =>
            normalizarGenero(musica.genero!) ===
            normalizarGenero(genero)
        )
    );
  }, [musicas, generosFavoritos]);

  return { musicasRecomendadas };
}