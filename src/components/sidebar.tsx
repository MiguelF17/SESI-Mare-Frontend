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
    `flex items-center justify-center gap-4 px-2 py-4 transition md:justify-start md:px-6 md:py-5 ${
      ativo
        ? "text-[#72B8F5] font-medium"
        : "text-[var(--cor-texto-principal)] hover:bg-white/5"
    }`;

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-dvh w-16 flex-col border-r border-[var(--cor-borda)] bg-[var(--cor-superficie)] text-[var(--cor-texto-principal)] md:w-[clamp(220px,30vw,340px)]"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
    >
      <div className="min-h-0 flex-1 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 px-2 py-4 md:justify-start md:px-6">
          <Link to="/">
            <img
              src={logo}
              alt="Maré"
              className="h-9 max-h-14 w-10 object-contain md:h-12 md:w-auto"
            />
          </Link>
        </div>

        {/* Usuário */}
        <div className="mb-4 flex items-center justify-center gap-3 px-2 md:mb-6 md:justify-start md:px-6">
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

        <hr className="border-[var(--cor-borda)]" />

        {/* Menu */}
        <nav className="flex flex-col py-2">
          <Link
            to="/home"
            aria-label="Início"
            title="Início"
            className={estiloLink(linkAtivo("/home"))}
          >
            {linkAtivo("/home") ? (
              <HouseLineIcon size={22} weight="fill" />
            ) : (
              <HouseLineIcon size={22} />
            )}
            <span className="hidden md:inline">Início</span>
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
            <span className="hidden md:inline">Explorar</span>
          </Link>

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
            <span className="hidden flex-1 md:inline">Notificações</span>

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
            <span className="hidden md:inline">Salvos</span>
          </Link>

          <Link to="/perfil" aria-label="Perfil" title="Perfil" className={estiloLink(linkAtivo("/perfil"))}>
            <UserIcon
              size={22}
              weight={linkAtivo("/perfil") ? "fill" : "regular"}
            />
            <span className="hidden md:inline">Perfil</span>
          </Link>
        </nav>

        {/* Criar publicação */}
        <div className="px-2 py-3 md:px-6 md:py-4">
          <button
            onClick={handlePost}
            aria-label="Criar publicação"
            title="Criar publicação"
            className="w-full cursor-pointer rounded-lg bg-[var(--cor-destaque)] py-3 font-medium text-[var(--cor-texto-principal)] transition hover:bg-[#4a8bc2]"
          >
            <span className="hidden md:inline">Post</span>
            <span className="md:hidden" aria-hidden="true">+</span>
          </button>
        </div>
      </div>

      {/* Configurações */}
      <div className="shrink-0 border-t border-[var(--cor-borda)]">
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
          <span className="hidden md:inline">Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
