
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";
import { UserIcon } from "@phosphor-icons/react";

interface Usuario {
  nome: string;
  email: string;
  username: string;
}

function tokenExpirado(token: string | null): boolean {
  if (!token) return true;

  try {
    const payload = token.split(".")[1];

    if (!payload) return true;

    const base64 = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const dados = JSON.parse(atob(base64));

    return !dados.exp || dados.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function Navbar() {
  const navigate = useNavigate();

  const [showNavbar] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    function verificarSessao() {
      const token = localStorage.getItem("token");
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!token || tokenExpirado(token) || !usuarioSalvo) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
        return;
      }

      try {
        const dados: Usuario = JSON.parse(usuarioSalvo);

        if (!dados.username) {
          throw new Error("Dados do usuário inválidos.");
        }

        setUsuario(dados);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
      }
    }

    verificarSessao();

    window.addEventListener("storage", verificarSessao);
    window.addEventListener("focus", verificarSessao);

    return () => {
      window.removeEventListener("storage", verificarSessao);
      window.removeEventListener("focus", verificarSessao);
    };
  }, []);

  function abrirPerfil(
    evento: React.MouseEvent<HTMLAnchorElement>
  ) {
    const token = localStorage.getItem("token");

    if (tokenExpirado(token)) {
      evento.preventDefault();

      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      setUsuario(null);

      navigate("/login", { replace: true });
    }
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative inline-flex min-h-10 cursor-pointer items-center text-xs transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cor-destaque)] sm:text-base
    ${
      isActive
        ? "text-[var(--cor-destaque)]"
        : "text-[var(--cor-texto-secundario)] hover:text-[var(--cor-destaque)]"
    }
    after:content-['']
    after:absolute
    after:left-0
    after:bottom-[-6px]
    after:h-[2px]
    after:bg-[var(--cor-destaque)]
    after:transition-all
    after:duration-300
    ${
      isActive
        ? "after:w-full"
        : "after:w-0 hover:after:w-full"
    }`;

  return (
    <header
      className={`
        fixed
        top-0
        left-0
        w-full
        z-20
        min-h-[76px]
        bg-[#080a10]/65
        py-2
        backdrop-blur-md
        transition-transform
        duration-300
        ${showNavbar ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1472px] items-center justify-between gap-3 px-5 sm:px-10 lg:px-24">
        <Link to="/" className="shrink-0">
          <img
            src={logo}
            alt="Logo Maré"
            className="h-12 w-12 shrink-0 object-contain sm:h-[68px] sm:w-[84px]"
          />
        </Link>

      <nav className="flex flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-5 lg:gap-x-10">
        <NavLink to="/" end className={navLinkClass}>
          Início
        </NavLink>

        <NavLink to="/sobre" end className={navLinkClass}>
          Sobre
        </NavLink>

        <NavLink to="/contato" className={navLinkClass}>
          Contato
        </NavLink>

        <NavLink to="/faq" className={navLinkClass}>
          FAQ
        </NavLink>

        <NavLink
          to={usuario ? "/perfil" : "/login"}
          onClick={abrirPerfil}
          className="inline-flex gap-2 min-h-10 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[var(--cor-destaque)] px-3 py-2 text-xs font-semibold text-[#080a10] transition-colors duration-200 hover:bg-[#83c4fa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--cor-destaque)]  sm:px-5 sm:text-sm"
        >
          {usuario ? "Meu perfil" : "Entrar"}
                    <UserIcon size={20} />
        </NavLink>
      </nav>
      </div>
    </header>
  );
}

export default Navbar;
