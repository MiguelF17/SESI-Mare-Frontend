
import { useMemo } from "react";
import type { Musica } from "../services/musicaService";

interface ArtistaFavorito {
  artistaId: number;
}

export function useMusicasRecomendadas(
  musicas: Musica[],
  generosFavoritos: string[],
  artistasFavoritos: ArtistaFavorito[] = []
) {
  return useMemo(() => {
    const normalizar = (valor: string) =>
      valor.trim().toLocaleLowerCase("pt-BR");

    const generos = generosFavoritos.map(normalizar);
    const idsArtistas = artistasFavoritos.map(
      (artista) => Number(artista.artistaId)
    );

    const recomendadas = musicas.filter((musica) => {
      const combinaGenero =
        typeof musica.genero === "string" &&
        generos.includes(normalizar(musica.genero));

      const combinaArtista =
        musica.artista?.id != null &&
        idsArtistas.includes(Number(musica.artista.id));

      return combinaGenero || combinaArtista;
    });

    // Embaralha a ordem das recomendações.
    for (let i = recomendadas.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [recomendadas[i], recomendadas[j]] = [
        recomendadas[j],
        recomendadas[i],
      ];
    }

    return {
      musicasRecomendadas: recomendadas,
    };
  }, [musicas, generosFavoritos, artistasFavoritos]);
}
