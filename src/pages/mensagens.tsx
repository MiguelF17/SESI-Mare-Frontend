import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChatCircleDotsIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";
import PageLayout from "../components/pageLayout";
import { apiRequest } from "../api";

type Pessoa = { id: number; nome: string; username: string; foto?: string | null };
type Mensagem = { id: number; remetenteId: number; texto: string; criadaEm: string; lidaEm?: string | null; remetente: Pessoa; musica?: { id: number; titulo: string; capa?: string | null; artista: { nome: string } } | null };
type Conversa = { id: number; outroUsuario: Pessoa; ultimaMensagem: { texto: string } | null; mensagensNaoLidas: number; bloqueadaPorMim: boolean; bloqueadaPeloOutro: boolean; silenciadaPorMim: boolean };

export default function Mensagens() {
  const [params, setParams] = useSearchParams();
  const idAtivo = Number(params.get("id"));
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [meuId, setMeuId] = useState(0);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregarConversas = useCallback(async () => {
    try {
      const [lista, perfil] = await Promise.all([
        apiRequest<Conversa[]>("/conversas"),
        apiRequest<Pessoa>("/usuarios/me"),
      ]);
      setConversas(lista);
      setMeuId(perfil.id);
      if (!idAtivo && lista.length) setParams({ id: String(lista[0].id) }, { replace: true });
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar as conversas.");
    } finally { setCarregando(false); }
  }, [idAtivo, setParams]);

  const carregarMensagens = useCallback(async () => {
    if (!idAtivo) { setMensagens([]); return; }
    try {
      const dados = await apiRequest<Mensagem[]>(`/conversas/${idAtivo}/mensagens`);
      setMensagens(dados);
      await apiRequest(`/conversas/${idAtivo}/lidas`, { method: "PATCH" });
      window.dispatchEvent(new Event("mare:mensagens-atualizadas"));
    } catch (error) {
      setErro(error instanceof Error ? error.message : "Não foi possível carregar esta conversa.");
    }
  }, [idAtivo]);

  useEffect(() => { void carregarConversas(); }, [carregarConversas]);
  useEffect(() => {
    void carregarMensagens();
    const timer = window.setInterval(() => { void carregarMensagens(); }, 5000);
    return () => window.clearInterval(timer);
  }, [carregarMensagens]);

  async function enviar(event: FormEvent) {
    event.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || !idAtivo) return;
    setTexto("");
    try {
      const enviada = await apiRequest<Mensagem>(`/conversas/${idAtivo}/mensagens`, { method: "POST", body: JSON.stringify({ texto: mensagem }) });
      setMensagens((atuais) => atuais.some((item) => item.id === enviada.id) ? atuais : [...atuais, enviada]);
      void carregarConversas();
    } catch (error) {
      setTexto(mensagem);
      setErro(error instanceof Error ? error.message : "Não foi possível enviar a mensagem.");
    }
  }

  const conversaAtiva = conversas.find((conversa) => conversa.id === idAtivo);
  const formatarHora = (valor: string) => new Date(valor).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return <PageLayout><section className="mx-auto flex h-[calc(100dvh-4rem)] max-w-6xl flex-col px-3 py-4 text-[var(--cor-texto-principal)] sm:px-6 md:pt-8">
    <h1 className="mb-4 flex items-center gap-2 text-2xl font-semibold"><ChatCircleDotsIcon size={26} />Conversas</h1>
    {erro && <p role="alert" className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{erro}<button className="ml-3 underline" onClick={() => setErro("")}>Fechar</button></p>}
    <div className="grid min-h-0 flex-1 overflow-hidden rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] md:grid-cols-[minmax(230px,0.8fr)_1.5fr]">
      <aside className={`${idAtivo ? "hidden md:block" : ""} overflow-y-auto border-[var(--cor-borda)] md:border-r`}>
        {carregando ? <p className="p-5 text-sm text-[var(--cor-texto-discreto)]">Carregando conversas...</p> : conversas.length ? conversas.map((c) => <button key={c.id} onClick={() => { setErro(""); setParams({ id: String(c.id) }); }} className={`flex w-full items-center gap-3 border-b border-[var(--cor-borda)] p-4 text-left hover:bg-white/5 ${c.id === idAtivo ? "bg-white/5" : ""}`}>
          {c.outroUsuario.foto ? <img src={c.outroUsuario.foto} alt="" className="h-11 w-11 rounded-full object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--cor-fundo)]">{c.outroUsuario.nome[0]}</span>}
          <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.outroUsuario.nome}</span><span className="block truncate text-xs text-[var(--cor-texto-discreto)]">{c.ultimaMensagem?.texto || `@${c.outroUsuario.username}`}</span></span>
          {c.mensagensNaoLidas > 0 && <span className="rounded-full bg-[var(--cor-destaque)] px-2 py-0.5 text-xs text-white">{c.mensagensNaoLidas}</span>}
        </button>) : <div className="p-5 text-sm text-[var(--cor-texto-secundario)]">Você ainda não tem conversas. É preciso que vocês se sigam para conversar.<Link to="/explorar" className="ml-1 text-[var(--cor-destaque)]">Explorar pessoas</Link></div>}
      </aside>
      <div className={`${!idAtivo ? "hidden md:flex" : "flex"} min-h-0 flex-col`}>
        {conversaAtiva ? <>
          <header className="flex items-center gap-3 border-b border-[var(--cor-borda)] p-3">
            <Link to={`/u/${conversaAtiva.outroUsuario.username}`} aria-label="Voltar às conversas" className="md:hidden">‹</Link>
            {conversaAtiva.outroUsuario.foto && <img src={conversaAtiva.outroUsuario.foto} alt="" className="h-10 w-10 rounded-full object-cover" />}
            <Link to={`/u/${conversaAtiva.outroUsuario.username}`} className="min-w-0 hover:text-[var(--cor-destaque)]"><span className="block truncate font-semibold">{conversaAtiva.outroUsuario.nome}</span><span className="text-xs text-[var(--cor-texto-discreto)]">@{conversaAtiva.outroUsuario.username} · Ver perfil</span></Link>
          </header>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">{mensagens.map((m) => <div key={m.id} className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 ${m.remetenteId === meuId ? "ml-auto bg-[#1c4770]" : "bg-[var(--cor-fundo)]"}`}>
            {m.musica ? <Link to={`/musica/${m.musica.id}`} className="flex items-center gap-3">{m.musica.capa && <img src={m.musica.capa} alt="" className="h-12 w-12 rounded-lg object-cover" />}<span><b className="block">{m.musica.titulo}</b><small>{m.musica.artista.nome}</small></span></Link> : <p className="whitespace-pre-wrap break-words text-sm">{m.texto}</p>}
            <p className="mt-1 text-right text-[10px] text-[var(--cor-texto-discreto)]">{formatarHora(m.criadaEm)}{m.remetenteId === meuId ? ` · ${m.lidaEm ? "Lida" : "Enviada"}` : ""}</p>
          </div>)}</div>
          {conversaAtiva.bloqueadaPorMim || conversaAtiva.bloqueadaPeloOutro ? <p className="border-t border-[var(--cor-borda)] p-4 text-center text-sm text-[var(--cor-texto-discreto)]">Esta conversa está bloqueada.</p> : <form onSubmit={(e) => void enviar(e)} className="flex gap-2 border-t border-[var(--cor-borda)] p-3"><input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escreva uma mensagem" maxLength={2000} className="min-w-0 flex-1 rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-4 py-3 text-sm outline-none focus:border-[var(--cor-destaque)]" /><button aria-label="Enviar mensagem" disabled={!texto.trim()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--cor-destaque)] text-white disabled:opacity-50"><PaperPlaneTiltIcon /></button></form>}
        </> : <div className="grid flex-1 place-items-center text-sm text-[var(--cor-texto-discreto)]">Selecione uma conversa</div>}
      </div>
    </div>
  </section></PageLayout>;
}
