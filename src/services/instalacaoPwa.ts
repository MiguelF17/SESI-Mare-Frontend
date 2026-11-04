/** Guarda a solicitação nativa de instalação para que Hero e Configurações usem o mesmo fluxo. */
type EventoInstalacaoPwa = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let eventoInstalacao: EventoInstalacaoPwa | null = null;
const ouvintes = new Set<(disponivel: boolean) => void>();

function avisarOuvintes() {
  ouvintes.forEach((ouvinte) => ouvinte(eventoInstalacao !== null));
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (evento) => {
    evento.preventDefault();
    eventoInstalacao = evento as EventoInstalacaoPwa;
    avisarOuvintes();
  });

  window.addEventListener("appinstalled", () => {
    eventoInstalacao = null;
    avisarOuvintes();
  });
}

export function observarInstalacaoPwa(ouvinte: (disponivel: boolean) => void) {
  ouvintes.add(ouvinte);
  ouvinte(eventoInstalacao !== null);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

export async function instalarPwaAgora(): Promise<boolean> {
  if (!eventoInstalacao) return false;

  const evento = eventoInstalacao;
  eventoInstalacao = null;
  avisarOuvintes();

  try {
    await evento.prompt();
    const escolha = await evento.userChoice;
    return escolha.outcome === "accepted";
  } catch {
    return false;
  }
}
