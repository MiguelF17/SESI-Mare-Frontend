import { UserIcon } from "@phosphor-icons/react";
import { Link, NavLink} from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

interface Usuario {
  nome: string;
  email: string;
  username: string;
}

function Navbar() {
  const [showNavbar, setShowNavbar] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    function handleScroll() {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // descendo
        setShowNavbar(false);
      } else {
        // subindo
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
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
          className={({ isActive }) =>
            `flex gap-4 transition duration-300 ${isActive
              ? "text-[#58AAF0]"
              : "text-[#E4EFFF] hover:text-[#58AAF0]"
            }`
          }
        >
          {usuario && <p>Olá, {usuario.username}</p>}

          <UserIcon size={24} strokeWidth={1.5} />
        </NavLink>
      </nav>
    </header>
  );
}

export default Navbar;
