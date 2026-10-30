import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HouseLineIcon,
  PlaylistIcon,
  BookmarkSimpleIcon,
  UserIcon,
  GearIcon,
  BellIcon,
} from "@phosphor-icons/react";
import logo from "../assets/logoSidebar.png";
import { useMeuPerfil } from "../hooks/useMeuPerfil";

export default function Sidebar() {
  const { usuario } = useMeuPerfil();
  const navigate = useNavigate();
  const location = useLocation();
  const ativo = (path: string) => location.pathname === path;
  const item = (path: string) =>
    `flex items-center gap-4 px-6 py-5 text-base transition hover:bg-white/5 ${ativo(path) ? "font-medium text-[var(--cor-destaque)]" : "text-[var(--cor-texto-principal)]"}`;

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden h-dvh w-[clamp(220px,30vw,340px)] flex-col border-r border-[var(--cor-borda)] bg-[var(--cor-superficie)] text-[var(--cor-texto-principal)] md:flex" style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}>
      <div className="flex items-center px-6 py-4">
        <Link to="/"><img src={logo} alt="Maré" className="h-12 w-auto object-contain" /></Link>
      </div>
      <div className="mb-6 flex items-center gap-3 px-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a2130]">
          {usuario?.foto ? <img src={usuario.foto} alt={usuario.nome} className="h-full w-full object-cover" /> : <UserIcon size={30} className="text-[var(--cor-texto-cinza-400)]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px]">{usuario?.nome || "Usuário"}</p>
          <p className="truncate text-[12px] text-[var(--cor-texto-discreto)]">@{usuario?.username || ""}</p>
        </div>
      </div>
      <hr className="border-[var(--cor-borda)]" />
      <nav className="flex flex-1 flex-col py-2">
        <Link to="/home" aria-label="Início" aria-current={ativo("/home") ? "page" : undefined} className={item("/home")}><HouseLineIcon size={22} weight={ativo("/home") ? "fill" : "regular"} />Início</Link>
        <Link to="/explorar" aria-label="Explorar" className={item("/explorar")}><PlaylistIcon size={22} />Explorar</Link>
        <Link to="/notificacoes" aria-label="Notificações" className={item("/notificacoes")}><BellIcon size={22} weight={ativo("/notificacoes") ? "fill" : "regular"} />Notificações</Link>
        <Link to="/salvos" aria-label="Salvos" className={item("/salvos")}><BookmarkSimpleIcon size={22} weight={ativo("/salvos") ? "fill" : "regular"} />Salvos</Link>
        <Link to="/perfil" aria-label="Perfil" className={item("/perfil")}><UserIcon size={22} weight={ativo("/perfil") ? "fill" : "regular"} />Perfil</Link>
        <button onClick={() => navigate("/criarpost")} aria-label="Criar publicação" className="mx-6 my-4 cursor-pointer rounded-lg bg-[var(--cor-destaque)] py-3 text-sm text-white transition hover:bg-[var(--cor-destaque-forte)]">Criar post</button>
      </nav>
      <div className="border-t border-[var(--cor-borda)]"><Link to="/configuracoes" aria-label="Configurações" className={`${item("/configuracoes")} w-full`}><GearIcon size={22} weight={ativo("/configuracoes") ? "fill" : "regular"} />Configurações</Link></div>
    </aside>
  );
}
