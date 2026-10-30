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
    `flex items-center gap-4 px-6 py-5 transition ${
      ativo
        ? "text-[#72B8F5] font-medium"
        : "text-white hover:bg-white/5"
    }`;

  return (
    <aside
      className="fixed left-0 top-0 z-50 flex h-dvh w-[340px] max-w-[85vw] flex-col border-r border-[#354052] bg-[#111420] text-white"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4">
          <Link to="/">
            <img src={logo} alt="Maré" className="h-12 max-h-14 w-auto" />
          </Link>
        </div>

        {/* Usuário */}
        <div className="mb-6 flex items-center gap-3 px-6">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#1a2130]">
            {usuario?.foto ? (
              <img
                src={usuario.foto}
                alt={usuario.nome}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon size={30} className="text-gray-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] text-white">
              {usuario?.nome || "Usuário"}
            </p>
            <p className="truncate text-[12px] text-[#697386]">
              @{usuario?.username || ""}
            </p>
          </div>
        </div>

        <hr className="border-[#354052]" />

        {/* Menu */}
        <nav className="flex flex-col py-2">
          <Link to="/home" className={estiloLink(linkAtivo("/home"))}>
            {linkAtivo("/home") ? (
              <HouseLineIcon size={22} weight="fill" />
            ) : (
              <HouseLineIcon size={22} />
            )}
            Início
          </Link>

          <Link
            to="/explorar"
            className={estiloLink(linkAtivo("/explorar"))}
          >
            <PlaylistIcon
              size={22}
            />
            Explorar
          </Link>

          <Link
            to="/notificacoes"
            className={estiloLink(linkAtivo("/notificacoes"))}
          >
            <BellIcon
              size={22}
              weight={linkAtivo("/notificacoes") ? "fill" : "regular"}
            />
            <span className="flex-1">Notificações</span>

            {naoLidas > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#58AAF0] px-1.5 text-[11px] text-white">
                {naoLidas > 99 ? "99+" : naoLidas}
              </span>
            )}
          </Link>

          <Link to="/salvos" className={estiloLink(linkAtivo("/salvos"))}>
            <BookmarkSimpleIcon
              size={22}
              weight={linkAtivo("/salvos") ? "fill" : "regular"}
            />
            Salvos
          </Link>

          <Link to="/perfil" className={estiloLink(linkAtivo("/perfil"))}>
            <UserIcon
              size={22}
              weight={linkAtivo("/perfil") ? "fill" : "regular"}
            />
            Perfil
          </Link>
        </nav>

        {/* Criar publicação */}
        <div className="px-6 py-4">
          <button
            onClick={handlePost}
            className="w-full cursor-pointer rounded-lg bg-[#58AAF0] py-3 font-medium text-white transition hover:bg-[#4a8bc2]"
          >
            Post
          </button>
        </div>
      </div>

      {/* Configurações */}
      <div className="shrink-0 border-t border-[#354052]">
        <Link
          to="/configuracoes"
          className={estiloLink(linkAtivo("/configuracoes"))}
        >
          <GearIcon
            size={22}
            weight={linkAtivo("/configuracoes") ? "fill" : "regular"}
          />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
