import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BellIcon,
  BellSlashIcon,
  ChatCircleDotsIcon,
  LockKeyIcon,
  PaperPlaneTiltIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import PageLayout from "../components/pageLayout";
import { apiRequest } from "../api";

type Pessoa = { id: number; nome: string; username: string; foto?: string | null };
type Mensagem = {
  id: number;
  remetenteId: number;
  texto: string;
  criadaEm: string;
  lidaEm?: string | null;
  remetente: Pessoa;
  musica?: { id: number; titulo: string; capa?: string | null; artista: { nome: string } } | null;
};
type Conversa = {
  id: number;
  outroUsuario: Pessoa;
  ultimaMensagem: { texto: string } | null;
  mensagensNaoLidas: number;
  bloqueadaPorMim: boolean;
  bloqueadaPeloOutro: boolean;
  silenciadaPorMim: boolean;
};

function chaveDoDia(dataIso: string) {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "data-invalida";
  return `${data.getFullYear()}-${data.getMonth()}-${data.getDate()}`;
}

function formatarSeparadorDoDia(dataIso: string) {
  const data = new Date(dataIso);
  if (Number.isNaN(data.getTime())) return "Data indisponível";

  const hoje = new Date();
  const ontem = new Date(hoje);
  ontem.setDate(hoje.getDate() - 1);

  if (chaveDoDia(dataIso) === chaveDoDia(hoje.toISOString())) return "Hoje";
  if (chaveDoDia(dataIso) === chaveDoDia(ontem.toISOString())) return "Ontem";

  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    ...(data.getFullYear() !== hoje.getFullYear() ? { year: "numeric" as const } : {}),
  });
}

