export function lerDestinoAposLogin(estado: unknown): string | undefined {
  if (!estado || typeof estado !== "object" || !("destinoAposLogin" in estado)) return;

  const destino = estado.destinoAposLogin;
  if (typeof destino !== "string" || !destino.startsWith("/") || destino.startsWith("//") || destino.includes("\\")) return;

  try {
    const url = new URL(destino, window.location.origin);
    if (url.origin !== window.location.origin || url.pathname.startsWith("//") || /^\/filtrar\/?$/i.test(url.pathname)) return;

    return url.pathname + url.search + url.hash;
  } catch {
    return;
  }
}
