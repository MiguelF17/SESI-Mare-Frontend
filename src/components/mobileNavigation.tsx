import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HouseLineIcon,
  PlaylistIcon,
  BookmarkSimpleIcon,
  UserIcon,
  GearIcon,
  BellIcon,
} from "@phosphor-icons/react";
import { apiRequest } from "../api";

export default function MobileNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [naoLidas, setNaoLidas] = useState(0);
  const ativo = (path: string) => location.pathname === path;
  const item = (path: string) =>
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] transition ${ativo(path) ? "font-medium text-[var(--cor-destaque)]" : "text-[var(--cor-texto-principal)]"}`;

  useEffect(() => {
    async function buscarNotificacoes() {
      try {
        const notificacoes = await apiRequest<{ lida: boolean }[]>("/notificacoes");
        setNaoLidas(notificacoes.filter((notificacao) => !notificacao.lida).length);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    }
    buscarNotificacoes();
  }, []);

  return (
    <>
      <div className="fixed right-4 top-[max(16px,env(safe-area-inset-top))] z-[40] flex items-center gap-2 md:hidden">
        <Link to="/notificacoes" aria-label="Notificações" title="Notificações" className={`relative flex h-11 w-11 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie)] text-[var(--cor-texto-principal)] shadow-md ${ativo("/notificacoes") ? "text-[var(--cor-destaque)]" : ""}`}>
          <BellIcon size={22} weight={ativo("/notificacoes") ? "fill" : "regular"} />
          {naoLidas > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 -translate-y-1/4 translate-x-1/4 items-center justify-center rounded-full bg-[var(--cor-destaque)] px-1 text-[10px] text-white">{naoLidas > 99 ? "99+" : naoLidas}</span>}
        </Link>
        <Link to="/configuracoes" aria-label="Configurações" title="Configurações" className={`flex h-11 w-11 items-center justify-center rounded-full border border-[var(--cor-borda)] bg-[var(--cor-superficie)] text-[var(--cor-texto-principal)] shadow-md ${ativo("/configuracoes") ? "text-[var(--cor-destaque)]" : ""}`}>
          <GearIcon size={22} weight={ativo("/configuracoes") ? "fill" : "regular"} />
        </Link>
      </div>

      <nav aria-label="Navegação mobile" className="fixed inset-x-0 bottom-0 z-50 flex h-[calc(72px+env(safe-area-inset-bottom))] items-center justify-around border-t border-[var(--cor-borda)] bg-[var(--cor-superficie)] px-1.5 pb-[env(safe-area-inset-bottom)] text-[var(--cor-texto-principal)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl md:hidden">
        <Link to="/home" aria-label="Início" title="Início" aria-current={ativo("/home") ? "page" : undefined} className={item("/home")}><HouseLineIcon size={22} weight={ativo("/home") ? "fill" : "regular"} /><span>Início</span></Link>
        <Link to="/explorar" aria-label="Explorar" title="Explorar" className={item("/explorar")}><PlaylistIcon size={22} /><span>Explorar</span></Link>
        <button onClick={() => navigate("/criarpost")} aria-label="Criar post" title="Criar post" className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[10px] text-[var(--cor-texto-principal)]"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cor-destaque)] text-2xl leading-none text-white shadow-lg shadow-[var(--cor-destaque)]/30">+</span><span>Criar post</span></button>
        <Link to="/salvos" aria-label="Salvos" title="Salvos" className={item("/salvos")}><BookmarkSimpleIcon size={22} weight={ativo("/salvos") ? "fill" : "regular"} /><span>Salvos</span></Link>
        <Link to="/perfil" aria-label="Perfil" title="Perfil" className={item("/perfil")}><UserIcon size={22} weight={ativo("/perfil") ? "fill" : "regular"} /><span>Perfil</span></Link>
      </nav>
    </>
  );
}
