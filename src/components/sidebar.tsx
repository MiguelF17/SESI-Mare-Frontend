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

import logo from "../assets/logoSidebar.png";
import { useMeuPerfil } from "../hooks/useMeuPerfil";
import { apiRequest } from "../api";

export default function Sidebar() {
  const { usuario } = useMeuPerfil();
  const navigate = useNavigate();
  const location = useLocation();

  const [naoLidas, setNaoLidas] = useState(0);

  useEffect(() => {
    async function buscarNotificacoes() {
      try {
        const notificacoes = await apiRequest<{ lida: boolean }[]>(
          "/notificacoes"
        );

        setNaoLidas(
          notificacoes.filter((notificacao) => !notificacao.lida).length
        );
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    }

    buscarNotificacoes();
  }, []);

  function handlePost() {
    navigate("/criarpost");
  }

  function linkAtivo(caminho: string) {
    return location.pathname === caminho;
  }

  const estiloLink = (ativo: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 rounded-xl px-0 py-1.5 text-[10px] transition md:flex-none md:flex-row md:justify-start md:gap-4 md:rounded-none md:px-6 md:py-5 md:text-base ${
      ativo
        ? "bg-[var(--cor-destaque)]/10 font-medium text-[var(--cor-destaque)] md:bg-transparent"
        : "text-[var(--cor-texto-principal)] hover:bg-white/5"
    }`;

  return (
    <aside
      className="fixed inset-x-0 bottom-0 top-auto z-50 flex h-[calc(84px+env(safe-area-inset-bottom))] w-full flex-row items-center border-t border-[var(--cor-borda)] bg-[var(--cor-superficie)] px-1.5 pb-[env(safe-area-inset-bottom)] text-[var(--cor-texto-principal)] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl md:inset-y-0 md:left-0 md:right-auto md:top-0 md:h-dvh md:w-[clamp(220px,30vw,340px)] md:flex-col md:items-stretch md:border-r md:border-t-0 md:px-0 md:pb-0 md:shadow-none md:backdrop-blur-none"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
    >
      <div className="flex min-h-0 flex-1 items-center justify-around overflow-hidden md:block md:flex-1">
        {/* Logo */}
        <div className="hidden items-center justify-center gap-2 px-2 py-4 md:flex md:justify-start md:px-6">
          <Link to="/">
            <img
              src={logo}
              alt="Maré"
              className="h-9 max-h-14 w-10 object-contain md:h-12 md:w-auto"
            />
          </Link>
        </div>

        {/* Usuário */}
        <div className="mb-4 hidden items-center justify-center gap-3 px-2 md:flex md:mb-6 md:justify-start md:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a2130] md:h-16 md:w-16">
            {usuario?.foto ? (
              <img
                src={usuario.foto}
                alt={usuario.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon size={30} className="text-[var(--cor-texto-cinza-400)]" />
            )}
          </div>

          <div className="hidden min-w-0 flex-1 md:block">
            <p className="truncate text-[15px] text-[var(--cor-texto-principal)]">
              {usuario?.nome || "Usuário"}
            </p>
            <p className="truncate text-[12px] text-[var(--cor-texto-discreto)]">
              @{usuario?.username || ""}
            </p>
          </div>
        </div>

        <hr className="hidden border-[var(--cor-borda)] md:block" />

        {/* Menu */}
        <nav className="flex min-w-0 flex-1 items-center justify-around gap-0.5 py-0 md:flex-col md:items-stretch md:gap-0 md:py-2">
          <Link
            to="/home"
            aria-label="Início"
            title="Início"
            aria-current={linkAtivo("/home") ? "page" : undefined}
            className={estiloLink(linkAtivo("/home"))}
          >
            {linkAtivo("/home") ? (
              <HouseLineIcon size={22} weight="fill" />
            ) : (
              <HouseLineIcon size={22} />
            )}
            <span className="md:inline">Início</span>
          </Link>

          <Link
            to="/explorar"
            aria-label="Explorar"
            title="Explorar"
            className={estiloLink(linkAtivo("/explorar"))}
          >
            <PlaylistIcon
              size={22}
            />
            <span className="md:inline">Explorar</span>
          </Link>

          <span aria-hidden="true" className="w-12 shrink-0 md:hidden" />

          <Link
            to="/notificacoes"
            aria-label="Notificações"
            title="Notificações"
            className={estiloLink(linkAtivo("/notificacoes"))}
          >
            <BellIcon
              size={22}
              weight={linkAtivo("/notificacoes") ? "fill" : "regular"}
            />
            <span className="md:flex-1 md:inline">Notificações</span>

            {naoLidas > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--cor-destaque)] px-1.5 text-[11px] text-[var(--cor-texto-principal)]">
                {naoLidas > 99 ? "99+" : naoLidas}
              </span>
            )}
          </Link>

          <Link
            to="/salvos"
            aria-label="Salvos"
            title="Salvos"
            className={estiloLink(linkAtivo("/salvos"))}
          >
            <BookmarkSimpleIcon
              size={22}
              weight={linkAtivo("/salvos") ? "fill" : "regular"}
            />
            <span className="md:inline">Salvos</span>
          </Link>

          <Link to="/perfil" aria-label="Perfil" title="Perfil" className={estiloLink(linkAtivo("/perfil"))}>
            <UserIcon
              size={22}
              weight={linkAtivo("/perfil") ? "fill" : "regular"}
            />
            <span className="md:inline">Perfil</span>
          </Link>
        </nav>

        {/* Criar publicação */}
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 md:static md:block md:translate-x-0 md:translate-y-0 md:px-6 md:py-4">
          <button
            onClick={handlePost}
            aria-label="Criar publicação"
            title="Criar publicação"
            className="h-12 w-12 cursor-pointer rounded-full border-4 border-[var(--cor-superficie)] bg-[var(--cor-destaque)] text-2xl font-medium text-white shadow-lg shadow-[var(--cor-destaque)]/30 transition hover:bg-[var(--cor-destaque-forte)] md:h-auto md:w-full md:rounded-lg md:border-0 md:py-3 md:text-sm md:text-white md:shadow-none"
          >
            <span className="hidden md:inline">Post</span>
            <span className="md:hidden" aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      {/* Configurações */}
      <div className="flex w-[52px] shrink-0 items-center border-l border-[var(--cor-borda)] md:w-full md:border-l-0 md:border-t">
        <Link
          to="/configuracoes"
          aria-label="Configurações"
          title="Configurações"
          className={estiloLink(linkAtivo("/configuracoes"))}
        >
          <GearIcon
            size={22}
            weight={linkAtivo("/configuracoes") ? "fill" : "regular"}
          />
          <span className="md:inline">Config.</span>
        </Link>
      </div>
    </aside>
  );
}
