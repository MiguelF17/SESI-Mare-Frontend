
import { useId, useMemo } from "react";
import type { Musica } from "../services/musicaService";

interface ArtistaFavorito {
  artistaId: number;
}

function chaveAleatoriaEstavel(musica: Musica, instancia: string) {
  const identificador = `${instancia}-${musica.id}-${musica.titulo}`;
  let hash = 2166136261;

  for (let indice = 0; indice < identificador.length; indice += 1) {
    hash ^= identificador.charCodeAt(indice);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function useMusicasRecomendadas(
  musicas: Musica[],
  generosFavoritos: string[],
  artistasFavoritos: ArtistaFavorito[] = []
) {
  const instancia = useId();

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

    // Mantém uma ordem variada e estável entre renderizações.
    recomendadas.sort(
      (a, b) =>
        chaveAleatoriaEstavel(a, instancia) -
        chaveAleatoriaEstavel(b, instancia)
    );

    return {
      musicasRecomendadas: recomendadas,
    };
  }, [musicas, generosFavoritos, artistasFavoritos, instancia]);
}
