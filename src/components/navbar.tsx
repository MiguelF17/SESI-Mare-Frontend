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
    const dados = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    return !dados.exp || dados.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function Navbar() {
  const navigate = useNavigate();

  const [showNavbar, setShowNavbar] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    const verificarSessao = () => {
      const token = localStorage.getItem("token");
      const usuarioSalvo = localStorage.getItem("usuario");

      if (!token || tokenExpirado(token) || !usuarioSalvo) {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
        return;
      }

      try {
        setUsuario(JSON.parse(usuarioSalvo));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        setUsuario(null);
      }
    };

    verificarSessao();

    // Atualiza também quando outra aba altera a sessão.
    window.addEventListener("storage", verificarSessao);

    // Confere novamente quando o usuário volta para a aba.
    window.addEventListener("focus", verificarSessao);

    return () => {
      window.removeEventListener("storage", verificarSessao);
      window.removeEventListener("focus", verificarSessao);
    };
  }, []);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("usuario");

    if (usuarioSalvo) {
      setUsuario(JSON.parse(usuarioSalvo));
    }
  }, []);


  /* Classe dos links da navbar */
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-[16px] transition duration-300
  ${isActive
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
  ${isActive
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
      {/* LOGO */}

      <Link to="/">
        <img
          src={logo}
          alt="Logo Maré"
          className="
                        w-[100px]
                        h-[80px]
                        object-contain
                    "
        />
      </Link>

      {/* MENU */}

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

        {/* PERFIL */}

        <NavLink
          to="/perfil"
          onClick={(e) => {
            const token = localStorage.getItem("token");

            if (tokenExpirado(token)) {
              e.preventDefault();

              localStorage.removeItem("token");
              localStorage.removeItem("usuario");
              setUsuario(null);

              navigate("/login", { replace: true });
            }
          }}
          className={({ isActive }) =>
            `flex gap-4 transition duration-300 ${isActive
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
