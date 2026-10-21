
import { UserIcon } from "@phosphor-icons/react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

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
    `relative text-[16px] transition duration-300
    ${
      isActive
        ? "text-[#58AAF0]"
        : "text-[#E4EFFF] hover:text-[#58AAF0]"
    }
    after:content-['']
    after:absolute
    after:left-0
    after:bottom-[-6px]
    after:h-[2px]
    after:bg-[#58AAF0]
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
        z-50
        h-[100px]
        bg-[#080A10]
        px-8
        flex
        items-center
        justify-between
        transition-transform
        duration-300
        ${showNavbar ? "translate-y-0" : "-translate-y-full"}
      `}
    >
      <Link to="/">
        <img
          src={logo}
          alt="Logo Maré"
          className="h-[80px] w-[100px] object-contain"
        />
      </Link>

      <nav className="flex items-center gap-16">
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
          to="/perfil"
          onClick={abrirPerfil}
          className={({ isActive }) =>
            `flex gap-4 transition duration-300 ${
              isActive
                ? "text-[#58AAF0]"
                : "text-[#E4EFFF] hover:text-[#58AAF0]"
            }`
          }
        >
          {usuario && <p>Olá, {usuario.username}</p>}

          <UserIcon size={24} weight="regular" />
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
