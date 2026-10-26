
import { useEffect, useState } from "react";
import { apiRequest } from "../api";
import { buscarMusicas, type Musica } from "../services/musicaService";
import { buscarGenerosFavoritos } from "../services/usuarioService";
import { useMusicasRecomendadas } from "../hooks/useMusicasRecomendadas";
import RecommendedMusic from "./recommendedMusic";

interface ArtistaFavorito {
  artistaId: number;
}

export default function RecommendedMusicList() {
  const [musicas, setMusicas] = useState<Musica[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [artistas, setArtistas] = useState<ArtistaFavorito[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarRecomendacoes() {
      try {
        if (!localStorage.getItem("token")) return;

        const [listaMusicas, listaGeneros, listaArtistas] =
          await Promise.all([
            buscarMusicas(),
            buscarGenerosFavoritos(),
            apiRequest<ArtistaFavorito[]>("/usuarios/me/artistas"),
          ]);

        if (!ativo) return;

        setMusicas(listaMusicas);
        setGeneros(listaGeneros);
        setArtistas(listaArtistas);
      } catch (erro) {
        console.error("Erro ao carregar recomendações:", erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarRecomendacoes();

    return () => {
      ativo = false;
    };
  }, []);

  const { musicasRecomendadas } = useMusicasRecomendadas(
    musicas,
    generos,
    artistas
  );

  if (carregando) {
    return <p className="text-sm text-[#697386]">Carregando recomendações...</p>;
  }

  if (musicasRecomendadas.length === 0) {
    return (
      <p className="text-sm text-[#697386]">
        Nenhuma recomendação encontrada para suas preferências.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {musicasRecomendadas.slice(0, 5).map((musica) => (
        <RecommendedMusic
          key={musica.id}
          id={musica.id}
          titulo={musica.titulo}
          artist={musica.artista?.nome}
          capa={musica.capa}
        />
      ))}
    </div>
  );
}
