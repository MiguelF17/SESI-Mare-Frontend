import logo from "../assets/logoSidebar.png";
import { Link, useNavigate } from "react-router-dom";

import {
  HouseLineIcon,
  PlaylistIcon,
  BookmarkSimpleIcon,
  UserIcon,
  GearIcon,
} from "@phosphor-icons/react";
import { useMeuPerfil } from "../hooks/useMeuPerfil";

interface Usuario {
  id: number;
  username: string;
  nome: string;
  email: string;
  foto: string | null;
}
export default function Sidebar() {
  const { usuario } = useMeuPerfil();
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");

    navigate("/login");
  }

  function Post() {
    navigate("/criarpost");
  }

  return (
    <aside
      className="w-85 h-screen bg-[#111420] border-r border-[#354052] text-white flex flex-col justify-between fixed top-0 left-0 z-50"
      style={{ fontFamily: "Inter, sans-serif", fontWeight: 300 }}
    >
      {/* TOPO */}
      <div>
        {/* Logo */}
        <div className="p-6  flex items-center gap-2 cursor-pointer">
          <Link to="/" className="flex items-center">
            <img src={logo} className="h-16" />
          </Link>
        </div>

        {/* MENU */}
        <nav className="mt-4 flex flex-col">
          <div className="px-8 mb-6 flex items-center gap-2">
            <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center rounded-full bg-[#1a2130]">
              {usuario?.foto ? (
                <img
                  src={usuario.foto}
                  alt={usuario.nome}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <UserIcon size={34} className="text-gray-400" />
                </div>
              )}
            </div>

            <div>
              <p className="text-white text-[16px]"> {usuario?.nome || "Usuário"}</p>

              <p className="text-[#697386] text-[12px]">@{usuario?.username}</p>
            </div>
          </div>

          <hr className="border-r border-[#354052]" />

          <Link
            to="/home"
            className="flex items-center gap-4 px-8 py-6 hover:bg-white/5 transition"
          >
            <HouseLineIcon size={20} />
            Início
          </Link>

          <Link
            to="/explorar"
            className="flex items-center gap-4 px-8 py-6 hover:bg-white/5 transition"
          >
            <PlaylistIcon size={20} />
            Explorar
          </Link>

          <Link
            to="/salvos"
            className="flex items-center gap-4 px-8 py-6 hover:bg-white/5 transition"
          >
            <BookmarkSimpleIcon size={20} />
            Salvos
          </Link>

          <Link
            to="/perfil"
            className="flex items-center gap-4 px-8 py-6 hover:bg-white/5 transition"
          >
            <UserIcon size={20} />
            Perfil
          </Link>
        </nav>

        {/* Post */}
        <div className="px-8 my-6">
          <button
            onClick={Post}
            className="
      w-full
      bg-[#58AAF0]
      text-white
      py-3
      rounded-lg
      hover:bg-[#4a8bc2]
      transition
      cursor-pointer
      font-medium
    "
          >
            Post
          </button>
        </div>
      </div>

      <Link
        to="/configuracoes"
        className="flex gap-4 px-8 py-6 cursor-pointer  hover:bg-white/5 transition"
      >
        <GearIcon size={20} />
        Configurações
      </Link>
    </aside>
  );
}
