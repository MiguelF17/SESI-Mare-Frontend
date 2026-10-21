
export type PlataformaMusical =
  | "spotify"
  | "youtubeMusic"
  | "amazonMusic"
  | "appleMusic";

export function abrirPlataforma(
  plataforma: PlataformaMusical,
  url?: string | null
): boolean {
  if (!url) {
    return false;
  }

  const dominiosPermitidos: Record<PlataformaMusical, string[]> = {
    spotify: ["open.spotify.com", "spotify.com"],
    youtubeMusic: ["music.youtube.com", "youtube.com", "youtu.be"],
    amazonMusic: ["music.amazon.com", "amazon.com.br", "amazon.com"],
    appleMusic: ["music.apple.com"],
  };

  try {
    const endereco = new URL(url);

    if (
      endereco.protocol !== "https:" ||
      !dominiosPermitidos[plataforma].some(
        (dominio) =>
          endereco.hostname === dominio ||
          endereco.hostname.endsWith(`.${dominio}`)
      )
    ) {
      return false;
    }

    window.open(endereco.href, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}