function formatarHora(valor: string) {
  const data = new Date(valor);
  return Number.isNaN(data.getTime())
    ? ""
    : data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function Mensagens() {
  const [params, setParams] = useSearchParams();
  const idAtivo = Number(params.get("id"));
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [meuId, setMeuId] = useState(0);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvandoConfiguracao, setSalvandoConfiguracao] = useState<"silenciar" | "bloquear" | null>(null);
  const [tecladoAberto, setTecladoAberto] = useState(false);
  const [alturaVisualViewport, setAlturaVisualViewport] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    const atualizarAltura = () => setAlturaVisualViewport(viewport?.height ?? window.innerHeight);
    atualizarAltura();
    viewport?.addEventListener("resize", atualizarAltura);
    return () => viewport?.removeEventListener("resize", atualizarAltura);
  }, []);

  useEffect(() => () => {
    document.body.classList.remove("mare-chat-teclado-aberto");
  }, []);

  function focarCampoMensagem() {
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    document.body.classList.add("mare-chat-teclado-aberto");
    setTecladoAberto(true);
  }

  function desfocarCampoMensagem() {
    document.body.classList.remove("mare-chat-teclado-aberto");
    setTecladoAberto(false);
  }

  const carregarConversas = useCallback(async () => {
    try {
      const [lista, perfil] = await Promise.all([
        apiRequest<Conversa[]>("/conversas"),
        apiRequest<Pessoa>("/usuarios/me"),
      ]);
      setConversas(lista);
      setMeuId(perfil.id);
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar suas conversas.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const carregarMensagens = useCallback(async () => {
    if (!idAtivo) {
      setMensagens([]);
      return;
    }

    try {
      const dados = await apiRequest<Mensagem[]>(`/conversas/${idAtivo}/mensagens`);
      setMensagens(dados);
      await apiRequest(`/conversas/${idAtivo}/lidas`, { method: "PATCH" });
      window.dispatchEvent(new Event("mare:mensagens-atualizadas"));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar esta conversa.");
    }
  }, [idAtivo]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void carregarConversas(); }, 0);
    return () => window.clearTimeout(timer);
  }, [carregarConversas]);
  useEffect(() => {
    const inicio = window.setTimeout(() => { void carregarMensagens(); }, 0);
    const timer = window.setInterval(() => { void carregarMensagens(); }, 5000);
    return () => {
      window.clearTimeout(inicio);
      window.clearInterval(timer);
    };
  }, [carregarMensagens]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || !idAtivo) return;

    setTexto("");
    try {
      const enviada = await apiRequest<Mensagem>(`/conversas/${idAtivo}/mensagens`, {
        method: "POST",
        body: JSON.stringify({ texto: mensagem }),
      });
      setMensagens((atuais) => atuais.some((item) => item.id === enviada.id) ? atuais : [...atuais, enviada]);
      void carregarConversas();
    } catch (error) {
      setTexto(mensagem);
      setErro(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    }
  }

  async function atualizarConfiguracao(configuracao: { silenciada?: boolean; bloqueada?: boolean }) {
    if (!idAtivo || salvandoConfiguracao) return;
    const tipo = configuracao.silenciada !== undefined ? "silenciar" : "bloquear";
    setSalvandoConfiguracao(tipo);
    setErro("");

    try {
      const atualizada = await apiRequest<Pick<Conversa, "silenciadaPorMim" | "bloqueadaPorMim" | "bloqueadaPeloOutro">>(
        `/conversas/${idAtivo}/configuracoes`,
        { method: "PATCH", body: JSON.stringify(configuracao) },
      );
      setConversas((atuais) => atuais.map((conversa) => conversa.id === idAtivo ? { ...conversa, ...atualizada } : conversa));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível atualizar esta conversa.");
    } finally {
      setSalvandoConfiguracao(null);
    }
  }

  const conversaAtiva = conversas.find((conversa) => conversa.id === idAtivo);
  const formatarHoraMensagem = (valor: string) => formatarHora(valor);

  return (
    <PageLayout>
      <section
        className="flex h-[calc(100dvh-124px-env(safe-area-inset-top)-env(safe-area-inset-bottom))] min-h-0 w-full flex-col text-[var(--cor-texto-principal)] md:mt-6 md:h-[calc(100dvh-4rem)]"
        style={tecladoAberto && alturaVisualViewport > 0 ? { height: `${alturaVisualViewport}px` } : undefined}
      >
        {erro && (
          <p role="alert" className="mx-3 mt-2 shrink-0 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300 md:mx-5">
            {erro}<button className="ml-3 underline" onClick={() => setErro("")}>Fechar</button>
          </p>
        )}

        <div className="grid min-h-0 flex-1 overflow-hidden border-y border-[var(--cor-borda)] md:grid-cols-[minmax(260px,320px)_minmax(0,1fr)] md:border-t-0">
          <aside className={`${idAtivo ? "hidden md:block" : "block"} min-h-0 overflow-y-auto border-[var(--cor-borda)] md:border-r`}>
            <div className="sticky top-0 z-10 border-b border-[var(--cor-borda)] bg-[var(--cor-fundo)]/95 px-4 py-3 backdrop-blur md:px-5">
              <h1 className="flex items-center gap-2 text-lg font-semibold"><ChatCircleDotsIcon size={21} />Conversas</h1>
            </div>
            {carregando ? <p className="p-5 text-sm text-[var(--cor-texto-discreto)]">Carregando conversas...</p> : conversas.length ? conversas.map((conversa) => (
              <button
                key={conversa.id}
                onClick={() => { setErro(""); setParams({ id: String(conversa.id) }); }}
                className={`flex w-full cursor-pointer items-center gap-3 border-b border-[var(--cor-borda)] p-4 text-left hover:bg-white/5 ${conversa.id === idAtivo ? "bg-white/5" : ""}`}
              >
                {conversa.outroUsuario.foto
                  ? <img src={conversa.outroUsuario.foto} alt="" className="h-11 w-11 rounded-full object-cover" />
                  : <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--cor-fundo)]">{conversa.outroUsuario.nome[0]}</span>}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{conversa.outroUsuario.nome}</span>
                  <span className="block truncate text-xs text-[var(--cor-texto-discreto)]">
                    {conversa.bloqueadaPorMim || conversa.bloqueadaPeloOutro
                      ? "Conversa bloqueada"
                      : conversa.silenciadaPorMim
                        ? "Conversa silenciada"
                        : conversa.ultimaMensagem?.texto || `@${conversa.outroUsuario.username}`}
                  </span>
                </span>
                {conversa.mensagensNaoLidas > 0 && <span className="rounded-full bg-[var(--cor-destaque)] px-2 py-0.5 text-xs text-white">{conversa.mensagensNaoLidas}</span>}
              </button>
            )) : (
              <div className="p-5 text-sm text-[var(--cor-texto-secundario)]">
                Você ainda não tem conversas. É preciso que vocês se sigam para conversar.
                <Link to="/explorar" className="ml-1 text-[var(--cor-destaque)]">Explorar pessoas</Link>
              </div>
            )}
          </aside>

          <div className={`${idAtivo ? "flex" : "hidden md:flex"} min-h-0 min-w-0 flex-col`}>
            {conversaAtiva ? <>
              <header className="flex min-h-[60px] items-center gap-3 border-b border-[var(--cor-borda)] px-3 py-2 md:px-5">
                <button
                  type="button"
                  onClick={() => { setTexto(""); setParams({}); }}
                  aria-label="Voltar para a lista de conversas"
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg px-2 py-2 text-sm text-[var(--cor-destaque)] hover:bg-white/5 md:hidden"
                >
                  <span aria-hidden="true">‹</span><span>Conversas</span>
                </button>
                {conversaAtiva.outroUsuario.foto && <img src={conversaAtiva.outroUsuario.foto} alt="" className="h-10 w-10 rounded-full object-cover" />}
                <Link to={`/u/${conversaAtiva.outroUsuario.username}`} className="min-w-0 flex-1 cursor-pointer hover:text-[var(--cor-destaque)]">
                  <span className="block truncate font-semibold">{conversaAtiva.outroUsuario.nome}</span>
                  <span className="text-xs text-[var(--cor-texto-discreto)]">@{conversaAtiva.outroUsuario.username} · Ver perfil</span>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => void atualizarConfiguracao({ silenciada: !conversaAtiva.silenciadaPorMim })}
                    disabled={salvandoConfiguracao !== null}
                    aria-label={conversaAtiva.silenciadaPorMim ? "Reativar notificações desta conversa" : "Silenciar esta conversa"}
                    title={conversaAtiva.silenciadaPorMim ? "Reativar notificações" : "Silenciar conversa"}
                    className="grid h-10 w-10 cursor-pointer place-items-center rounded-xl text-[var(--cor-texto-secundario)] transition hover:bg-white/10 hover:text-[var(--cor-destaque)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {conversaAtiva.silenciadaPorMim ? <BellSlashIcon size={20} /> : <BellIcon size={20} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => void atualizarConfiguracao({ bloqueada: !conversaAtiva.bloqueadaPorMim })}
                    disabled={salvandoConfiguracao !== null}
                    aria-label={conversaAtiva.bloqueadaPorMim ? "Desbloquear conversa" : "Bloquear conversa"}
                    title={conversaAtiva.bloqueadaPorMim ? "Desbloquear conversa" : "Bloquear conversa"}
                    className={`grid h-10 w-10 cursor-pointer place-items-center rounded-xl transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50 ${conversaAtiva.bloqueadaPorMim ? "text-[var(--cor-destaque)]" : "text-[var(--cor-texto-secundario)] hover:text-rose-400"}`}
                  >
                    {conversaAtiva.bloqueadaPorMim ? <LockKeyIcon size={20} /> : <ProhibitIcon size={20} />}
                  </button>
                </div>
              </header>

              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {mensagens.map((mensagem, indice) => {
                  const novaData = indice === 0 || chaveDoDia(mensagens[indice - 1].criadaEm) !== chaveDoDia(mensagem.criadaEm);
                  const minha = mensagem.remetenteId === meuId;
                  return (
                    <div key={mensagem.id}>
                      {novaData && (
                        <div className="my-4 flex justify-center" role="separator" aria-label={formatarSeparadorDoDia(mensagem.criadaEm)}>
                          <span className="rounded-full border border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-3 py-1 text-xs text-[var(--cor-texto-discreto)]">
                            {formatarSeparadorDoDia(mensagem.criadaEm)}
                          </span>
                        </div>
                      )}
                      <div className={`mb-2 w-fit max-w-[min(82%,32rem)] rounded-2xl border px-3.5 py-2.5 shadow-sm ${minha
                        ? "ml-auto border-[#3678A9] bg-[#1C4770] text-white"
                        : "border-[var(--cor-borda)] bg-[var(--cor-superficie-elevada)] text-[var(--cor-texto-principal)]"}`}>
                        {mensagem.musica ? (
                          <Link to={`/musica/${mensagem.musica.id}`} className="flex cursor-pointer items-center gap-3">
                            {mensagem.musica.capa && <img src={mensagem.musica.capa} alt="" className="h-12 w-12 rounded-lg object-cover" />}
                            <span><b className="block">{mensagem.musica.titulo}</b><small className={minha ? "text-blue-100/80" : "text-[var(--cor-texto-secundario)]"}>{mensagem.musica.artista.nome}</small></span>
                          </Link>
                        ) : <p className="whitespace-pre-wrap break-words text-sm">{mensagem.texto}</p>}
                        <p className={`mt-1 text-right text-[10px] ${minha ? "text-blue-100/75" : "text-[var(--cor-texto-discreto)]"}`}>
                          {formatarHoraMensagem(mensagem.criadaEm)}{minha ? ` · ${mensagem.lidaEm ? "Lida" : "Enviada"}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {conversaAtiva.bloqueadaPorMim || conversaAtiva.bloqueadaPeloOutro
                ? <p className="border-t border-[var(--cor-borda)] p-4 text-center text-sm text-[var(--cor-texto-discreto)]">
                    {conversaAtiva.bloqueadaPorMim ? "Você bloqueou esta conversa. Use o botão no topo para desbloquear." : "Esta pessoa bloqueou a conversa."}
                  </p>
                : <form onSubmit={(event) => void enviar(event)} className="flex gap-2 border-t border-[var(--cor-borda)] p-3">
                    <input
                      value={texto}
                      onChange={(event) => setTexto(event.target.value)}
                      onFocus={focarCampoMensagem}
                      onBlur={desfocarCampoMensagem}
                      placeholder="Escreva uma mensagem"
                      maxLength={2000}
                      className="min-w-0 flex-1 rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-4 py-3 text-sm outline-none focus:border-[var(--cor-destaque)]"
                    />
                    <button aria-label="Enviar mensagem" disabled={!texto.trim()} className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl bg-[var(--cor-destaque)] text-white disabled:cursor-not-allowed disabled:opacity-50">
                      <PaperPlaneTiltIcon />
                    </button>
                  </form>}
            </> : <div className="grid flex-1 place-items-center text-sm text-[var(--cor-texto-discreto)]">Selecione uma conversa</div>}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}
